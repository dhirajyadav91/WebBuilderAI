import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import {
  Code,
  Eye,
  File,
  Moon,
  Sun,
  Zap,
  Smartphone,
  Monitor,
  Download,
  Rocket,
  Loader2,
  RefreshCw,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import LookUp from "../utils/LookUp";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import SandpackSync from "./SandpackSync ";
import isEqual from "lodash.isequal";
import axiosClient from "../utils/axiosClient";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate
} from "motion/react";

function CodeView({
  prompt,
  chatId,
  initialFiles = {},
  sandboxFiles,
  setSandboxFiles,
  chatLoading,
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [showPreviewMsg, setShowPreviewMsg] = useState(false);
  const [previewCountdown, setPreviewCountdown] = useState(5);
  const [deploying, setDeploying] = useState(false);
  const [istheme, setTheme] = useState(true);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Motion values
  const deployProgress = useMotionValue(0);
  const glowIntensity = useMotionValue(0);

  const handleSendPrompt = useCallback(async () => {
    if (!prompt) return;

    setLoading(true);
    setGenerationComplete(false);
    setProgress(0);
    setShowFeedbackModal(false);

    try {
      console.log("🚀 Starting code generation for:", prompt);
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/chat/code/${chatId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ message: prompt }),
        }
      );

      // Progress simulation for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success && data.files) {
        console.log("✅ Code generation completed!");
        
        const sandpackFiles = {};
        data.files.forEach(({ path, content }) => {
          sandpackFiles[path] = { code: content };
        });

        const merged = {
          ...sandboxFiles,
          ...sandpackFiles,
        };

        if (!isEqual(sandboxFiles, merged)) {
          setSandboxFiles(merged);
        }

        // Complete progress and show success
        setProgress(100);
        setTimeout(() => {
          setGenerationComplete(true);
          setShowFeedbackModal(true);
        }, 500);

      } else {
        console.warn("Unexpected response format:", data);
        setProgress(100);
        setGenerationComplete(true);
      }
    } catch (err) {
      console.error("Error during code generation:", err);
      setProgress(100);
      setGenerationComplete(true);
    } finally {
      setLoading(false);
    }
  }, [prompt, chatId, sandboxFiles, setSandboxFiles]);

  // Effect for initial files
  useEffect(() => {
    setSandboxFiles(initialFiles);
  }, [initialFiles, setSandboxFiles]);

  // Effect for prompt handling
  useEffect(() => {
    if (!prompt) return;

    const timeout = setTimeout(() => {
      handleSendPrompt();
    }, 500);

    return () => clearTimeout(timeout);
  }, [prompt, handleSendPrompt]);

  const allFiles = useMemo(
    () => ({
      ...LookUp?.DefaultFile,
      ...sandboxFiles,
    }),
    [sandboxFiles]
  );

  const handleDownloadAll = useCallback(() => {
    const zip = new JSZip();
    Object.entries(allFiles).forEach(([path, { code }]) => {
      zip.file(path.replace(/^\//, ""), code);
    });
    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, "project.zip");
    });
  }, [allFiles]);

  const handleDeploy = useCallback(async () => {
    setDeploying(true);
    animate(deployProgress, 100, { duration: 3, ease: "easeInOut" });
    animate(glowIntensity, 1, { duration: 0.5 });

    try {
      const files = Object.entries(allFiles).map(([path, { code }]) => ({
        path,
        content: code,
      }));

      const res = await axiosClient.post("/deploy", { files });

      if (res.data.success && res.data.url) {
        animate(glowIntensity, 0, { duration: 0.5 });
        setTimeout(() => {
          window.open(res.data.url, "_blank");
        }, 500);
      } else {
        alert("❌ Failed to deploy. Check console");
        console.log(res.data);
      }
    } catch (err) {
      console.error("Deployment Error:", err);
      alert("❌ Error during deployment.");
    } finally {
      setDeploying(false);
      deployProgress.set(0);
    }
  }, [allFiles, deployProgress, glowIntensity]);

  const handleRefreshPreview = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const handleFeedback = (needsChanges) => {
    setShowFeedbackModal(false);
    if (needsChanges) {
      // User wants changes - you can implement this logic
      alert("Please describe what changes you need in the prompt!");
    }
  };

  const glowShadow = useTransform(
    glowIntensity, 
    [0, 1], 
    ['0 0 0px rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.5)']
  );

  if (chatLoading) {
    return (
      <div className="w-full h-full rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-cyan-400 font-semibold">Loading Editor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between bg-gray-900/80 backdrop-blur-2xl border-b border-white/10 p-4 lg:p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 lg:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("code")}
            className={`flex items-center px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 ${
              activeTab === "code"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20"
            }`}
          >
            <Code className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Code Editor
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("preview")}
            className={`flex items-center px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 ${
              activeTab === "preview"
                ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20"
            }`}
          >
            <Eye className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Live Preview
          </motion.button>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme((prev) => !prev)}
            className="p-2.5 lg:p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
          >
            {istheme ? (
              <Moon className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm lg:text-base transition-all duration-300 shadow-lg"
          >
            <Download className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Export</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: deploying ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeploy}
            disabled={deploying}
            className="relative flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm lg:text-base transition-all duration-300 shadow-lg overflow-hidden"
            style={{ boxShadow: glowShadow }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ scaleX: deployProgress, originX: 0 }}
            />
            <div className="relative z-10 flex items-center gap-2">
              {deploying ? (
                <>
                  <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Deploy Live</span>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Progress Bar with Better UX */}
      <AnimatePresence>
        {(loading || generationComplete) && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="h-2 bg-gray-800 overflow-hidden relative"
          >
            <motion.div
              className={`h-full ${
                generationComplete 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Progress Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-xs font-semibold text-white drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {generationComplete ? "✅ Generation Complete!" : `Generating... ${Math.round(progress)}%`}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 max-w-md w-full"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Code Generation Complete! 🎉
                </h3>
                
                <p className="text-gray-300 mb-6">
                  Your responsive React app is ready. Check the code editor and live preview.
                  Do you need any changes?
                </p>

                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFeedback(false)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Looks Perfect! 👍
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFeedback(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Need Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sandpack Container */}
      <div className="flex-1 bg-gray-900/50 backdrop-blur-lg">
        <SandpackProvider
          template="react"
          theme={istheme ? "dark" : "light"}
          files={allFiles}
          options={{
            showNavigator: true,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: "100%",
            layout: "preview",
            showConsole: true,
            showConsoleButton: true,
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
          customSetup={{
            dependencies: {
              ...LookUp?.Dependencies,
            },
          }}
        >
          <SandpackSync activeTab={activeTab} />

          <SandpackLayout className="rounded-none! border-none!">
            {activeTab === "code" &&
              (loading ? (
                <div className="w-full h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-lg">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    >
                      <File className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-cyan-400 text-lg font-semibold mb-2"
                    >
                      Creating Your Responsive App...
                    </motion.p>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-400 text-sm mb-4"
                    >
                      Building mobile-first responsive design
                    </motion.p>

                    <div className="flex justify-center gap-4 text-xs text-gray-500">
                      <span>📱 Mobile</span>
                      <span>📟 Tablet</span>
                      <span>💻 Desktop</span>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  <SandpackFileExplorer className="h-full! min-h-[500px]" />
                  <SandpackCodeEditor
                    showLineNumbers
                    wrapContent
                    showTabs={true}
                    closableTabs
                    className="h-full! min-h-[500px]"
                  />
                </>
              ))}

            {activeTab === "preview" && (
              <div className="relative w-full h-[calc(100vh-120px)]">
                {/* Preview Controls */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                  <motion.div 
                    className="flex gap-1 bg-gray-800/90 backdrop-blur-lg rounded-xl p-1 border border-white/10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-2 rounded-lg transition-all ${
                        previewDevice === "desktop"
                          ? "bg-cyan-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewDevice("tablet")}
                      className={`p-2 rounded-lg transition-all ${
                        previewDevice === "tablet"
                          ? "bg-cyan-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xs font-bold">TAB</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-2 rounded-lg transition-all ${
                        previewDevice === "mobile"
                          ? "bg-cyan-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </motion.button>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefreshPreview}
                    className="p-2 bg-gray-800/90 backdrop-blur-lg rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <motion.div
                      animate={{ rotate: isRefreshing ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </div>

                {loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-lg">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      >
                        <Zap className="w-10 h-10 text-white" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-yellow-400 text-lg font-semibold mb-2"
                      >
                        Building Responsive Preview...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-400 text-sm"
                      >
                        Optimizing for all screen sizes
                      </motion.p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="h-full w-full bg-white">
                    {/* Preview Container with Responsive Sizes */}
                    <motion.div
                      key={previewDevice}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border-8 border-gray-800 ${
                        previewDevice === "mobile"
                          ? "w-[375px] h-[667px] mt-8"
                          : previewDevice === "tablet"
                          ? "w-[768px] h-[1024px] mt-8"
                          : "w-full h-full"
                      } ${previewDevice !== "desktop" ? 'mx-auto' : ''}`}
                    >
                      <SandpackPreview 
                        className="h-full w-full" 
                        showNavigator 
                        showRefreshButton={false}
                      />
                    </motion.div>
                  </div>
                )}
              </div>
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </motion.div>
  );
}

export default CodeView;
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
  AlertCircle,
  Cpu,
  Palette,
  Code2,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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

// Enhanced Progressive Loader Component
const EnhancedProgressLoader = ({ progress, currentStage }) => {
  const stages = [
    { name: "Analyzing", icon: Cpu, color: "text-blue-400", target: 15 },
    { name: "Designing", icon: Palette, color: "text-purple-400", target: 35 },
    { name: "Coding", icon: Code2, color: "text-indigo-400", target: 65 },
    { name: "Optimizing", icon: Sparkles, color: "text-amber-400", target: 85 },
    { name: "Finalizing", icon: CheckCircle, color: "text-green-400", target: 100 },
  ];

  const getProgressDescription = (progress) => {
    if (progress < 15) return "Analyzing your requirements and planning structure...";
    if (progress < 35) return "Designing responsive layout and UI components...";
    if (progress < 65) return "Writing React components and functionality...";
    if (progress < 85) return "Optimizing performance and adding interactions...";
    if (progress < 95) return "Final testing and deployment preparation...";
    return "Your website is ready! 🎉";
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center"
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">Building Your Website</h3>
            <p className="text-sm text-gray-400">{getProgressDescription(progress)}</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-cyan-400">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: [-100, 400] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Progress Stages */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= currentStage;
          const isCompleted = progress >= stage.target;
          
          return (
            <div key={stage.name} className="text-center">
              <motion.div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                  isCompleted 
                    ? "bg-green-500 text-white" 
                    : isActive 
                    ? "bg-cyan-500 text-white" 
                    : "bg-gray-600 text-gray-400"
                }`}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className={`text-xs ${
                isCompleted ? "text-green-400" : 
                isActive ? "text-cyan-400" : "text-gray-500"
              }`}>
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time Estimate */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Started building...</span>
        <span>ETA: {Math.max(1, Math.round((100 - progress) / 8))} seconds</span>
      </div>
    </div>
  );
};

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
  const [deploying, setDeploying] = useState(false);
  const [istheme, setTheme] = useState(true);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup
  const progressIntervalRef = useRef(null);

  // Motion values
  const deployProgress = useMotionValue(0);
  const glowIntensity = useMotionValue(0);

  const handleSendPrompt = useCallback(async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setGenerationComplete(false);
    setProgress(0);
    setCurrentStage(0);

    // Clear any existing intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    try {
      console.log("🚀 Starting code generation for:", prompt);
      
      // FIXED: Simple and reliable progress simulation
      let currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        currentProgress += Math.random() * 5 + 3; // Slower, more predictable
        
        if (currentProgress >= 95) {
          clearInterval(progressIntervalRef.current);
          setProgress(95);
          return;
        }
        
        setProgress(currentProgress);
        
        // Update stage based on progress
        if (currentProgress >= 85) setCurrentStage(4);
        else if (currentProgress >= 65) setCurrentStage(3);
        else if (currentProgress >= 40) setCurrentStage(2);
        else if (currentProgress >= 20) setCurrentStage(1);
        else setCurrentStage(0);
      }, 800); // Slower interval

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      const url = `${backendUrl}/chat/code/${chatId}`;
      
      console.log("📡 Calling backend:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message: prompt }),
      });

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProgress(100);
      setCurrentStage(4);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Server response data:", data);

      if (data.success && data.files) {
        console.log("✅ Code generation completed!");
        
        const sandpackFiles = {};
        data.files.forEach(({ path, content }) => {
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          sandpackFiles[cleanPath] = { code: content };
        });

        setSandboxFiles(prev => ({
          ...prev,
          ...sandpackFiles
        }));

        setTimeout(() => {
          setGenerationComplete(true);
          setShowFeedbackModal(true);
        }, 1000);

      } else {
        throw new Error(data.error || "Failed to generate code");
      }
    } catch (err) {
      console.error("❌ Error during code generation:", err);
      setError(err.message);
      
      // Clear interval on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setProgress(100);
    } finally {
      setLoading(false);
    }
  }, [prompt, chatId, setSandboxFiles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Effect for initial files
  useEffect(() => {
    if (Object.keys(initialFiles).length > 0) {
      setSandboxFiles(initialFiles);
    }
  }, [initialFiles, setSandboxFiles]);

  // Effect for prompt handling
  useEffect(() => {
    if (!prompt || prompt.trim() === '') return;

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
    try {
      const zip = new JSZip();
      Object.entries(allFiles).forEach(([path, { code }]) => {
        const cleanPath = path.replace(/^\//, "");
        zip.file(cleanPath, code);
      });
      zip.generateAsync({ type: "blob" }).then((blob) => {
        saveAs(blob, "responsive-website.zip");
      });
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download files");
    }
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
        throw new Error("Deployment failed");
      }
    } catch (err) {
      console.error("Deployment Error:", err);
      alert("❌ Error during deployment. Please try again.");
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
      alert("Please describe what changes you need in the prompt input!");
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
      className="h-full flex flex-col relative"
    >
      {/* Enhanced Progress Loader - FIXED POSITION */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <EnhancedProgressLoader progress={progress} currentStage={currentStage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg m-4 p-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Generation Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        className="flex items-center justify-between bg-gray-900/80 backdrop-blur-2xl border-b border-white/10 p-4 lg:p-6 relative z-40"
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

      {/* Enhanced Progress Bar - FIXED: Now shows on both tabs */}
      <AnimatePresence>
        {(loading || generationComplete) && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="h-3 bg-gray-800 overflow-hidden relative z-30"
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
                  Website Ready! 🎉
                </h3>
                
                <p className="text-gray-300 mb-6">
                  Your responsive React website has been generated successfully. 
                  Check the code editor and live preview on different devices.
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
      <div className="flex-1 bg-gray-900/50 backdrop-blur-lg relative">
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
            visibleFiles: Object.keys(allFiles).filter(path => !path.includes('node_modules')),
            activeFile: Object.keys(allFiles)[0],
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
          customSetup={{
            dependencies: {
              react: "^18.2.0",
              "react-dom": "^18.2.0",
              "react-scripts": "^5.0.1",
              "lucide-react": "latest",
            },
            devDependencies: {
              "@vitejs/plugin-react": "^4.0.0",
              "autoprefixer": "^10.4.14",
              "postcss": "^8.4.24",
              "tailwindcss": "^3.3.0",
              "vite": "^4.4.0"
            },
          }}
        >
          <SandpackSync activeTab={activeTab} />

          <SandpackLayout className="rounded-none! border-none! h-full">
            {activeTab === "code" &&
              (loading ? (
                <div className="w-full h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-lg">
                  <EnhancedProgressLoader progress={progress} currentStage={currentStage} />
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
                {/* FIXED: Enhanced Loading Overlay for Preview - Now properly visible */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gray-900/95 backdrop-blur-lg z-20 flex items-center justify-center p-4"
                    >
                      <div className="text-center w-full max-w-2xl">
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        >
                          <Zap className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-yellow-400 text-xl font-semibold mb-4">
                          Preparing Live Preview
                        </h3>
                        {/* FIXED: Progress loader now properly shows in preview tab */}
                        <EnhancedProgressLoader progress={progress} currentStage={currentStage} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview Controls */}
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-3">
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

                {/* Preview Content - Only show when NOT loading */}
                {!loading && (
                  <div className="h-full w-full bg-white">
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
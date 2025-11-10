import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Promt from "../components/Promt";
import { PanelTopOpen, Sparkles, Code2, Layout, Zap } from "lucide-react";
import logo from "/genify1.webp";
import CodeView from "../components/CodeView";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
  easeInOut,
  AnimatePresence,
} from "motion/react";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState({
    workflowBar: false,
    historyBar: false,
  });
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastChatId, setLastChatId] = useState(null);
  const [initialFiles, setInitialFiles] = useState({});
  const [sandboxFiles, setSandboxFiles] = useState({});
  const [promt, setPromt] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeView, setActiveView] = useState("code");
  const containerRef = useRef(null);

  // Advanced color system with gradient transitions
  const Colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ];

  const color = useMotionValue(Colors[0]);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const noiseOpacity = useMotionValue(0.02);

  // Advanced cursor and background animations
  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    // Animate background gradient
    animate(color, Colors, {
      ease: easeInOut,
      duration: 15,
      repeat: Infinity,
      repeatType: "mirror",
    });

    // Subtle noise animation
    animate(noiseOpacity, [0.02, 0.05, 0.02], {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    });

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Advanced motion templates
  const backgroundImage = useMotionTemplate`radial-gradient(ellipse 80% 80% at 50% -20%, #0f172a 40%, transparent 70%), ${color}`;
  const cursorBackground = useMotionTemplate`radial-gradient(600px circle at ${cursorX}px ${cursorY}px, rgba(120, 119, 198, 0.15), transparent 80%)`;
  const noiseTexture = useMotionTemplate`url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`;
  const glassEffect = useMotionTemplate`linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`;

  return (
    <motion.div
      ref={containerRef}
      style={{ 
        backgroundImage,
        position: "relative",
        overflow: "hidden",
      }}
      className="flex h-screen text-white overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div
        style={{
          backgroundImage: cursorBackground,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      />
      
      <motion.div
        style={{
          backgroundImage: noiseTexture,
          opacity: noiseOpacity,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Sidebar with Glass Morphism */}
      <AnimatePresence>
        {isSidebarOpen.historyBar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-50 lg:w-80 fixed md:relative top-0 left-0 h-full z-50"
          >
            <motion.div
              style={{ background: glassEffect, backdropFilter: "blur(20px)" }}
              className="h-full border-r border-white/10"
            >
              <Sidebar
                isSidebarOpen={isSidebarOpen.historyBar}
                setIsSidebarOpen={setIsSidebarOpen}
                setPromt={setPromt}
                setSandboxFiles={setSandboxFiles}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 flex transition-all duration-500 ${
        isSidebarOpen.historyBar ? "lg:ml-0" : "ml-0"
      }`}>
        <div className={`flex-1 flex flex-col ${promt.length === 0 ? "max-w-full" : "lg:max-w-[50%]"} transition-all duration-500`}>
          
          {/* Enhanced Header */}
          <motion.div 
            style={{ 
              background: glassEffect,
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}
            className="relative z-40 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {/* Logo with Animation */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsSidebarOpen(prev => ({
                  ...prev,
                  historyBar: !prev.historyBar
                }))}
              >
                <motion.div
                  animate={{ rotate: isSidebarOpen.historyBar ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={logo} alt="WebBuilder Logo" className="h-8 w-8 rounded-lg" />
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    WebBuilder
                  </span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </motion.div>
              </motion.div>

              {/* Navigation Tabs */}
              <div className="flex gap-1 ml-6 p-1 rounded-2xl bg-white/5 backdrop-blur-lg">
                {["code", "design", "preview"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      activeView === tab 
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tab === "code" && <Code2 className="w-4 h-4" />}
                      {tab === "design" && <Layout className="w-4 h-4" />}
                      {tab === "preview" && <Zap className="w-4 h-4" />}
                      {tab}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview Toggle for Mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(prev => ({
                ...prev,
                workflowBar: !prev.workflowBar
              }))}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Preview</span>
            </motion.button>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 relative z-30 p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <Promt
                promt={promt}
                setPromt={setPromt}
                setInitialFiles={setInitialFiles}
                onPromptComplete={(input, chatId) => {
                  setLastPrompt(input);
                  setLastChatId(chatId);
                }}
                setIsSidebarOpen={setIsSidebarOpen}
                chatLoading={chatLoading}
                setChatLoading={setChatLoading}
              />
            </div>
          </div>
        </div>

        {/* Code Preview Panel */}
        <AnimatePresence>
          {(promt.length > 0 || isSidebarOpen.workflowBar) && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed lg:relative top-0 right-0 h-full w-full lg:w-1/2 z-50 ${
                isSidebarOpen.workflowBar ? "translate-x-0" : "lg:translate-x-0"
              }`}
            >
              <motion.div
                style={{ 
                  background: glassEffect,
                  backdropFilter: "blur(30px)",
                  borderLeft: "1px solid rgba(255,255,255,0.1)"
                }}
                className="h-full relative overflow-hidden"
              >
                {/* Panel Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <motion.h3 
                    className="text-lg font-semibold flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Code2 className="w-5 h-5 text-cyan-400" />
                    Live Preview
                  </motion.h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(prev => ({
                      ...prev,
                      workflowBar: false
                    }))}
                    className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <PanelTopOpen className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Code View Content */}
                <div className="h-[calc(100%-80px)] p-4">
                  <CodeView
                    prompt={lastPrompt}
                    chatId={lastChatId}
                    initialFiles={initialFiles}
                    setSandboxFiles={setSandboxFiles}
                    sandboxFiles={sandboxFiles}
                    chatLoading={chatLoading}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Home;
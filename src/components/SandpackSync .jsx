import { useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function SandpackSync({ activeTab }) {
  const { sandpack } = useSandpack();
  const [status, setStatus] = useState("idle"); // idle, running, success, error
  const [lastRun, setLastRun] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const prevActiveTabRef = useRef(activeTab);
  const timeoutRef = useRef(null);

  // Status indicators with animations
  const statusConfig = {
    idle: {
      icon: Play,
      color: "text-gray-400",
      bgColor: "bg-gray-400/20",
      message: "Ready to run",
      animation: { scale: 1 }
    },
    running: {
      icon: Loader2,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
      message: "Building preview...",
      animation: { rotate: 360 }
    },
    success: {
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/20",
      message: "Preview ready",
      animation: { scale: [1, 1.2, 1] }
    },
    error: {
      icon: AlertCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/20",
      message: "Build failed",
      animation: { x: [0, -5, 5, -5, 0] }
    }
  };

  const currentStatus = statusConfig[status];

  const runSandpack = async () => {
    if (status === "running") return;

    setStatus("running");
    setIsVisible(true);
    
    try {
      // Use the correct Sandpack API method
      if (sandpack.runSandpack) {
        await sandpack.runSandpack();
      } else {
        // Fallback: refresh the preview
        sandpack.refresh();
      }
      
      setStatus("success");
      setLastRun(new Date());
      
      // Auto-hide success message after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.error("Sandpack execution failed:", error);
      setStatus("error");
      
      // Auto-hide error message after 5 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  };

  const stopSandpack = () => {
    // Use correct stop method
    if (sandpack.stopSandpack) {
      sandpack.stopSandpack();
    }
    setStatus("idle");
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Safe Sandpack state monitoring
  useEffect(() => {
    let mounted = true;

    const checkSandpackStatus = () => {
      if (!mounted || !sandpack) return;

      // Monitor sandpack state through its internal state
      const { bundlerState } = sandpack;
      
      if (bundlerState) {
        // Check if there are any errors
        const hasErrors = bundlerState.errors && bundlerState.errors.length > 0;
        
        if (hasErrors && status !== "error") {
          setStatus("error");
        } else if (bundlerState.status === "running" && status !== "running") {
          setStatus("running");
        } else if (bundlerState.status === "success" && status !== "success") {
          setStatus("success");
          setLastRun(new Date());
        }
      }
    };

    // Set up interval to check status
    const intervalId = setInterval(checkSandpackStatus, 1000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [sandpack, status]);

  // Auto-run when switching to preview tab
  useEffect(() => {
    if (activeTab === "preview" && prevActiveTabRef.current !== "preview") {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        runSandpack();
      }, 800);
      
      return () => clearTimeout(timer);
    }
    
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  // Manual trigger function for external use
  const manualRefresh = () => {
    runSandpack();
  };

  // Format last run time
  const formatLastRun = () => {
    if (!lastRun) return "Never";
    
    const now = new Date();
    const diff = now - lastRun;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Export manual refresh for parent component
  useEffect(() => {
    // This allows parent components to trigger refresh
    if (typeof window !== 'undefined') {
      window.sandpackManualRefresh = manualRefresh;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.sandpackManualRefresh;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Error boundary - if sandpack is not available, don't render
  if (!sandpack) {
    console.warn("Sandpack not available in SandpackSync");
    return null;
  }

  return (
    <>
      {/* Status Indicator */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-20 right-4 z-50 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-4 min-w-[280px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Preview Status</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div
                animate={currentStatus.animation}
                transition={{ 
                  duration: status === "running" ? 1 : 0.5,
                  repeat: status === "running" ? Infinity : 0,
                  ease: "linear"
                }}
                className={`p-2 rounded-xl ${currentStatus.bgColor}`}
              >
                <currentStatus.icon className={`w-4 h-4 ${currentStatus.color}`} />
              </motion.div>
              
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {currentStatus.message}
                </p>
                {lastRun && status !== "running" && (
                  <p className="text-gray-400 text-xs mt-1">
                    Last run: {formatLastRun()}
                  </p>
                )}
              </div>
              
              <div className="flex gap-1">
                {status === "running" ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopSandpack}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg transition-all"
                  >
                    <Square className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runSandpack}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Progress bar for running state */}
            {status === "running" && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="h-1 bg-gray-700 rounded-full overflow-hidden mt-3"
              >
                <motion.div
                  animate={{ 
                    x: ["-100%", "100%"] 
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-1/2"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <AnimatePresence>
        {activeTab === "preview" && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={runSandpack}
            className={`fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-2xl border transition-all lg:hidden ${
              status === "running" 
                ? "bg-blue-600 border-blue-500" 
                : status === "error"
                ? "bg-red-600 border-red-500"
                : "bg-green-600 border-green-500"
            }`}
          >
            <motion.div
              animate={currentStatus.animation}
              transition={{ 
                duration: status === "running" ? 1 : 0.5,
                repeat: status === "running" ? Infinity : 0 
              }}
            >
              <currentStatus.icon className="w-6 h-6 text-white" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

// Export additional utilities
export const SandpackUtils = {
  refresh: () => {
    if (typeof window !== 'undefined' && window.sandpackManualRefresh) {
      window.sandpackManualRefresh();
    }
  }
};

export default SandpackSync;
import { useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function SandpackSync({ activeTab, onPreviewRun }) {
  const { sandpack } = useSandpack();
  const [status, setStatus] = useState("idle");
  const [lastRun, setLastRun] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [progress, setProgress] = useState(0);
  const prevActiveTabRef = useRef(activeTab);
  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isFirstRun = useRef(true);
  const hasPreviewBuilt = useRef(false);

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

  // Load preview state from localStorage
  const loadPreviewState = useCallback(() => {
    try {
      const saved = localStorage.getItem('sandpack-preview-state');
      if (saved) {
        const state = JSON.parse(saved);
        setLastRun(state.lastRun ? new Date(state.lastRun) : null);
        hasPreviewBuilt.current = state.hasPreviewBuilt || false;
        console.log("📦 Loaded preview state from cache:", state);
        return state.hasPreviewBuilt;
      }
    } catch (error) {
      console.warn("Failed to load preview state:", error);
    }
    return false;
  }, []);

  // Save preview state to localStorage
  const savePreviewState = useCallback((state) => {
    try {
      const saveData = {
        lastRun: state.lastRun ? state.lastRun.toISOString() : null,
        hasPreviewBuilt: state.hasPreviewBuilt,
        timestamp: Date.now()
      };
      localStorage.setItem('sandpack-preview-state', JSON.stringify(saveData));
      console.log("💾 Saved preview state to cache:", saveData);
    } catch (error) {
      console.warn("Failed to save preview state:", error);
    }
  }, []);

  // Start progress simulation
  const startProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setProgress(0);
    let currentProgress = 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 15 + 5; // Faster progress
      
      if (currentProgress >= 95) {
        currentProgress = 95;
        clearInterval(progressIntervalRef.current);
      }
      
      setProgress(currentProgress);
    }, 300);
  }, []);

  // Stop progress simulation
  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(100); // Complete the progress
  }, []);

  // Improved run function with progress tracking
  const runSandpack = useCallback(async () => {
    if (status === "running") return;

    console.log("🚀 Starting Sandpack preview...");
    setStatus("running");
    setErrorDetails(null);
    setIsVisible(true);
    startProgressSimulation();
    
    // Notify parent component that preview is running
    if (onPreviewRun) {
      onPreviewRun(true);
    }
    
    try {
      // Use the most reliable method to run sandpack
      if (sandpack.runSandpack) {
        await sandpack.runSandpack();
      } else {
        // Fallback to refresh
        sandpack.refresh();
      }
      
      // Set success after build completion
      const successTimer = setTimeout(() => {
        // Mark as built successfully
        hasPreviewBuilt.current = true;
        setStatus("success");
        stopProgressSimulation();
        
        const newLastRun = new Date();
        setLastRun(newLastRun);
        
        // Save to localStorage
        savePreviewState({
          lastRun: newLastRun,
          hasPreviewBuilt: true
        });
        
        // Notify parent component that preview is ready
        if (onPreviewRun) {
          onPreviewRun(false);
        }
        
        console.log("✅ Preview built successfully and cached");
        
        // Auto-hide success message after 3 seconds
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }, 2500);

      // Cleanup timer
      return () => clearTimeout(successTimer);
      
    } catch (error) {
      console.error("❌ Sandpack execution failed:", error);
      setStatus("error");
      setErrorDetails(error.message || "Unknown error occurred");
      stopProgressSimulation();
      
      if (onPreviewRun) {
        onPreviewRun(false);
      }
    }
  }, [status, sandpack, onPreviewRun, savePreviewState, startProgressSimulation, stopProgressSimulation]);

  const stopSandpack = () => {
    console.log("🛑 Stopping sandpack process");
    setStatus("idle");
    setErrorDetails(null);
    setProgress(0);
    stopProgressSimulation();
    setIsVisible(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (onPreviewRun) {
      onPreviewRun(false);
    }
  };

  // FIXED: Better state monitoring with auto-completion
  useEffect(() => {
    if (!sandpack || status !== "running") return;

    let mounted = true;
    let checkCount = 0;
    const maxChecks = 20; // Even shorter to prevent loops

    const checkSandpackStatus = () => {
      if (!mounted || checkCount >= maxChecks) {
        // Auto-complete if max checks reached
        if (mounted && status === "running") {
          console.log("⏰ Auto-completing preview build");
          setStatus("success");
          stopProgressSimulation();
          hasPreviewBuilt.current = true;
          const newLastRun = new Date();
          setLastRun(newLastRun);
          savePreviewState({
            lastRun: newLastRun,
            hasPreviewBuilt: true
          });
          if (onPreviewRun) onPreviewRun(false);
        }
        return;
      }
      
      checkCount++;
      const { bundlerState } = sandpack;
      
      if (bundlerState) {
        const hasErrors = bundlerState.errors && bundlerState.errors.length > 0;
        const isSuccess = bundlerState.status === "success";
        
        if (hasErrors) {
          console.log("🚨 Build errors detected");
          setStatus("error");
          setErrorDetails(bundlerState.errors[0]?.message || "Build failed");
          stopProgressSimulation();
          if (onPreviewRun) onPreviewRun(false);
        } else if (isSuccess) {
          console.log("✅ Build completed successfully");
          setStatus("success");
          stopProgressSimulation();
          hasPreviewBuilt.current = true;
          const newLastRun = new Date();
          setLastRun(newLastRun);
          savePreviewState({
            lastRun: newLastRun,
            hasPreviewBuilt: true
          });
          if (onPreviewRun) onPreviewRun(false);
        }
      }
    };

    const intervalId = setInterval(checkSandpackStatus, 1000);
    
    // Auto-stop checking after 20 seconds max
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 20000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [sandpack, status, onPreviewRun, savePreviewState, stopProgressSimulation]);

  // FIXED: Smart auto-run - only run when not cached
  useEffect(() => {
    if (activeTab === "preview") {
      console.log("🔄 Preview tab activated");
      
      // Load saved state
      const wasPreviewBuilt = loadPreviewState();
      
      // Show status immediately
      setIsVisible(true);
      
      if (!wasPreviewBuilt || !hasPreviewBuilt.current) {
        console.log("🎯 Auto-running preview (not cached)");
        
        setStatus("running");
        
        const timer = setTimeout(() => {
          runSandpack();
          isFirstRun.current = false;
        }, 800);
        
        return () => clearTimeout(timer);
      } else {
        // Preview already built and cached
        console.log("✅ Using cached preview");
        setStatus("success");
        
        // Show cached status for 2 seconds then auto-hide
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    }
    
    prevActiveTabRef.current = activeTab;
  }, [activeTab, runSandpack, loadPreviewState]);

  // Manual trigger function for external use
  const manualRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    // Clear cache and force rebuild
    hasPreviewBuilt.current = false;
    runSandpack();
  }, [runSandpack]);

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

  // Clear preview state
  const clearPreviewState = () => {
    localStorage.removeItem('sandpack-preview-state');
    hasPreviewBuilt.current = false;
    setLastRun(null);
    setStatus("idle");
    setProgress(0);
    console.log("🧹 Preview cache cleared");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Export manual refresh for parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sandpackManualRefresh = manualRefresh;
      window.clearSandpackPreview = clearPreviewState;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.sandpackManualRefresh;
        delete window.clearSandpackPreview;
      }
    };
  }, [manualRefresh]);

  // Load initial state
  useEffect(() => {
    loadPreviewState();
  }, [loadPreviewState]);

  // Error boundary - if sandpack is not available, don't render
  if (!sandpack) {
    console.warn("Sandpack not available in SandpackSync");
    return null;
  }

  const handleRetry = () => {
    console.log("🔄 Retrying build...");
    runSandpack();
  };

  const handleForceRefresh = () => {
    console.log("🔄 Force refreshing preview...");
    hasPreviewBuilt.current = false;
    runSandpack();
  };

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
            className="fixed top-20 right-4 z-50 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-[400px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Preview Status</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearPreviewState}
                  className="text-gray-400 hover:text-yellow-400 transition-colors p-1 rounded-lg hover:bg-white/10 text-xs"
                  title="Clear Preview Cache"
                >
                  🧹
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <motion.div
                animate={currentStatus.animation}
                transition={{ 
                  duration: status === "running" ? 1 : 0.5,
                  repeat: status === "running" ? Infinity : 0,
                  ease: "linear"
                }}
                className={`p-2 rounded-xl mt-1 ${currentStatus.bgColor}`}
              >
                <currentStatus.icon className={`w-4 h-4 ${currentStatus.color}`} />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">
                    {currentStatus.message}
                    {hasPreviewBuilt.current && status === "success" && (
                      <span className="text-green-300 ml-1">(Cached)</span>
                    )}
                  </p>
                  {status === "running" && (
                    <span className="text-blue-400 text-sm font-bold">
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                {status === "running" && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
                
                {/* Error Details */}
                {status === "error" && errorDetails && (
                  <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-xs break-words">
                      {errorDetails.length > 100 
                        ? `${errorDetails.substring(0, 100)}...` 
                        : errorDetails
                      }
                    </p>
                  </div>
                )}
                
                {lastRun && status !== "running" && (
                  <p className="text-gray-400 text-xs mt-1">
                    Last built: {formatLastRun()}
                  </p>
                )}
              </div>
              
              <div className="flex gap-1 flex-shrink-0">
                {status === "running" ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopSandpack}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg transition-all"
                    title="Stop Preview"
                  >
                    <Square className="w-4 h-4" />
                  </motion.button>
                ) : status === "error" ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/20 rounded-lg transition-all"
                    title="Retry Build"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleForceRefresh}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 rounded-lg transition-all"
                    title="Force Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
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
            onClick={status === "error" ? handleRetry : handleForceRefresh}
            className={`fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-2xl border transition-all lg:hidden ${
              status === "running" 
                ? "bg-blue-600 border-blue-500" 
                : status === "error"
                ? "bg-red-600 border-red-500"
                : "bg-green-600 border-green-500"
            }`}
            title={status === "error" ? "Retry Build" : "Refresh Preview"}
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
  },
  clearCache: () => {
    if (typeof window !== 'undefined' && window.clearSandpackPreview) {
      window.clearSandpackPreview();
    }
  }
};

export default SandpackSync;
import React, { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, Zap, AlertCircle, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ProgressiveLoader = ({ 
  codeLoading, 
  progress = 0, 
  error = null, 
  onComplete, 
  className = "",
  resetKey // Add this to force reset
}) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [dots, setDots] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const progressRef = useRef(0);

  const loadingStates = [
    {
      text: "Analyzing requirements",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-blue-400",
      targetProgress: 20,
    },
    {
      text: "Designing components",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-purple-400",
      targetProgress: 40,
    },
    {
      text: "Writing code",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-indigo-400",
      targetProgress: 60,
    },
    {
      text: "Optimizing performance",
      icon: <Zap className="w-5 h-5 animate-pulse" />,
      color: "text-amber-400",
      targetProgress: 80,
    },
    {
      text: "Finalizing website",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-400",
      targetProgress: 100,
    },
  ];

  // RESET everything when codeLoading becomes false or resetKey changes
  useEffect(() => {
    if (!codeLoading || resetKey) {
      console.log("🔄 Resetting loader state");
      setIsComplete(false);
      setCurrentStateIndex(0);
      setDots("");
      setLocalProgress(0);
      progressRef.current = 0;
    }
  }, [codeLoading, resetKey]);

  // Handle external progress updates
  useEffect(() => {
    if (codeLoading && progress > progressRef.current) {
      progressRef.current = progress;
      setLocalProgress(progress);
      
      // Update state based on progress
      const currentState = loadingStates[currentStateIndex];
      if (progress >= currentState.targetProgress && currentStateIndex < loadingStates.length - 1) {
        setCurrentStateIndex(prev => prev + 1);
      }

      // Auto-complete at 95% (common API scenario)
      if (progress >= 95 && !isComplete) {
        const timer = setTimeout(() => {
          console.log("🚀 Auto-completing at 95%");
          setLocalProgress(100);
          setIsComplete(true);
          if (onComplete) {
            setTimeout(() => onComplete(), 1000);
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [progress, codeLoading, currentStateIndex, isComplete, onComplete]);

  // Auto-complete animation when codeLoading becomes false
  useEffect(() => {
    if (!codeLoading && localProgress < 100) {
      console.log("✅ Process finished, completing animation");
      
      // Animate to 100%
      const animateTo100 = () => {
        setLocalProgress(prev => {
          if (prev >= 100) {
            setIsComplete(true);
            if (onComplete) {
              setTimeout(() => onComplete(), 1000);
            }
            return 100;
          }
          return prev + 5;
        });
      };

      const interval = setInterval(animateTo100, 100);
      
      // Stop after reaching 100
      setTimeout(() => {
        clearInterval(interval);
        setLocalProgress(100);
        setIsComplete(true);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [codeLoading, localProgress, onComplete]);

  // Animate dots when loading
  useEffect(() => {
    if (!codeLoading || isComplete) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, [codeLoading, isComplete]);

  // Safety timeout - force complete after 60 seconds
  useEffect(() => {
    if (codeLoading && !isComplete) {
      const safetyTimer = setTimeout(() => {
        console.warn("⚠️ Safety timeout - forcing completion");
        setLocalProgress(100);
        setIsComplete(true);
        if (onComplete) onComplete();
      }, 60000); // 60 seconds

      return () => clearTimeout(safetyTimer);
    }
  }, [codeLoading, isComplete, onComplete]);

  // Handle error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-red-900/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-400">Generation Failed</h3>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show completion state
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className={`bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6 ${className}`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <Rocket className="w-12 h-12 text-green-400 relative z-10" />
          </motion.div>
          <div className="text-center">
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-green-400"
            >
              Website Ready! 🎉
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-green-300 text-sm mt-1"
            >
              Your website has been generated successfully
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show loading state
  if (!codeLoading && !isComplete) {
    return null;
  }

  const currentState = loadingStates[currentStateIndex];
  const displayProgress = Math.min(100, localProgress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gray-900/90 backdrop-blur-lg border border-white/10 rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Building Your Website
        </h3>
        <div className="text-2xl font-bold text-cyan-400">
          {Math.round(displayProgress)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Current State */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 flex items-center justify-center ${currentState.color}`}>
            {currentState.icon}
          </div>
          <div className="flex items-center space-x-1">
            <span className={`text-sm font-medium ${currentState.color}`}>
              {currentState.text}
            </span>
            <span className={`text-sm font-medium ${currentState.color} w-6 text-left`}>
              {dots}
            </span>
          </div>
        </div>

        {/* Stage Indicator */}
        <div className="flex space-x-1">
          {loadingStates.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStateIndex
                  ? currentState.color.replace("text-", "bg-")
                  : "bg-gray-600"
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Time Estimate */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>Started building...</span>
        <span>ETA: {Math.max(0, Math.round((100 - displayProgress) / 5))}s</span>
      </div>

      {/* Debug info - remove in production */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Debug: loading={codeLoading.toString()}</span>
          <span>progress={progress}</span>
          <span>state={currentStateIndex}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressiveLoader;
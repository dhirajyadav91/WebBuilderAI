import React, { useState, useEffect } from "react";
import { Loader2, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ProgressiveLoader = ({ codeLoading, progress = 0, className = "" }) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [dots, setDots] = useState("");

  const loadingStates = [
    {
      text: "Analyzing requirements",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-blue-400",
      targetProgress: 15,
    },
    {
      text: "Designing components",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-purple-400",
      targetProgress: 35,
    },
    {
      text: "Writing code",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-indigo-400",
      targetProgress: 65,
    },
    {
      text: "Optimizing performance",
      icon: <Zap className="w-5 h-5 animate-pulse" />,
      color: "text-amber-400",
      targetProgress: 85,
    },
    {
      text: "Finalizing website",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-400",
      targetProgress: 100,
    },
  ];

  // Handle state progression based on progress
  useEffect(() => {
    if (!codeLoading) {
      setCurrentStateIndex(0);
      return;
    }

    const currentState = loadingStates[currentStateIndex];
    if (progress >= currentState.targetProgress && currentStateIndex < loadingStates.length - 1) {
      setCurrentStateIndex(prev => prev + 1);
    }
  }, [progress, codeLoading, currentStateIndex]);

  useEffect(() => {
    if (!codeLoading) {
      setDots("");
      return;
    }

    const dotTimer = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotTimer);
  }, [codeLoading]);

  // Reset state when loading stops
  useEffect(() => {
    if (!codeLoading) {
      setCurrentStateIndex(0);
      setDots("");
    }
  }, [codeLoading]);

  if (!codeLoading) return null;

  const currentState = loadingStates[currentStateIndex];

  return (
    <div className={`bg-gray-900/90 backdrop-blur-lg border border-white/10 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Building Your Website
        </h3>
        <div className="text-2xl font-bold text-cyan-400">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: [-100, 300] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Current State */}
      <div className="flex items-center justify-between">
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
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStateIndex
                  ? currentState.color.replace("text-", "bg-")
                  : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Time Estimate */}
      <div className="mt-3 text-xs text-gray-400 flex justify-between">
        <span>Started</span>
        <span>ETA: {Math.max(0, Math.round((100 - progress) / 10))}s</span>
      </div>
    </div>
  );
};

export default ProgressiveLoader;
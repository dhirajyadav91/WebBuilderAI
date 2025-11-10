import React, { useEffect, useState } from 'react';
import { Zap, Sparkles, Code, Palette, Rocket, Cloud, Star } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingTexts = [
    "Initializing AI engine...",
    "Loading design systems...",
    "Preparing development tools...",
    "Optimizing performance...",
    "Almost ready...",
    "Welcome to WeBuilder!"
  ];

  const progressValue = useMotionValue(0);
  const glowIntensity = useTransform(progressValue, [0, 100], [0.1, 1]);
  const scaleValue = useTransform(progressValue, [0, 100], [0.8, 1.2]);

  useEffect(() => {
    // Progress animation
    const progressAnimation = animate(progressValue, 100, {
      duration: 2,
      ease: "easeInOut",
    });

    // Text rotation
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 400);

    // Progress percentage
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Completion
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 2500);

    return () => {
      progressAnimation.stop();
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const FloatingIcon = ({ icon: Icon, delay }) => (
    <motion.div
      className="absolute text-white/20"
      initial={{ 
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        scale: 0,
        rotate: Math.random() * 360
      }}
      animate={{ 
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        scale: [0, 1, 0],
        rotate: Math.random() * 720
      }}
      transition={{
        duration: 4 + Math.random() * 4,
        delay,
        repeat: Infinity,
        repeatType: "loop"
      }}
    >
      <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center z-50 overflow-hidden"
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 lg:w-2 lg:h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0">
        {[
          { icon: Code, delay: 0 },
          { icon: Palette, delay: 0.5 },
          { icon: Rocket, delay: 1 },
          { icon: Cloud, delay: 1.5 },
          { icon: Star, delay: 2 },
          { icon: Sparkles, delay: 2.5 },
        ].map((item, index) => (
          <FloatingIcon key={index} {...item} />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10 relative">
        {/* Logo with Advanced Animation */}
        <motion.div
          className="relative mb-8 lg:mb-12"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 1 
          }}
        >
          {/* Outer Glow */}
          <motion.div
            style={{ opacity: glowIntensity }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Middle Ring */}
          <motion.div
            className="absolute inset-0 border-4 border-transparent rounded-full"
            style={{
              background: `conic-gradient(from 0deg, #ec4899, #8b5cf6, #06b6d4, #ec4899)`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '4px',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Main Icon */}
          <motion.div
            style={{ scale: scaleValue }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 lg:p-8 rounded-full border border-white/10 shadow-2xl"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 1 
              }}
            >
              <Zap className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </motion.div>
            
            {/* Sparkles */}
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated Title */}
        <motion.h1
          className="text-4xl lg:text-7xl font-bold text-white mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key="WeBuilder"
              className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              WeBuilder
            </motion.span>
          </AnimatePresence>
        </motion.h1>

        {/* Progress Bar */}
        <motion.div
          className="w-64 lg:w-96 h-3 bg-gray-800 rounded-full overflow-hidden mx-auto mb-4 lg:mb-6 border border-white/10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: [-100, 300] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Progress Percentage */}
        <motion.div
          className="text-cyan-400 font-mono text-lg lg:text-xl mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {Math.round(progress)}%
        </motion.div>

        {/* Loading Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentText}
            className="text-gray-300 text-base lg:text-lg font-medium min-h-[24px] lg:min-h-[28px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loadingTexts[currentText]}
          </motion.p>
        </AnimatePresence>

        {/* Feature Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 lg:gap-3 mt-6 lg:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {["AI-Powered", "Real-Time", "Responsive", "Modern"].map((feature, index) => (
            <motion.span
              key={feature}
              className="px-3 lg:px-4 py-1 lg:py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs lg:text-sm text-cyan-300 border border-cyan-500/30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 1.2 + index * 0.1,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(34, 211, 238, 0.2)"
              }}
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>

        {/* Completion Animation */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                className="text-green-400 text-xl lg:text-2xl font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                Ready! 🚀
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px),
                             linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Code,
  Palette,
  Zap,
  Star,
  Users,
  Globe,
  Rocket,
  Sparkles,
  Command,
  MousePointer,
  Layout,
  Smartphone,
  Monitor,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../features/auth/authThunks";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
  easeInOut,
  AnimatePresence,
} from "motion/react";

const MainWebsite = () => {
  const [firstName, setFirstName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const Colors = ["#CE84CF", "#e073c5", "#DD335C", "#ff5e57", "#1E67C6"];
  const color = useMotionValue(Colors[0]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroOpacity = useMotionValue(0);

  useEffect(() => {
    setIsVisible(true);
    animate(heroOpacity, 1, { duration: 1, ease: "easeOut" });
  }, []);

  useEffect(() => {
    animate(color, Colors, {
      ease: easeInOut,
      duration: 15,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #0f172a 40%, ${color})`;
  const cursorGlow = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(120, 119, 198, 0.15), transparent 80%)`;
  const heroBackground = useMotionTemplate`linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`;

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const persistedAuth = localStorage.getItem("persist:auth");
    if (persistedAuth) {
      const parsedAuth = JSON.parse(persistedAuth);
      const user = JSON.parse(parsedAuth.user);
      setFirstName(user.firstName);
    }
  }, []);

  const handleLogout = async () => {
    if (loading) return;

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Logout failed");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        navigate("/chat");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-rotate services
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      icon: <Code className="w-6 h-6 lg:w-8 lg:h-8" />,
      title: "Web Development",
      description: "Custom websites built with cutting-edge technologies for optimal performance and user experience.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Palette className="w-6 h-6 lg:w-8 lg:h-8" />,
      title: "UI/UX Design",
      description: "Beautiful, intuitive designs that tell your story and engage your audience effectively.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Rocket className="w-6 h-6 lg:w-8 lg:h-8" />,
      title: "Digital Strategy",
      description: "Comprehensive digital strategies that drive growth and maximize your online presence.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    {
      icon: <Users className="w-5 h-5 lg:w-6 lg:h-6" />,
      number: "500+",
      label: "Happy Clients",
    },
    {
      icon: <Globe className="w-5 h-5 lg:w-6 lg:h-6" />,
      number: "1000+",
      label: "Projects Completed",
    },
    {
      icon: <Star className="w-5 h-5 lg:w-6 lg:h-6" />,
      number: "5.0",
      label: "Average Rating",
    },
    {
      icon: <Zap className="w-5 h-5 lg:w-6 lg:h-6" />,
      number: "24/7",
      label: "Support Available",
    },
  ];

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background */}
      <motion.div
        style={{ backgroundImage }}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
      
      {/* Cursor Glow Effect */}
      <motion.div
        style={{ backgroundImage: cursorGlow }}
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-5"
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-2xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Webify
              </h1>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavLink
                  to="/chat"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm lg:text-base flex items-center gap-2 transition-all duration-300 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Builder
                </NavLink>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={loading}
                className={`bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2.5 rounded-xl font-semibold text-sm lg:text-base border border-red-500/30 transition-all duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "..." : "Logout"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 lg:pt-40 pb-20 lg:pb-28 px-4 lg:px-6 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <motion.h2 
              className="text-5xl lg:text-8xl font-bold text-white mb-6 lg:mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              We Build
              <motion.span 
                className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2 lg:mt-4"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"] 
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
                style={{ 
                  backgroundSize: "200% 100%",
                }}
              >
                Digital Dreams
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-lg lg:text-2xl text-gray-300 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Transform your vision into stunning web experiences that captivate, engage, and convert. 
              We craft digital solutions that make your brand shine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-8 lg:mb-12"
            >
              <span className="text-2xl lg:text-4xl bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent font-bold">
                Welcome {firstName}!
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col lg:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavLink
                  to="/chat"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 lg:px-12 py-4 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl flex items-center gap-3 transition-all duration-300 shadow-2xl"
                >
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
                  Start Your Project
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-400 text-sm lg:text-base bg-white/5 backdrop-blur-lg px-4 py-3 rounded-2xl border border-white/10"
              >
                <Command className="w-4 h-4" />
                <span>Ctrl + Y</span>
                <span className="text-gray-500">to quick start</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 lg:py-24 px-4 lg:px-6">
        <div className="container mx-auto">
          <motion.h3 
            className="text-4xl lg:text-6xl font-bold text-center text-white mb-12 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            What We Create
          </motion.h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`p-6 lg:p-8 rounded-3xl backdrop-blur-lg border transition-all duration-500 cursor-pointer ${
                  activeService === index 
                    ? "bg-white/10 border-white/30 shadow-2xl" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
                onMouseEnter={() => setActiveService(index)}
              >
                <div className={`bg-gradient-to-r ${service.gradient} w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                  {service.icon}
                </div>
                <h4 className="text-xl lg:text-2xl font-semibold text-white mb-4">
                  {service.title}
                </h4>
                <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-6 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group p-6 lg:p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  {stat.icon}
                </div>
                <div className="text-2xl lg:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-sm lg:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive Features */}
      <section className="py-16 lg:py-24 px-4 lg:px-6">
        <div className="container mx-auto text-center">
          <motion.h3 
            className="text-3xl lg:text-5xl font-bold text-white mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Perfect on Every Device
          </motion.h3>
          
          <div className="flex justify-center items-center gap-8 lg:gap-16 mb-12">
            {[
              { icon: <Smartphone className="w-8 h-8 lg:w-12 lg:h-12" />, label: "Mobile" },
              { icon: <Layout className="w-8 h-8 lg:w-12 lg:h-12" />, label: "Tablet" },
              { icon: <Monitor className="w-8 h-8 lg:w-12 lg:h-12" />, label: "Desktop" },
            ].map((device, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-2xl text-white">
                  {device.icon}
                </div>
                <span className="text-white font-semibold">{device.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 lg:py-16 px-4 lg:px-6 border-t border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="container mx-auto text-center">
          <motion.div 
            className="flex items-center justify-center space-x-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Webify
            </h1>
          </motion.div>
          <motion.p 
            className="text-gray-400 mb-6 text-lg lg:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ready to transform your digital presence? Let's create something amazing together.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <NavLink
              to="/chat"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
            >
              <MousePointer className="w-5 h-5" />
              Get Started Now
            </NavLink>
          </motion.div>
        </div>
      </footer>
    </motion.div>
  );
};

export default MainWebsite;
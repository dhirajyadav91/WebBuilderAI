import { PanelTopClose, SquarePen, LogOut, Search, Trash2, User, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import logo from "/genify1.webp";
import icon from "/icon.webp";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authThunks";
import { toast } from "react-hot-toast";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate
} from "motion/react";

function Sidebar({
  setIsSidebarOpen,
  isSidebarOpen,
  setPromt,
  setSandboxFiles,
}) {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { loading } = useSelector((state) => state.auth);

  // Motion values for advanced animations
  const hoverProgress = useMotionValue(0);
  const searchFocusProgress = useMotionValue(0);
  const borderColor = useTransform(
    searchFocusProgress,
    [0, 1],
    ["rgba(255,255,255,0.1)", "rgba(139, 92, 246, 0.5)"]
  );

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axiosClient.get("/chat/allChats");
        if (res.data.success) {
          setChats(res.data.chats);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    setIsSidebarOpen({
      workflowBar: false,
      historyBar: false,
    });
    navigate(`/chat/${chatId}`);
  };

  const handleNewChatClick = () => {
    setPromt([]);
    setSandboxFiles({});
    navigate("/");
    setIsSidebarOpen({
      workflowBar: false,
      historyBar: false,
    });
  };

  useEffect(() => {
    const persistedAuth = localStorage.getItem("persist:auth");
    if (persistedAuth) {
      const parsedAuth = JSON.parse(persistedAuth);
      const user = JSON.parse(parsedAuth.user);
      setFirstName(user.firstName);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(prev => ({ ...prev, historyBar: true }));
      } else {
        setIsSidebarOpen(prev => ({ ...prev, historyBar: false }));
      }
    };

    // Set initial state
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

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

  const deleteChat = async (chatId) => {
    try {
      const res = await axiosClient.delete(`/chat/${chatId}`);
      if (res.data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        toast.success("Chat deleted");
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      toast.error("Failed to delete chat");
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );
    if (confirmDelete) {
      deleteChat(id);
    }
  };

  // Animation handlers
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    animate(searchFocusProgress, 1, { duration: 0.3 });
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    animate(searchFocusProgress, 0, { duration: 0.3 });
  };

  const filteredChats = chats.filter((chat) => {
    const messageText = chat.messages?.[0]?.parts?.[0]?.text?.toLowerCase() || "";
    return messageText.includes(searchTerm.toLowerCase());
  });

  return (
    <AnimatePresence>
      {(isSidebarOpen || window.innerWidth >= 1024) && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          className="fixed lg:relative inset-0 lg:inset-auto h-full w-80 lg:w-96 bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-gray-900/95 backdrop-blur-2xl border-r border-white/10 z-50"
        >
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <img 
                    src={logo} 
                    alt="WebBuilder Logo" 
                    className="h-8 w-8 rounded-lg"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    WebBuilder
                  </span>
                </motion.div>
                
                {/* Close Button - Mobile Only */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(prev => ({
                    ...prev,
                    historyBar: false
                  }))}
                  className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <PanelTopClose className="w-5 h-5" />
                </motion.button>
              </div>

              {/* New Chat Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px -10px rgba(139, 92, 246, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChatClick}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </motion.button>

              {/* Search Bar */}
              <motion.div 
                style={{ borderColor }}
                className="relative mt-4 rounded-2xl border-2 bg-white/5 backdrop-blur-lg transition-all duration-300"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full bg-transparent border-none outline-none py-3.5 pl-12 pr-4 text-white placeholder-gray-400 rounded-2xl"
                />
              </motion.div>
            </div>

            {/* Chat List Section */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                  Recent Chats
                </h3>
                
                <div className="flex-1 overflow-y-auto scroll-hidden space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredChats.length > 0 ? (
                      filteredChats.map((chat, index) => (
                        <motion.div
                          key={chat._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative"
                        >
                          <motion.div
                            whileHover={{ 
                              scale: 1.02,
                              backgroundColor: "rgba(139, 92, 246, 0.1)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChatClick(chat._id)}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {chat.messages?.[0]?.parts?.[0]?.text?.slice(0, 50) || "New Chat"}
                                {(chat.messages?.[0]?.parts?.[0]?.text?.length || 0) > 50 ? "..." : ""}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleDelete(chat._id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200 ml-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="text-gray-500 text-sm mb-2">
                          {searchTerm ? "No matching chats found" : "No chat history yet"}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {searchTerm ? "Try a different search term" : "Start a new conversation!"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <motion.div 
              className="border-t border-white/10 bg-black/20 backdrop-blur-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer mb-3">
                <div className="relative">
                  <img 
                    src={icon} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-xl border-2 border-purple-500/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {firstName || "My Profile"}
                  </p>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
                <User className="w-4 h-4 text-gray-400" />
              </div>

              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(239, 68, 68, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-white font-medium transition-all duration-300 ${
                  loading 
                    ? "bg-gray-600/50 cursor-not-allowed" 
                    : "bg-red-600/20 hover:bg-red-600/30 text-red-400"
                }`}
              >
                <LogOut className="w-4 h-4" />
                {loading ? "Signing out..." : "Sign Out"}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
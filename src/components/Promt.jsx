import { useState, useEffect, useRef } from "react";
import { ArrowUp, Globe, Bot, Sparkles, Zap, Send, User, Code } from "lucide-react";
import logo from "/genify1.webp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router";
import ProgressiveLoader from "./ProgressiveLoader";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate
} from "motion/react";

function Promt({
  promt,
  setPromt,
  onPromptComplete,
  setInitialFiles,
  setIsSidebarOpen,
  chatLoading,
  setChatLoading,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { chatId: paramChatId } = useParams();
  const [chatId, setChatId] = useState(paramChatId || null);
  const [enhancedPrompt, setEnhancedPrompt] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Motion values
  const inputFocus = useMotionValue(0);
  const sendButtonScale = useMotionValue(1);
  const typingIndicatorOpacity = useMotionValue(0);

  const borderColor = useTransform(
    inputFocus,
    [0, 1],
    ["rgba(255,255,255,0.1)", "rgba(59, 130, 246, 0.5)"]
  );

  const glowEffect = useTransform(
    inputFocus,
    [0, 1],
    ["0 0 0px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.3)"]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end"
    });
  }, [promt, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        handleSendPrompt();
      }
    }
  };

  const handleEnhancePrompt = async (userInput) => {
    if (!userInput.trim() || enhancedPrompt) return;

    setEnhancedPrompt(true);
    const originalInput = userInput;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/promptEnhance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: userInput }),
        }
      );

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        finalText += decoder.decode(value);
        const cleaned = finalText
          .replace(/^```(.*?)\n/, "")
          .replace(/```$/, "")
          .trim();

        setInput(cleaned);
      }
    } catch (err) {
      console.error("Enhance error:", err);
      setInput(originalInput);
      // You might want to show a toast here
    } finally {
      setEnhancedPrompt(false);
    }
  };

  useEffect(() => {
    const loadChat = async () => {
      if (!paramChatId) {
        setChatId(null);
        setPromt([]);
        return;
      }

      setChatLoading(true);
      setPromt([]);

      try {
        const res = await axiosClient.get(`/chat/info/${paramChatId}`);

        if (res.data.success) {
          const fetchedChat = res.data.chat;

          const formattedMessages = fetchedChat.messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.parts?.[0]?.text || "",
          }));

          if (fetchedChat.messages) {
            const lastModelMessageWithFiles = [...fetchedChat.messages]
              .reverse()
              .find(
                (msg) =>
                  msg.role === "model" && msg.files && msg.files.length > 0
              );

            if (lastModelMessageWithFiles) {
              const extractedFiles = {};
              for (const file of lastModelMessageWithFiles.files) {
                extractedFiles[file.path] = { code: file.content };
              }

              setInitialFiles(extractedFiles);
            }
          }

          setPromt(formattedMessages);
          setChatId(paramChatId);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        setPromt([
          {
            role: "model",
            content: "⚠️ Failed to load this chat.",
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [paramChatId]);

 
const handleSendPrompt = async () => {
  const trimmedInput = input.trim();
  if (!trimmedInput || loading) return;

  // Add user message and empty model message
  setPromt((prev) => [
    ...prev,
    { role: "user", content: trimmedInput },
    { role: "model", content: "" },
  ]);

  setInput("");
  setLoading(true);
  setIsTyping(true);

  const controller = new AbortController();
  const signal = controller.signal;

  try {
    const endpoint = chatId ? `/chat/explain/${chatId}` : "/chat/explain";
    
    // ✅ IMPORTANT FIX: Backend URL properly check karo
    const backendUrl = import.meta.env.VITE_API_URL;
    
    console.log('🔗 Backend URL Check:', {
      backendUrl: backendUrl,
      endpoint: endpoint,
      fullUrl: `${backendUrl}${endpoint}`
    });

    if (!backendUrl || backendUrl === 'undefined') {
      throw new Error("Backend server not configured. Please check your environment variables.");
    }

    const response = await fetch(
      `${backendUrl}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: trimmedInput,
        }),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let lastUpdate = Date.now();

    const flushBuffer = () => {
      if (buffer) {
        setPromt((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "model") {
            last.content += buffer;
          }
          return [...updated.slice(0, -1), last];
        });
        buffer = "";
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        flushBuffer();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Flush buffer every 50ms for smoother updates
      if (Date.now() - lastUpdate > 50) {
        flushBuffer();
        lastUpdate = Date.now();
      }
    }

    flushBuffer(); // Final flush

    const newChatId = response.headers.get("X-Chat-Id");
    const effectiveChatId = newChatId || chatId;

    if (newChatId) {
      setChatId(newChatId);
      navigate(`/chat/${newChatId}`);
    }

    if (onPromptComplete && trimmedInput) {
      onPromptComplete(trimmedInput, effectiveChatId);
    }
    
    setIsSidebarOpen((prev) => ({
      ...prev,
      workflowBar: true,
    }));
  } catch (error) {
    console.error("💥 Chat error:", error.message || error);
    setPromt((prev) => [
      ...prev.slice(0, -1),
      { 
        role: "model", 
        content: `❌ Error: ${error.message}. Please make sure backend server is running on port .` 
      },
    ]);
  } finally {
    setLoading(false);
    setIsTyping(false);
    textareaRef.current?.focus();
  }
};



  // Loading skeleton for chat loading
  if (chatLoading) {
    return (
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 lg:p-6">
        <div className="flex-1 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] lg:max-w-[60%] ${i % 2 === 0 ? 'bg-blue-600/20' : 'bg-white/10'} rounded-2xl p-4`}>
                <div className="space-y-2">
                  <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-between flex-1 w-full px-4 lg:px-6 pb-4 lg:pb-6"
    >
      {/* Welcome Section - Only shows when no messages */}
      <AnimatePresence>
        {promt.length === 0 && !paramChatId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center mb-8 lg:mb-12 mt-8 lg:mt-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-3 text-2xl lg:text-4xl font-bold text-white mb-4"
            >
              <Zap className="w-8 h-8 lg:w-12 lg:h-12 text-cyan-400" />
              What do you want to build?
            </motion.div>
            <p className="text-gray-400 text-sm lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Create stunning apps & websites by chatting with AI. 
              <span className="block text-cyan-400 mt-2">
                Describe your idea and watch it come to life!
              </span>
            </p>
            
            {/* Quick Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl mx-auto">
              {[
                "Create a portfolio website with dark mode",
                "Build a weather app with React",
                "Design a modern e-commerce landing page",
                "Make a task management dashboard"
              ].map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput(prompt)}
                  className="p-4 text-left bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-300"
                >
                  <div className="text-white text-sm font-medium">{prompt}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className={`w-full max-w-4xl mx-auto flex-1 overflow-y-auto scroll-hidden ${
        promt.length === 0 ? '' : 'pt-6 lg:pt-8 pb-24 lg:pb-28'
      } space-y-6 lg:space-y-8 px-2`}>
        <AnimatePresence mode="popLayout">
          {promt.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`w-full flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "model" ? (
                <motion.div 
                  className="w-full max-w-full lg:max-w-4xl bg-white/5 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/10"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/20 rounded-xl">
                      <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" />
                    </div>
                    <span className="text-cyan-400 text-sm font-semibold">AI Assistant</span>
                  </div>
                  <div className="text-white text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <div className="my-3 rounded-xl overflow-hidden">
                              <SyntaxHighlighter
                                style={codeTheme}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg text-sm lg:text-base"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code
                              className="bg-gray-800 px-2 py-1 rounded-lg text-sm font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="max-w-full lg:max-w-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-lg"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <User className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <span className="text-white/90 text-sm font-semibold">You</span>
                  </div>
                  <div className="text-white text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="max-w-full lg:max-w-4xl bg-white/5 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-xl">
                    <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={promtEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        style={{ 
          boxShadow: glowEffect,
          borderColor 
        }}
        className={`fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto w-full max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-2xl border-2 rounded-2xl lg:rounded-3xl overflow-hidden ${
          promt.length === 0 ? 'lg:max-w-2xl' : ''
        } ${paramChatId ? 'mb-4 lg:mb-0' : ''}`}
      >
        <div className="p-4 lg:p-6">
          <div className="flex items-end gap-3">
            <motion.textarea
              ref={textareaRef}
              value={input}
              autoFocus
              disabled={enhancedPrompt || loading}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => animate(inputFocus, 1, { duration: 0.3 })}
              onBlur={() => animate(inputFocus, 0, { duration: 0.3 })}
              placeholder={
                enhancedPrompt 
                  ? "✨ Enhancing your prompt..." 
                  : "Describe your website or app idea..."
              }
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-base lg:text-lg outline-none resize-none max-h-32 min-h-[60px] py-2 px-4 scroll-hidden"
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex flex-col gap-2">
              <motion.button
                style={{ scale: sendButtonScale }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendPrompt}
                disabled={loading || !input.trim() || enhancedPrompt}
                className={`p-3 rounded-xl transition-all ${
                  loading || !input.trim() || enhancedPrompt
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 cursor-pointer shadow-lg"
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEnhancePrompt(input)}
                disabled={enhancedPrompt || !input.trim()}
                className={`p-3 rounded-xl transition-all ${
                  enhancedPrompt || !input.trim()
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-white/10 hover:bg-white/20 cursor-pointer"
                }`}
              >
                {enhancedPrompt ? (
                  <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Enhance Prompt Button */}
          <AnimatePresence>
            {input.trim() && !enhancedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start mt-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEnhancePrompt(input)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Enhance Prompt
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Promt;
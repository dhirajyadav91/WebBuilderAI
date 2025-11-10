import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authThunks";
import toast from "react-hot-toast";
import { clearError } from "../features/auth/authSlice";
import { motion, AnimatePresence } from "motion/react";

const registerSchema = z
  .object({
    firstName: z.string().min(3, "Name should contain at least 3 characters"),
    emailId: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password should contain at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange"
  });

  const watchedFields = watch();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
    if (error) dispatch(clearError());
  }, [isAuthenticated, error, dispatch, navigate]);

  // Auto-advance steps when fields are valid
  useEffect(() => {
    if (step === 1 && watchedFields.firstName && !errors.firstName) {
      const timer = setTimeout(() => setStep(2), 500);
      return () => clearTimeout(timer);
    }
    if (step === 2 && watchedFields.emailId && !errors.emailId) {
      const timer = setTimeout(() => setStep(3), 500);
      return () => clearTimeout(timer);
    }
  }, [watchedFields, errors, step]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success("Welcome to WebBuilder! 🎉", { id: toastId });
      navigate("/");
    } catch (err) {
      console.error("Register Error:", err);
      const errorMsg = err?.response?.data?.error || err?.message || "Registration failed. Please try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full px-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-lg";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                scale: 0,
              }}
              animate={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-2xl shadow-2xl"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              WebBuilder
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Create your account and start building</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: step >= stepNumber ? 1.2 : 0.8,
                  opacity: step >= stepNumber ? 1 : 0.3
                }}
                className={`w-3 h-3 rounded-full ${
                  step >= stepNumber 
                    ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' 
                    : 'bg-gray-600'
                }`}
              />
              {stepNumber < 4 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-cyan-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("firstName")}
                className={inputClasses}
                placeholder="Full Name"
                onBlur={() => trigger("firstName")}
              />
            </div>
            <AnimatePresence>
              {errors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span>⚠</span> {errors.firstName.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                {...register("emailId")}
                className={inputClasses}
                placeholder="Email Address"
                onBlur={() => trigger("emailId")}
              />
            </div>
            <AnimatePresence>
              {errors.emailId && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span>⚠</span> {errors.emailId.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={inputClasses}
                placeholder="Create Password"
                onBlur={() => trigger("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span>⚠</span> {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={inputClasses}
                placeholder="Confirm Password"
                onBlur={() => trigger("confirmPassword")}
              />
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span>⚠</span> {errors.confirmPassword.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className={`w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'shadow-cyan-500/25'
            } flex items-center justify-center gap-3`}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Creating Account...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6 text-gray-400"
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Sign in here
            </button>
          </motion.p>
        </motion.form>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          🔒 Your data is securely encrypted and protected
        </motion.p>
      </motion.div>
    </div>
  );
};

// Make sure this default export exists
export default Register;
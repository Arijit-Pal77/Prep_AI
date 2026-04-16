import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mail, Lock, User, Rocket, Loader2 } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/welcome");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin ? { email, password } : { username, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Access granted. Initializing...");
        setTimeout(() => navigate("/welcome"), 1000);
      } else {
        setSuccess("Registration successful! Please login.");
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary mx-auto flex items-center justify-center shadow-lg mb-6">
              <BrainCircuit className="text-[#21008e] w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-white mb-2">Prep AI</h1>
            <p className="text-text-dim text-sm font-medium">Join the interview revolution</p>
          </div>

          <div className="flex border-b border-border-dim mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 font-micro transition-all ${isLogin ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-text-dim hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 font-micro transition-all ${!isLogin ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-text-dim hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block font-micro mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. AI-Ninja" 
                      required={!isLogin}
                      className="w-full bg-black/20 border border-border-dim rounded-lg pl-12 pr-4 py-3.5 text-sm focus:border-accent-primary/50 outline-none text-white transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block font-micro mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arijit@example.com" 
                  required
                  className="w-full bg-black/20 border border-border-dim rounded-lg pl-12 pr-4 py-3.5 text-sm focus:border-accent-primary/50 outline-none text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-micro mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-black/20 border border-border-dim rounded-lg pl-12 pr-4 py-3.5 text-sm focus:border-accent-primary/50 outline-none text-white transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-minimal w-full py-4 font-micro"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isLogin ? "Access Terminal" : "Initialize Account")}
            </button>
          </form>

          {/* Feedback messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}

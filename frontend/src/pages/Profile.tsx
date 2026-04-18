import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Save, ArrowLeft, Loader2, CheckCircle, BrainCircuit, LayoutDashboard, LogOut, History, Settings, Menu, X } from "lucide-react";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsername(data.username);
        setEmail(data.email);
      } else {
        navigate("/auth");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ username, email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: "Profile updated successfully!" });
        localStorage.setItem("user", JSON.stringify({ ...JSON.parse(localStorage.getItem("user") || "{}"), username, email }));
      } else {
        setStatus({ type: "error", message: data.error || "Update failed" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const decodedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  return (
    <div className="min-h-screen bg-bg-dark text-text-main font-sans flex overflow-hidden lg:overflow-visible">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 w-[240px] border-r border-border-dim bg-sidebar-bg/95 p-8 flex flex-col shrink-0 z-[50] transition-transform duration-300 transform lg:relative lg:translate-x-0 lg:bg-sidebar-bg/90 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <BrainCircuit className="text-[#21008e] w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold font-headline text-accent-secondary">PrepAI</h1>
          </div>
          <button className="lg:hidden p-2 text-text-dim" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[14px] text-text-dim hover:bg-white/5"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[14px] bg-accent-primary/10 text-accent-primary"
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button 
            onClick={() => navigate("/history")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[14px] text-text-dim hover:bg-white/5"
          >
            <History size={18} />
            <span>History</span>
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[14px] text-text-dim hover:bg-white/5"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-border-dim mt-6">
          <button 
            onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}
            className="flex items-center gap-3 text-text-dim hover:text-red-400 transition-all text-xs font-bold uppercase tracking-widest w-full px-4 py-3 rounded-xl hover:bg-red-500/5 group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-border-dim bg-bg-dark/40 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-text-dim hover:text-accent-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-micro">Profile Settings</h2>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-panel-bg border border-border-dim rounded-full">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs border-2 border-accent-primary">
              {decodedUser?.username?.substring(0, 2).toUpperCase() || "AR"}
            </div>
            <span className="text-sm font-medium">{decodedUser?.username || "Unknown"}</span>
          </div>
        </header>

        <section className="flex-1 p-8 lg:p-12 lg:px-[48px] overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-card p-10">
              <div className="flex items-center gap-8 mb-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-4xl font-bold font-headline text-black shadow-xl">
                    {username?.substring(0, 2).toUpperCase() || "AI"}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-bg-dark border border-border-dim flex items-center justify-center text-accent-primary shadow-lg">
                    <Shield size={16} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline text-text-main mb-1">{username}</h3>
                  <p className="text-text-dim text-sm">{email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-micro">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/20 border border-border-dim rounded-lg pl-12 pr-4 py-3.5 text-sm focus:border-accent-primary/50 outline-none text-text-main transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-micro">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/20 border border-border-dim rounded-lg pl-12 pr-4 py-3.5 text-sm focus:border-accent-primary/50 outline-none text-text-main transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border-dim">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-minimal w-full py-4 font-micro flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
                    Update Credentials
                  </button>

                  <AnimatePresence>
                    {status.message && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-3 p-4 rounded-xl mt-6 ${status.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"} text-xs font-bold justify-center`}
                      >
                        {status.type === "success" ? <CheckCircle size={16} /> : <Save size={16} />}
                        {status.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  BrainCircuit, 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Shield,
  Eye,
  Globe,
  Database,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  Rocket
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = React.useState("general");
  const [successMsg, setSuccessMsg] = React.useState("");
  const [currentTheme, setCurrentTheme] = React.useState(() => JSON.parse(localStorage.getItem("app-theme") || "{}"));
  const [bgTheme, setBgTheme] = React.useState(() => localStorage.getItem("app-bg-theme") || "stars");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleAction = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const applyBgTheme = (type: string) => {
    setBgTheme(type);
    localStorage.setItem("app-bg-theme", type);
    window.dispatchEvent(new Event("app-bg-update"));
    handleAction(`3D Environment: ${type.toUpperCase()} active`);
  };

  const applyThemeProperty = (key: string, value: string) => {
    const updated = { ...currentTheme, [key]: value };
    setCurrentTheme(updated);
    localStorage.setItem("app-theme", JSON.stringify(updated));
    document.documentElement.style.setProperty(`--${key}`, value);
    window.dispatchEvent(new Event("storage"));
  };

  const renderContent = () => {
    switch(activeTab) {
      case "security":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold font-headline text-text-main mb-6">Security Credentials</h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="font-micro">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black/20 border border-border-dim rounded-lg px-4 py-3 text-sm focus:border-accent-primary outline-none text-text-main placeholder:text-text-dim/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-micro">New Password</label>
                    <input type="password" placeholder="Min 8 characters" className="w-full bg-black/20 border border-border-dim rounded-lg px-4 py-3 text-sm focus:border-accent-primary outline-none text-text-main placeholder:text-text-dim/50" />
                  </div>
              <button 
                onClick={() => handleAction("Security credentials updated. Re-authentication may be required.")}
                className="btn-minimal px-8 py-3 w-full"
              >
                Update Password
              </button>
            </div>
            <div className="pt-6 border-t border-border-dim">
              <h4 className="font-micro mb-4">Device Sessions</h4>
              <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium">This Computer — Chrome 123.0</span>
                </div>
                <span className="font-micro">Active Now</span>
              </div>
            </div>
          </motion.div>
        );
      case "notifications":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h3 className="text-xl font-bold font-headline text-text-main">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { id: "eval", label: "Analysis Ready", desc: "Get notified when Gemini finishes evaluating your answer" },
                { id: "sec", label: "Security Alerts", desc: "Alerts for new logins or profile changes" },
                { id: "rem", label: "Practice Reminders", desc: "Weekly motivation to keep your interview skills sharp" }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 glass-card">
                  <div>
                    <div className="text-sm font-bold text-text-main mb-0.5">{item.label}</div>
                    <div className="text-[11px] text-text-dim">{item.desc}</div>
                  </div>
                  <div className="w-12 h-6 bg-accent-primary/20 rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-accent-primary rounded-full translate-x-6" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case "interface":
        const presets = [
          { name: "Dark Luxe", colors: { "bg-dark": "#07070b", "sidebar-bg": "#0a0a0f", "text-main": "#e3e0f8", "accent-primary": "#8b80ff", "panel-bg": "rgba(25, 25, 35, 0.7)", "border-dim": "rgba(255, 255, 255, 0.08)" } },
          { name: "Light Clean", colors: { "bg-dark": "#f8f9fa", "sidebar-bg": "#ffffff", "text-main": "#1a1a2e", "accent-primary": "#4f46e5", "panel-bg": "rgba(255, 255, 255, 0.8)", "border-dim": "rgba(0, 0, 0, 0.08)" } },
          { name: "Neon Cyber", colors: { "bg-dark": "#000000", "sidebar-bg": "#000000", "text-main": "#00ffcc", "accent-primary": "#ff00ff", "panel-bg": "rgba(20, 20, 20, 0.9)", "border-dim": "rgba(0, 255, 204, 0.2)" } },
          { name: "Soft Minimal", colors: { "bg-dark": "#f0f2f5", "sidebar-bg": "#f8f9fb", "text-main": "#4a5568", "accent-primary": "#6366f1", "panel-bg": "rgba(255, 255, 255, 0.5)", "border-dim": "rgba(0, 0, 0, 0.05)" } }
        ];

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div>
              <h3 className="text-xl font-bold font-headline text-text-main mb-6">Theme Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {presets.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => {
                      const updated = { ...currentTheme, ...p.colors };
                      setCurrentTheme(updated);
                      localStorage.setItem("app-theme", JSON.stringify(updated));
                      Object.entries(p.colors).forEach(([k, v]) => document.documentElement.style.setProperty(`--${k}`, v));
                      window.dispatchEvent(new Event("storage"));
                      handleAction(`${p.name} theme applied.`);
                    }}
                    className={`p-4 rounded-xl border font-micro transition-all flex flex-col items-center gap-3 ${currentTheme["bg-dark"] === p.colors["bg-dark"] ? 'border-accent-primary bg-accent-primary/5 text-accent-primary shadow-[0_0_15px_rgba(139,128,255,0.1)]' : 'border-border-dim bg-black/20 text-text-dim hover:border-white/20'}`}
                  >
                    <div className="w-8 h-8 rounded-full border border-white/10" style={{ background: p.colors["bg-dark"] }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="font-micro border-b border-border-dim pb-4">Colors</h4>
                <div className="space-y-4">
                  {[
                    { key: "bg-dark", label: "Background" },
                    { key: "sidebar-bg", label: "Sidebar" },
                    { key: "text-main", label: "Text Color" },
                    { key: "accent-primary", label: "Accent Color" }
                  ].map(c => (
                    <div key={c.key} className="flex items-center justify-between group">
                      <span className="font-micro">{c.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-text-dim group-hover:text-text-main transition-colors">{currentTheme[c.key] || "#Default"}</span>
                        <input 
                          type="color" 
                          value={currentTheme[c.key] || (c.key === 'bg-dark' ? '#07070b' : '#ffffff')}
                          onChange={(e) => applyThemeProperty(c.key, e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-micro border-b border-border-dim pb-4">Typography</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-micro opacity-70">Headline Font</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Grotesk", val: '"Space Grotesk", sans-serif' },
                        { label: "Serif", val: '"Playfair Display", serif' },
                        { label: "Outfit", val: '"Outfit", sans-serif' }
                      ].map(f => (
                          <button 
                            key={f.label}
                            onClick={() => applyThemeProperty("font-headline-var", f.val)}
                            className={`py-2.5 rounded-lg border font-micro transition-all ${currentTheme["font-headline-var"] === f.val ? 'border-accent-primary text-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/10' : 'border-border-dim text-text-dim shadow-sm'}`}
                          >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-micro opacity-70">Interface Font</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Inter", val: '"Inter", sans-serif' },
                        { label: "Mono", val: '"Roboto Mono", monospace' },
                        { label: "Outfit", val: '"Outfit", sans-serif' }
                      ].map(f => (
                          <button 
                            key={f.label}
                            onClick={() => applyThemeProperty("font-sans-var", f.val)}
                            className={`py-2.5 rounded-lg border font-micro transition-all ${currentTheme["font-sans-var"] === f.val ? 'border-accent-primary text-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/10' : 'border-border-dim text-text-dim'}`}
                          >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-micro border-b border-border-dim pb-4">3D Environment</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "stars", label: "Neural Space", icon: <Sparkles size={14} /> },
                    { id: "particles", label: "Quantum Dust", icon: <Database size={14} /> },
                    { id: "grid", label: "System Matrix", icon: <Globe size={14} /> },
                    { id: "shapes", label: "Geometry", icon: <Rocket size={14} /> },
                    { id: "abstract", label: "Deep Void", icon: <Shield size={14} /> },
                    { id: "none", label: "Off", icon: <X size={14} /> }
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => applyBgTheme(b.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${bgTheme === b.id ? 'border-accent-primary bg-accent-primary/5 text-accent-primary' : 'border-border-dim hover:border-white/20 text-text-dim'}`}
                    >
                      <div className={`p-2 rounded-lg bg-black/40 ${bgTheme === b.id ? 'text-accent-primary' : 'text-text-dim'}`}>
                        {b.icon}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold font-micro">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 glass-card border-accent-primary/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-3xl pointer-events-none" />
               <div className="flex items-start gap-4">
                 <Sparkles className="text-accent-primary shrink-0" size={20} />
                 <div>
                   <h5 className="text-sm font-bold text-text-main mb-2">◆ Arijit</h5>
                   <p className="text-xs text-text-dim leading-relaxed">
                     designing logic · crafting systems · evolving self
                   </p>
                 </div>
               </div>
            </div>
          </motion.div>
        );
      case "system":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h3 className="text-xl font-bold font-headline text-text-main">Connectivity & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 glass-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Database size={20} />
                </div>
                <div>
                   <div className="text-[11px] font-bold uppercase tracking-widest text-text-dim mb-1">Database</div>
                   <div className="text-sm font-bold text-text-main">MySQL (Cloud Hosted)</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Online</span>
                </div>
              </div>
              <div className="p-5 glass-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <BrainCircuit size={20} />
                </div>
                <div>
                   <div className="text-[11px] font-bold uppercase tracking-widest text-text-dim mb-1">AI Engine</div>
                   <div className="text-sm font-bold text-text-main">Gemini 1.5 Pro (API)</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-main">Data Management</h4>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleAction("Exporting session data as JSON...")}
                  className="flex-1 py-4 glass-card hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <Globe size={16} /> Export Data
                </button>
                <button 
                  onClick={() => handleAction("History cleared successfully.")}
                  className="flex-1 py-4 border border-red-500/20 text-red-500/80 hover:bg-red-500/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <Database size={16} /> Purge Sessions
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <div className="space-y-12">
            {[
              {
                title: "Account & Profile",
                items: [
                  { icon: <User size={18} />, label: "Personal Information", desc: "Manage your name and contact details", action: () => navigate("/profile") },
                  { icon: <Shield size={18} />, label: "Security", desc: "Change password and session control", action: () => setActiveTab("security") },
                ]
              },
              {
                title: "App Experience",
                items: [
                  { icon: <Bell size={18} />, label: "Notifications", desc: "AI analysis and interview reminders", action: () => setActiveTab("notifications") },
                  { icon: <Eye size={18} />, label: "Interface", desc: "Customize minimalism levels & theme", action: () => setActiveTab("interface") },
                ]
              },
              {
                title: "System",
                items: [
                  { icon: <Globe size={18} />, label: "Connectivity", desc: "MySQL and API status control", action: () => setActiveTab("system") },
                ]
              }
            ].map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim border-b border-border-dim pb-4 ml-2">
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -2 }}
                      onClick={item.action}
                      className="glass-card p-6 flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center text-accent-primary border border-border-dim group-hover:bg-accent-primary/10 transition-all">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-main mb-0.5">{item.label}</div>
                          <div className="text-[11px] text-text-dim">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-dim group-hover:text-accent-primary transition-all" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

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

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[240px] border-r border-border-dim bg-sidebar-bg/95 p-8 flex flex-col shrink-0 z-[50] transition-transform duration-300 transform lg:relative lg:translate-x-0 lg:bg-sidebar-bg/90 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/welcome")}>
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
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" onClick={() => navigate("/dashboard")} />
          <NavItem icon={<User size={18}/>} label="Profile" onClick={() => navigate("/profile")} />
          <NavItem icon={<History size={18}/>} label="History" onClick={() => navigate("/history")} />
          <NavItem icon={<Settings size={18}/>} label="Settings" active={true} />
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

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-border-dim bg-bg-dark/40 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2 text-text-dim hover:text-accent-primary transition-colors"
             >
               <Menu size={24} />
             </button>
             {activeTab !== "general" && (
               <button 
                 onClick={() => setActiveTab("general")}
                 className="p-2 hover:bg-accent-primary/5 rounded-full text-text-dim hover:text-text-main transition-all"
               >
                 <ArrowLeft size={18} />
               </button>
             )}
             <h2 className="font-micro">System Console</h2>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-panel-bg border border-border-dim rounded-full">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs border-2 border-accent-primary">
              {user?.username?.substring(0, 2).toUpperCase() || "AR"}
            </div>
            <span className="text-sm font-medium">{user?.username || "Unknown"}</span>
          </div>
        </header>

        <section className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-8 p-4 glass-card bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-bold text-center uppercase tracking-widest"
                >
                  <Sparkles size={14} className="inline-block mr-2" />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === "general" && (
              <div className="mb-12">
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/5 border border-accent-primary/10 text-accent-primary font-micro mb-4">
                  <Sparkles size={12} />
                  Global Preferences
                </div>
                <h1 className="text-3xl font-bold font-headline text-text-main mb-2">Settings</h1>
                <p className="text-text-dim text-sm">Fine-tune your experience with the PrepAI ecosystem.</p>
              </div>
            )}

            {renderContent()}

            {activeTab === "general" && (
              <div className="mt-16 p-8 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col items-center gap-4 text-center">
                <div className="font-micro text-red-400">Danger Zone</div>
                <p className="text-text-dim text-xs max-w-sm">Deleting your data is permanent and cannot be undone. All AI analysis results will be lost.</p>
                <button 
                  onClick={() => handleAction("System cache and session data wiped.")}
                  className="px-8 py-3 rounded-xl border border-red-500/20 text-red-500 font-micro hover:bg-red-500/10 transition-all"
                >
                  Wipe All Cache & Data
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[14px] ${active ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-dim hover:bg-accent-primary/5'}`}
    >
      <span className={`${active ? 'text-accent-primary' : 'text-text-dim'}`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

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
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Filter,
  X,
  AlertCircle
} from "lucide-react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [selectedSession, setSelectedSession] = React.useState<any>(null);

  const [history, setHistory] = React.useState(() => {
    const saved = JSON.parse(localStorage.getItem("app-sessions") || "[]");
    if (saved.length === 0) {
      return [
        { id: 1, type: "Evaluator", date: "2026-04-15", time: "14:30", score: "85", topic: "Intro to React", details: "Score: 85\nStrength: Clear structure\nWeakness: Needs more technical depth\nIdeal Answer: React is a library for building user interfaces..." },
        { id: 2, type: "Interview", date: "2026-04-14", time: "09:15", score: "72", topic: "Software Engineering", details: "Question: What is polymorphism?\nAnswer: It is many forms.\n\nFeedback: You should refine the definition with examples from OOP like method overriding." },
        { id: 3, type: "Evaluator", date: "2026-04-12", time: "18:45", score: "91", topic: "Behavioral", details: "Score: 91\nStrength: Excellent STAR method usage\nWeakness: None noted\nIdeal Answer: Keep doing what you're doing." },
        { id: 4, type: "Evaluator", date: "2026-04-10", time: "11:20", score: "64", topic: "Python Basics", details: "Score: 64\nStrength: Identified list vs tuple\nWeakness: Confused dictionary with sets\nIdeal Answer: Dictionaries are key-value pairs..." },
      ];
    }
    return saved;
  });

  const filteredHistory = history.filter((item: any) => {
    const topic = item.topic || "";
    const type = item.type || "";
    const matchesSearch = topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-bg-dark text-text-main font-sans flex overflow-hidden">
      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-border-dim flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedSession.type === 'Evaluator' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-secondary/10 text-accent-secondary'}`}>
                    {selectedSession.type === 'Evaluator' ? <LayoutDashboard size={20} /> : <History size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{selectedSession.topic}</h3>
                    <p className="font-micro opacity-60">{selectedSession.date} • {selectedSession.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-white/5 rounded-full text-text-dim hover:text-text-main transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto space-y-8">
                <div className="flex items-end gap-4">
                  <div className="text-5xl font-bold font-headline text-text-main">{selectedSession.score}%</div>
                  <div className="font-micro text-emerald-400 pb-1">Mastery Score</div>
                </div>

                <div className="space-y-6">
                  <div className="font-micro opacity-50 border-b border-border-dim pb-2 uppercase tracking-widest">Detail Summary</div>
                  <div className="bg-black/20 p-6 rounded-xl border border-border-dim">
                    {selectedSession.details ? selectedSession.details.split('\n').map((line: string, i: number) => (
                      <p key={i} className="text-sm leading-relaxed mb-3 last:mb-0 text-text-dim">
                        {line}
                      </p>
                    )) : (
                       <div className="flex items-center gap-3 text-amber-400">
                         <AlertCircle size={14} />
                         <span className="font-micro">No detailed breakdown available for this session.</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-dim bg-white/5">
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="btn-minimal w-full py-3 font-micro"
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-[240px] border-r border-border-dim bg-sidebar-bg/90 p-8 lg:flex flex-col hidden shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/welcome")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <BrainCircuit className="text-[#21008e] w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold font-headline text-accent-secondary">PrepAI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" onClick={() => navigate("/dashboard")} />
          <NavItem icon={<User size={18}/>} label="Profile" onClick={() => navigate("/profile")} />
          <NavItem icon={<History size={18}/>} label="History" active={true} />
          <NavItem icon={<Settings size={18}/>} label="Settings" onClick={() => navigate("/settings")} />
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
      <main className="flex-1 relative flex flex-col h-screen">
        <header className="h-20 border-b border-border-dim bg-bg-dark/40 backdrop-blur-xl flex items-center justify-between px-12 sticky top-0 z-30 shrink-0">
          <h2 className="font-micro">Session History</h2>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-panel-bg border border-border-dim rounded-full">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs border-2 border-accent-primary">
              {user?.username?.substring(0, 2).toUpperCase() || "AR"}
            </div>
            <span className="text-sm font-medium">{user?.username || "Unknown"}</span>
          </div>
        </header>

        <section className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
              <div>
                <h1 className="text-3xl font-bold font-headline text-text-main mb-2">My History</h1>
                <p className="text-text-dim text-sm">Review your previous module sessions and tracking.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input 
                    type="text" 
                    placeholder="Search sessions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/20 border border-border-dim rounded-lg pl-10 pr-4 py-2 text-xs focus:border-accent-primary/50 outline-none w-64 text-text-main"
                  />
                </div>
                <div className="relative group">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-panel-bg border border-border-dim rounded-lg font-micro hover:text-text-main transition-all"
                  >
                    <Filter size={14} />
                    {filterType || "Filter"}
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-sidebar-bg border border-border-dim rounded-xl hidden group-hover:block z-50 p-2 shadow-2xl">
                    <button onClick={() => setFilterType(null)} className="w-full text-left px-3 py-2 text-xs font-micro hover:bg-white/5 rounded-lg">All Types</button>
                    <button onClick={() => setFilterType("Evaluator")} className="w-full text-left px-3 py-2 text-xs font-micro hover:bg-white/5 rounded-lg">Evaluator</button>
                    <button onClick={() => setFilterType("Interview")} className="w-full text-left px-3 py-2 text-xs font-micro hover:bg-white/5 rounded-lg">Interview</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredHistory.length > 0 ? filteredHistory.map((item: any) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedSession(item)}
                  className="glass-card p-6 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${item.type === 'Evaluator' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-secondary/10 text-accent-secondary'}`}>
                      {item.type === 'Evaluator' ? <LayoutDashboard size={20} /> : <InterviewIcon size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-text-main">{item.topic}</span>
                        <span className="font-micro px-2 py-0.5 rounded-full bg-white/5 border border-border-dim">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-micro opacity-60">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {item.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {item.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-xl font-bold font-headline text-text-main">{item.score}%</div>
                      <div className="font-micro text-emerald-400">Score</div>
                    </div>
                    <ChevronRight className="text-text-dim group-hover:text-accent-primary transition-all" size={18} />
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 bg-black/10 rounded-3xl border border-dashed border-border-dim">
                   <Filter className="mx-auto w-10 h-10 text-text-dim mb-4 opacity-20" />
                   <p className="font-micro opacity-50">No sessions found matching your criteria</p>
                </div>
              )}
            </div>
            
            <div className="mt-12 text-center">
              <p className="font-micro">Showing {filteredHistory.length} sessions</p>
            </div>
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
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[14px] ${active ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-dim hover:bg-white/5'}`}
    >
      <span className={`${active ? 'text-accent-primary' : 'text-text-dim'}`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function InterviewIcon(props: any) {
  return (
    <div className="bg-accent-secondary/20 p-2 rounded-lg">
      <History {...props} size={18} className="text-accent-secondary" />
    </div>
  );
}

function Mic2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 8-9.07 9.07a2.13 2.13 0 1 0 3 3L15 11" />
      <path d="m21.73 18.27-2.7-2.7a2.13 2.13 0 0 0-3 0l-1.07 1.07a2.13 2.13 0 0 1-3 0l-2.7-2.7a2.13 2.13 0 0 1 0-3l1.07-1.07a2.13 2.13 0 0 0 0-3l-2.7-2.7a2.13 2.13 0 0 0-3 0l-2.7 2.7a2.13 2.13 0 0 0 0 3l2.7 2.7" />
    </svg>
  );
}

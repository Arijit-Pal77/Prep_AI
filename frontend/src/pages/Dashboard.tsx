import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, 
  Mic2, 
  User, 
  History, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronRight,
  Send,
  Loader2,
  Trash2,
  Trophy,
  Target,
  AlertCircle,
  Rocket,
  BrainCircuit,
  Menu,
  X,
  LineChart,
  BarChart as BarChartIcon,
  Activity,
  Award
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { evaluateAnswer, getInterviewQuestion, evaluateInterviewTurn } from "../lib/gemini";
import { StatCard, PerformanceAreaChart, TopicAnalysisChart } from "../components/StatsComponents";

type Mode = "evaluate" | "interview" | "analytics";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>((searchParams.get("mode") as Mode) || "evaluate");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "evaluate" || urlMode === "interview" || urlMode === "analytics") {
      setMode(urlMode);
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [interviewState, setInterviewState] = useState<{
    running: boolean;
    currentQuestion: string | null;
    history: string[];
    feedback: string | null;
  }>({
    running: false,
    currentQuestion: null,
    history: [],
    feedback: null
  });

  const [topic, setTopic] = useState("Software Engineering");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Moderate");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (mode === "analytics") {
      fetchStats();
    }
  }, [mode]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        localStorage.removeItem("token");
        navigate("/auth");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/stats", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const saveSession = async (type: "evaluate" | "interview", topic: string, score: number, details: string) => {
    // Save to LocalStorage for offline/immediate view
    const sessions = JSON.parse(localStorage.getItem("app-sessions") || "[]");
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newSessionLocal = {
      id: Date.now(),
      type: type === "evaluate" ? "Evaluator" : "Interview",
      topic: topic,
      score: score.toString(),
      details: details,
      date,
      time
    };
    localStorage.setItem("app-sessions", JSON.stringify([newSessionLocal, ...sessions]));

    // Save to Backend for Analytics
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          type: type === "evaluate" ? "Evaluator" : "Interview",
          topic,
          score,
          details,
          date,
          time
        })
      });
    } catch (err) {
      console.error("Could not sync session to backend", err);
    }
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const resp = await evaluateAnswer(answer);
      setResult(resp || "No evaluation found");
      
      const scoreMatch = resp?.match(/Score:\s*(\d+)/i);
      if (scoreMatch) {
        saveSession("evaluate", "Answer Evaluation", parseInt(scoreMatch[1]), resp || "");
      }
    } catch (err) {
      console.error(err);
      setResult("Error evaluating answer. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    setLoading(true);
    const finalTopic = topic === "Custom" ? customTopic : topic;
    try {
      const q = await getInterviewQuestion(finalTopic || "General", difficulty);
      setInterviewState({
        running: true,
        currentQuestion: q || "Tell me about yourself.",
        history: [],
        feedback: null
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitInterviewTurn = async () => {
    if (!answer.trim() || !interviewState.currentQuestion) return;
    setLoading(true);
    try {
      const resp = await evaluateInterviewTurn(answer, interviewState.currentQuestion);
      
      const feedbackMatch = resp?.match(/Feedback: ([\s\S]*?)Next Question:/i);
      const nextQMatch = resp?.match(/Next Question: ([\s\S]*)/i);
      const scoreMatch = resp?.match(/Score:\s*(\d+)/i);

      if (scoreMatch) {
        const finalTopic = topic === "Custom" ? customTopic : topic;
        const sessionDetails = `Question: ${interviewState.currentQuestion}\nAnswer: ${answer}\n\nFeedback: ${feedbackMatch ? feedbackMatch[1].trim() : "Good effort!"}`;
        saveSession("interview", finalTopic || "Interview", parseInt(scoreMatch[1]), sessionDetails);
      }

      setInterviewState(prev => ({
        ...prev,
        feedback: feedbackMatch ? feedbackMatch[1].trim() : "Good effort!",
        currentQuestion: nextQMatch ? nextQMatch[1].trim() : "That's all for now.",
        history: [...prev.history, `Q: ${prev.currentQuestion}`, `A: ${answer}`]
      }));
      setAnswer("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalytics = () => {
    if (statsLoading && !stats) {
      return (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-accent-primary" />
        </div>
      );
    }

    if (!stats || stats.overview.totalAttempts === 0) {
      return (
        <div className="glass-card p-20 text-center opacity-50 flex flex-col items-center">
          <AlertCircle size={48} className="mb-4" />
          <h2 className="text-xl font-bold font-headline mb-2">No Performance Data</h2>
          <p className="font-micro">Complete some practice sessions to unlock analytics.</p>
          <button 
            onClick={() => setMode("evaluate")}
            className="btn-minimal mt-8 px-8"
          >
            Start Practice
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Attempts" 
            value={stats.overview.totalAttempts} 
            icon={<Activity size={20} />} 
            color="bg-violet-600"
          />
          <StatCard 
            label="Mastery Level" 
            value={`${stats.overview.avgScore}%`} 
            icon={<Award size={20} />} 
            color="bg-cyan-500"
          />
          <StatCard 
            label="Record High" 
            value={`${stats.overview.recordHigh}%`} 
            icon={<Trophy size={20} />} 
            color="bg-amber-500"
          />
          <StatCard 
            label="Consistency" 
            value={`${stats.overview.consistency}%`} 
            icon={<Target size={20} />} 
            color="bg-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                <LineChart className="text-accent-primary" size={20} />
                Progress Timeline
              </h3>
              <div className="text-[10px] font-micro opacity-40 uppercase tracking-widest">Last 30 Sessions</div>
            </div>
            <PerformanceAreaChart data={stats.trend} />
          </div>

          <div className="glass-card p-8">
            <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-2">
              <BarChartIcon className="text-accent-secondary" size={20} />
              Domain Mastery
            </h3>
            <TopicAnalysisChart data={stats.topicAnalysis} />
          </div>
        </div>
      </div>
    );
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
          <NavItem 
            icon={<LayoutDashboard size={18}/>} 
            label="Dashboard" 
            active={mode === "evaluate" || mode === "interview" || mode === "analytics"}
          />
          <NavItem 
            icon={<User size={18}/>} 
            label="Profile" 
            onClick={() => navigate("/profile")}
          />
          <NavItem 
            icon={<History size={18}/>} 
            label="History" 
            onClick={() => navigate("/history")}
          />
          <NavItem 
            icon={<Settings size={18}/>} 
            label="Settings" 
            onClick={() => navigate("/settings")}
          />
        </nav>

        <div className="pt-6 border-t border-border-dim mt-6">
          <div className="font-micro leading-relaxed mb-4">
            System Securely Encrypted<br />
            Analytics Engine Live
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 font-micro hover:text-red-400 transition-all w-full px-4 py-3 rounded-xl hover:bg-red-500/5 group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-y-auto">
        {/* Galaxy Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-600/3 blur-[120px] rounded-full" />
        </div>

        {/* Header */}
        <header className="h-20 border-b border-border-dim bg-bg-dark/40 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 lg:gap-8">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-text-dim hover:text-accent-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-micro">
              {mode === "evaluate" ? "Answer Evaluator" : mode === "interview" ? "Interview Sim" : "Performance Analytics"}
            </h2>
            
            <div className="h-6 w-[1.5px] bg-border-dim hidden md:block"></div>
            
            <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-border-dim">
              <button 
                onClick={() => { setMode("evaluate"); setResult(null); }}
                className={`px-6 py-2 rounded-lg font-micro transition-all ${mode === "evaluate" ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' : 'text-text-dim hover:text-text-main'}`}
              >
                Evaluator
              </button>
              <button 
                onClick={() => { setMode("interview"); setAnswer(""); }}
                className={`px-6 py-2 rounded-lg font-micro transition-all ${mode === "interview" ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' : 'text-text-dim hover:text-text-main'}`}
              >
                Interview
              </button>
              <button 
                onClick={() => setMode("analytics")}
                className={`px-6 py-2 rounded-lg font-micro transition-all ${mode === "analytics" ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' : 'text-text-dim hover:text-text-main'}`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-panel-bg border border-border-dim rounded-full cursor-pointer hover:bg-panel-bg/80 transition-all" onClick={() => navigate("/profile")}>
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs border-2 border-accent-primary">
                {user?.username?.substring(0, 2).toUpperCase() || "AR"}
              </div>
              <span className="text-sm font-medium">{user?.username || "Loading..."}</span>
            </div>
          </div>
        </header>

        <section className="p-8 lg:p-12 lg:px-[48px] relative z-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {mode === "analytics" ? (
               <motion.div 
                 key="analytics"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.98 }}
               >
                 {renderAnalytics()}
               </motion.div>
            ) : mode === "evaluate" ? (
              <motion.div 
                key="evaluate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-3">
                   <div className="mb-8">
                    <h1 className="text-3xl font-bold font-headline text-text-main mb-1">
                      Welcome back, {user?.username?.split(' ')[0] || "Alex"}
                    </h1>
                    <p className="text-text-dim text-sm">
                      Master your communication with AI-driven analysis.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card p-6 flex justify-between items-center bg-gradient-to-r from-accent-primary/15 via-transparent to-transparent">
                    <div className="flex-1 mr-6">
                      <div className="font-micro mb-4">Input Console</div>
                      <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="e.g. 'I am a highly motivated developer with a passion for problem-solving...'"
                        className="w-full h-48 bg-black/20 border border-border-dim rounded-lg p-4 text-sm leading-relaxed outline-none focus:border-accent-primary/40 focus:ring-1 focus:ring-accent-primary/20 transition-all resize-none text-text-main"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                       <button 
                        onClick={handleEvaluate}
                        disabled={loading || !answer.trim()}
                        className="btn-minimal min-w-[140px] flex items-center justify-center gap-2 font-micro"
                      >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Rocket size={16} />}
                        Analyze
                      </button>
                      <button 
                        onClick={() => { setAnswer(""); setResult(null); }}
                        className="font-micro hover:text-text-main transition-all text-center"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="glass-card p-6 h-full flex flex-col">
                    <div className="font-micro mb-4">AI Feedback</div>

                    <div className="flex-1 bg-black/20 border border-border-dim rounded-lg p-5 overflow-y-auto">
                      {result ? (
                        <div className="space-y-5">
                          {result.split('\n').map((line, i) => {
                            if (line.startsWith('Score:')) {
                              return (
                                <div key={i} className="">
                                  <div className="text-4xl font-bold font-headline text-text-main">{line.split(':')[1]}</div>
                                  <div className="font-micro text-emerald-400 mt-1">Current Readiness</div>
                                </div>
                              );
                            }
                            if (line.startsWith('Strength:') || line.startsWith('Weakness:') || line.startsWith('Ideal Answer:')) {
                              const [title, ...rest] = line.split(':');
                              return (
                                <div key={i} className="pt-3 border-t border-border-dim first:border-0 first:pt-0">
                                  <h4 className="font-micro mb-1 opacity-70">{title}</h4>
                                  <p className="text-sm text-text-main leading-relaxed">{rest.join(':')}</p>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8">
                          <AlertCircle size={32} className="mb-4 text-text-dim" />
                          <p className="font-micro">Submit your answer to see the analysis result</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="interview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {!interviewState.running ? (
                  <div className="glass-card p-10 text-center relative overflow-hidden bg-gradient-to-br from-accent-primary/10 via-transparent to-transparent">
                    <div className="relative z-10 py-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary mx-auto flex items-center justify-center mb-8 shadow-xl">
                        <Mic2 size={32} className="text-black" />
                      </div>
                      <h1 className="text-3xl font-bold font-headline text-text-main mb-2">Simulated Interview</h1>
                      <p className="text-text-dim text-sm mb-10 max-w-sm mx-auto">
                        Practice real-time scenarios with adaptive difficulty.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-10 text-left">
                        <div className="space-y-2">
                          <label className="font-micro">Domain / Topic</label>
                          <select 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-black/40 border border-border-dim rounded-lg px-4 py-3 text-sm focus:border-accent-primary outline-none"
                          >
                            <option>Software Engineering</option>
                            <option>React Developer</option>
                            <option>Python / AI Specialist</option>
                            <option>HR & Behavioral</option>
                            <option>UX/UI Design</option>
                            <option value="Custom">Other / Custom...</option>
                          </select>
                        </div>
                        {topic === "Custom" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2 col-span-full sm:col-span-1"
                          >
                            <label className="font-micro">Specify Topic</label>
                            <input 
                              type="text"
                              value={customTopic}
                              onChange={(e) => setCustomTopic(e.target.value)}
                              placeholder="e.g. Cloud Architecture"
                              className="w-full bg-black/40 border border-border-dim rounded-lg px-4 py-3 text-sm focus:border-accent-primary outline-none text-text-main"
                            />
                          </motion.div>
                        )}
                        <div className="space-y-2">
                          <label className="font-micro">Difficulty</label>
                          <div className="flex gap-1.5 h-full">
                            {["Easy", "Moderate", "Hard"].map((lv) => (
                              <button
                                key={lv}
                                onClick={() => setDifficulty(lv)}
                                className={`flex-1 py-3 font-micro rounded-lg transition-all border ${difficulty === lv ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30' : 'bg-black/20 border-border-dim text-text-dim'}`}
                              >
                                {lv}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={startInterview}
                        className="btn-minimal px-12"
                      >
                         Start Simulation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-micro text-emerald-400">Live Simulation</span>
                        </div>
                        <button onClick={() => setInterviewState(s => ({ ...s, running: false }))} className="text-text-dim hover:text-text-main transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-micro mb-4">The Question</h4>
                          <div className="bg-black/20 p-6 rounded-xl border border-border-dim border-l-4 border-l-accent-primary">
                            <p className="text-lg font-semibold text-text-main leading-relaxed">
                              {interviewState.currentQuestion}
                            </p>
                          </div>
                        </div>

                        {interviewState.feedback && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-accent-primary/5 border border-accent-primary/10 p-5 rounded-xl"
                          >
                            <h4 className="font-micro text-accent-primary mb-2">AI Critique</h4>
                            <p className="text-sm text-text-dim leading-relaxed italic">
                              "{interviewState.feedback}"
                            </p>
                          </motion.div>
                        )}

                        <div>
                          <h4 className="font-micro mb-4">Your Response</h4>
                          <div className="relative">
                            <textarea 
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Speak your mind here..."
                              className="w-full h-36 bg-black/40 border border-border-dim rounded-xl p-5 text-sm leading-relaxed outline-none focus:border-accent-primary/40 transition-all resize-none text-text-main"
                            />
                            <button 
                              onClick={submitInterviewTurn}
                              disabled={loading || !answer.trim()}
                              className="absolute bottom-4 right-4 w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center text-black shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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

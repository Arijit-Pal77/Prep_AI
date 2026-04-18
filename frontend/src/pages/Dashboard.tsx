import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  Award,
  FileText,
  BookOpen,
  Upload,
  Languages,
  Download,
  Sparkles,
  Calendar,
  Map as MapIcon,
  Layers,
  Clock,
  ScrollText,
  Copy,
  Check
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { evaluateAnswer, getInterviewQuestion, evaluateInterviewTurn, generateExplanation, generateSyllabusPlan } from "../lib/gemini";
import { StatCard, PerformanceAreaChart, TopicAnalysisChart } from "../components/StatsComponents";

type Mode = "evaluate" | "interview" | "analytics" | "explainer" | "syllabus";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>((searchParams.get("mode") as Mode) || "evaluate");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "evaluate" || urlMode === "interview" || urlMode === "analytics" || urlMode === "explainer" || urlMode === "syllabus") {
      setMode(urlMode as Mode);
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
    elapsedSeconds: number;
  }>({
    running: false,
    currentQuestion: null,
    history: [],
    feedback: null,
    elapsedSeconds: 0
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

  useEffect(() => {
    let interval: any;
    if (interviewState.running && interviewState.currentQuestion && !loading) {
      interval = setInterval(() => {
        setInterviewState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewState.running, interviewState.currentQuestion, loading]);

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

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
        return;
      }

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

  const saveSession = async (type: "evaluate" | "interview" | "explainer" | "syllabus", topic: string, score: number, details: string) => {
    // Save to LocalStorage for offline/immediate view
    const sessions = JSON.parse(localStorage.getItem("app-sessions") || "[]");
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    let displayType = "Evaluator";
    if (type === "interview") displayType = "Interview";
    if (type === "explainer") displayType = "Explainer";
    if (type === "syllabus") displayType = "Syllabus";

    const newSessionLocal = {
      id: Date.now(),
      type: displayType,
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
          type: displayType,
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
        feedback: null,
        elapsedSeconds: 0
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
        history: [...prev.history, `Q: ${prev.currentQuestion}`, `A: ${answer} (Time: ${prev.elapsedSeconds}s)`],
        elapsedSeconds: 0
      }));
      setAnswer("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [explainerContent, setExplainerContent] = useState("");
  const [explainerLang, setExplainerLang] = useState<"English" | "Hindi">("English");
  const [explainerMode, setExplainerMode] = useState<"Normal" | "ELI10" | "Exam">("Normal");
  const [explainerResult, setExplainerResult] = useState<string | null>(null);
  const [explainerFileName, setExplainerFileName] = useState<string | null>(null);

  const [syllabusContent, setSyllabusContent] = useState("");
  const [syllabusSubject, setSyllabusSubject] = useState("");
  const [syllabusDate, setSyllabusDate] = useState("");
  const [syllabusResult, setSyllabusResult] = useState<string | null>(null);
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);

  const [downloadState, setDownloadState] = useState<{
    active: boolean;
    progress: number;
    message: string;
  }>({
    active: false,
    progress: 0,
    message: ""
  });

  const explainerRef = useRef<HTMLDivElement>(null);
  const syllabusRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const exportToPDF = async (elementRef: React.RefObject<HTMLDivElement>, fileName: string, titleStr: string) => {
    if (!elementRef.current) return;
    
    setDownloadState({ active: true, progress: 10, message: "Initializing professional vector engine..." });
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = 30;
      let pageNum = 1;

      const drawPageFrame = (num: number) => {
        // Decorative border lines (Technical look)
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.line(margin - 5, 10, margin - 5, pageHeight - 10); // Left accent line
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(140);
        pdf.text('PREPAI ACADEMIC REPORT', margin, 15);
        pdf.setFont("helvetica", "normal");
        pdf.text(`REF: #${Math.random().toString(36).substr(2, 6).toUpperCase()}`, margin + 50, 15);
        pdf.text(`PAGE ${num}`, pageWidth - margin, 15, { align: 'right' });
        
        pdf.setDrawColor(100);
        pdf.setLineWidth(0.2);
        pdf.line(margin, 18, pageWidth - margin, 18);
      };

      drawPageFrame(pageNum);

      // Title Section
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(20);
      const titleLines = pdf.splitTextToSize(titleStr, contentWidth);
      pdf.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 10) + 12;

      const renderNode = (node: Element, level = 0) => {
        const tag = node.tagName.toLowerCase();
        let fontSize = 10;
        let fontStyle = "normal";
        let spacingAfter = 5;
        let prefix = "";
        let textColor = [50, 50, 50]; 

        if (tag.startsWith('h')) {
          fontSize = tag === 'h1' ? 14 : tag === 'h2' ? 12 : 11;
          fontStyle = "bold";
          spacingAfter = 6;
          textColor = [0, 0, 0];
          // Add a small spacer line before headers
          if (currentY > 40) {
            pdf.setDrawColor(230);
            pdf.line(margin + (level * 8), currentY - 2, margin + (level * 8) + 20, currentY - 2);
          }
        } else if (tag === 'li') {
          prefix = "- "; // Using standard hyphen for maximum compatibility
          spacingAfter = 3;
        }

        // Clean text of characters that break standard PDF encoding
        let text = node.textContent?.trim() || "";
        if (!text) return;
        
        // Clean symbols to safe ASCII equivalents for high quality rendering
        text = text
          .replace(/→|->/g, ">>") // Double arrow for "next"
          .replace(/•|◦/g, "-")   // Safe bullets
          .replace(/[^\x00-\x7F]/g, ""); // Stripping any remaining non-ASCII to prevent artifacts like %ae

        pdf.setFont("helvetica", fontStyle);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        const lines = pdf.splitTextToSize(prefix + text, contentWidth - (level * 8));
        const lineHeightMm = (fontSize * 1.4) * 0.3527; 
        const totalHeight = lines.length * lineHeightMm;

        // Smart page break
        if (currentY + totalHeight > pageHeight - 25) {
          pdf.addPage();
          pageNum++;
          drawPageFrame(pageNum);
          currentY = 30;
          pdf.setFont("helvetica", fontStyle);
          pdf.setFontSize(fontSize);
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        }

        pdf.text(lines, margin + (level * 8), currentY);
        currentY += totalHeight + spacingAfter;
      };

      const items = Array.from(elementRef.current.querySelectorAll('h1, h2, h3, p, li'));
      
      items.forEach((child, index) => {
        const isLi = child.tagName.toLowerCase() === 'li';
        renderNode(child, isLi ? 1 : 0);
        
        const progress = 10 + Math.floor((index / items.length) * 80);
        setDownloadState(prev => ({ ...prev, progress, message: `Vectorizing block ${index + 1}...` }));
      });

      // ADD FOOTER / CERTIFICATION
      if (currentY + 20 < pageHeight - 20) {
        currentY += 10;
        pdf.setDrawColor(240);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(7);
        pdf.setTextColor(180);
        pdf.text('This document was digitally prepared by PrepAI Adaptive Systems.', margin, currentY);
        pdf.text(`TS: ${new Date().toISOString()}`, pageWidth - margin, currentY, { align: 'right' });
      }

      setDownloadState({ active: true, progress: 100, message: "Finalizing high-fidelity report..." });
      
      setTimeout(() => {
        pdf.save(`${fileName}.pdf`);
        setDownloadState({ active: false, progress: 0, message: "" });
      }, 500);

    } catch (error) {
      console.error('PDF Export Error:', error);
      setDownloadState({ active: false, progress: 0, message: "" });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSyllabusPlan = async () => {
    if (!syllabusContent.trim()) return;
    setLoading(true);
    try {
      const resp = await generateSyllabusPlan(syllabusContent, syllabusSubject, syllabusDate);
      setSyllabusResult(resp || "No plan generated");
      if (resp) {
        saveSession("syllabus", syllabusSubject || "Syllabus Strategy", 0, resp);
      }
    } catch (err) {
      console.error(err);
      setSyllabusResult("Error generating plan. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainer = async () => {
    if (!explainerContent.trim()) return;
    setLoading(true);
    try {
      const resp = await generateExplanation(explainerContent, explainerLang, explainerMode);
      setExplainerResult(resp || "No analysis found");
      if (resp) {
        saveSession("explainer", explainerContent.substring(0, 30) + "...", 0, resp);
      }
    } catch (err) {
      console.error(err);
      setExplainerResult("Error generating explanation. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "explainer" | "syllabus") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const pdfjs = await import("pdfjs-dist");
            // Set worker source to unpkg .mjs which is required for v5+
            pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            
            const arrayBuffer = reader.result as ArrayBuffer;
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(" ");
              fullText += pageText + "\n";
            }
            if (target === "explainer") {
              setExplainerContent(fullText);
              setExplainerFileName(file.name);
            } else {
              setSyllabusContent(fullText);
              setSyllabusFileName(file.name);
            }
          } catch (err) {
            console.error("PDF extraction error", err);
            alert("Error reading PDF content.");
          } finally {
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        setLoading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (target === "explainer") {
          setExplainerContent(reader.result as string);
          setExplainerFileName(file.name);
        } else {
          setSyllabusContent(reader.result as string);
          setSyllabusFileName(file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderExplainer = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
              <BookOpen className="text-accent-primary" size={20} />
              Study Content
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-micro">Academic Input</label>
                {explainerFileName ? (
                  <div className="w-full h-64 bg-accent-primary/5 border border-accent-primary/30 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
                      <FileText className="text-accent-primary" size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-text-main">
                        {explainerFileName}
                      </p>
                      <p className="font-micro text-emerald-400">Successfully Uploaded</p>
                    </div>
                    <button 
                      onClick={() => {
                        setExplainerFileName(null);
                        setExplainerContent("");
                      }}
                      className="text-xs text-text-dim hover:text-red-400 transition-all underline underline-offset-4"
                    >
                      Remove and type instead
                    </button>
                  </div>
                ) : (
                  <textarea 
                    value={explainerContent}
                    onChange={(e) => setExplainerContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        handleExplainer();
                      }
                    }}
                    placeholder="Paste topic, syllabus, or complex text..."
                    className="w-full h-64 bg-black/20 border border-border-dim rounded-lg p-4 text-sm leading-relaxed outline-none focus:border-accent-primary/40 transition-all resize-none text-text-main"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input 
                    type="file" 
                    id="pdf-upload" 
                    className="hidden" 
                    accept=".pdf,.txt" 
                    onChange={(e) => handleFileChange(e, "explainer")}
                  />
                  <label 
                    htmlFor="pdf-upload" 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-panel-bg border border-border-dim rounded-xl font-micro hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <Upload size={16} />
                    {loading ? "Reading..." : explainerFileName ? "Change File" : "Upload PDF/Text"}
                  </label>
                </div>
                <button 
                  onClick={() => {
                    setExplainerContent("");
                    setExplainerFileName(null);
                  }}
                  className="p-3 bg-panel-bg border border-border-dim rounded-xl text-text-dim hover:text-red-400 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-micro">Language</label>
                  <div className="flex bg-black/20 p-1 rounded-lg border border-border-dim">
                    <button 
                      onClick={() => setExplainerLang("English")}
                      className={`flex-1 py-2 rounded-md font-micro text-[10px] transition-all ${explainerLang === "English" ? "bg-accent-primary text-black" : "text-text-dim"}`}
                    >
                      ENG
                    </button>
                    <button 
                      onClick={() => setExplainerLang("Hindi")}
                      className={`flex-1 py-2 rounded-md font-micro text-[10px] transition-all ${explainerLang === "Hindi" ? "bg-accent-primary text-black" : "text-text-dim"}`}
                    >
                      HIN
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-micro">Strictness</label>
                  <select 
                    value={explainerMode}
                    onChange={(e) => setExplainerMode(e.target.value as any)}
                    className="w-full bg-black/20 border border-border-dim rounded-lg px-3 py-2 text-xs focus:border-accent-primary outline-none"
                  >
                    <option value="Normal">Balanced</option>
                    <option value="ELI10">Simple (10yo)</option>
                    <option value="Exam">Exam Mode</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleExplainer}
                disabled={loading || !explainerContent.trim()}
                className="btn-minimal w-full py-4 flex items-center justify-center gap-3 font-micro"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles size={18} />}
                Generate Explanation
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10 min-h-[600px] flex flex-col relative overflow-hidden">
            <div className="font-micro mb-8 border-b border-border-dim pb-4 flex items-center justify-between">
              <span>Structured Output</span>
              {explainerResult && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => copyToClipboard(explainerResult, 'explainer')}
                    className="flex items-center gap-2 text-text-dim hover:text-accent-primary transition-all text-[10px] uppercase tracking-wider"
                  >
                    {copied === 'explainer' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'explainer' ? "Copied" : "Copy Notes"}
                  </button>
                  <button 
                    onClick={() => exportToPDF(explainerRef, `Explanation-${Date.now()}`, "AI Explanation & Concept Breakdown")}
                    disabled={downloadState.active}
                    className={`flex items-center gap-2 text-accent-primary hover:underline font-bold text-[10px] uppercase tracking-wider transition-all ${downloadState.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1" ref={explainerRef}>
              {explainerResult ? (
                <div className="prose prose-invert max-w-none">
                  <div className="space-y-6">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold font-headline text-accent-primary mb-6" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold font-headline text-accent-primary mb-4" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold font-headline text-accent-primary mb-3" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-md font-bold font-headline text-accent-primary mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed text-text-main mb-4" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-6" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex gap-3 text-sm text-text-main">
                            <span className="text-accent-secondary mt-1.5 shrink-0">•</span>
                            <span>{props.children}</span>
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="text-accent-secondary font-bold" {...props} />,
                      }}
                    >
                      {explainerResult}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <FileText size={40} className="text-text-dim" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">Ready to Explain</h3>
                  <p className="font-micro max-w-xs mx-auto">Upload a PDF or paste text to generate structured, exam-ready notes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSyllabusNavigator = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
              <Layers className="text-accent-secondary" size={20} />
              Syllabus Engine
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-micro">Subject Name</label>
                <input 
                  type="text"
                  value={syllabusSubject}
                  onChange={(e) => setSyllabusSubject(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  className="w-full bg-black/20 border border-border-dim rounded-lg px-4 py-3 text-sm focus:border-accent-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-micro">Exam Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                  <input 
                    type="date"
                    value={syllabusDate}
                    onChange={(e) => setSyllabusDate(e.target.value)}
                    className="w-full bg-black/20 border border-border-dim rounded-lg pl-12 pr-4 py-3 text-sm focus:border-accent-primary outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-micro">Syllabus Details (PDF or Text)</label>
                {syllabusFileName ? (
                  <div className="w-full h-40 bg-accent-secondary/5 border border-accent-secondary/30 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-accent-secondary/10 flex items-center justify-center">
                      <FileText className="text-accent-secondary" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-main line-clamp-1">
                        {syllabusFileName}
                      </p>
                      <p className="text-[10px] font-micro text-emerald-400">Ready to Analyze</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSyllabusFileName(null);
                        setSyllabusContent("");
                      }}
                      className="text-[10px] text-text-dim hover:text-red-400 transition-all underline underline-offset-4"
                    >
                      Clear File
                    </button>
                  </div>
                ) : (
                  <textarea 
                    value={syllabusContent}
                    onChange={(e) => setSyllabusContent(e.target.value)}
                    placeholder="Paste syllabus modules or upload PDF..."
                    className="w-full h-40 bg-black/20 border border-border-dim rounded-lg p-4 text-sm leading-relaxed outline-none focus:border-accent-primary/40 transition-all resize-none text-text-main"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input 
                    type="file" 
                    id="syllabus-upload" 
                    className="hidden" 
                    accept=".pdf,.txt" 
                    onChange={(e) => handleFileChange(e, "syllabus")}
                  />
                  <label 
                    htmlFor="syllabus-upload" 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-panel-bg border border-border-dim rounded-xl font-micro hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <Upload size={16} />
                    {loading ? "Reading..." : syllabusFileName ? "Change Syllabus" : "Upload Syllabus"}
                  </label>
                </div>
                <button 
                  onClick={() => {
                    setSyllabusContent("");
                    setSyllabusFileName(null);
                  }}
                  className="p-3 bg-panel-bg border border-border-dim rounded-xl text-text-dim hover:text-red-400 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <button 
                onClick={handleSyllabusPlan}
                disabled={loading || !syllabusContent.trim()}
                className="btn-minimal w-full py-4 flex items-center justify-center gap-3 font-micro"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <MapIcon size={18} />}
                Build Exam Strategy
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10 min-h-[600px] flex flex-col relative overflow-hidden bg-gradient-to-br from-accent-secondary/5 to-transparent">
            <div className="font-micro mb-8 border-b border-border-dim pb-4 flex items-center justify-between">
              <span>Smart Strategy Guide</span>
              {syllabusResult && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => copyToClipboard(syllabusResult, 'syllabus')}
                    className="flex items-center gap-2 text-text-dim hover:text-accent-secondary transition-all text-[10px] uppercase tracking-wider"
                  >
                    {copied === 'syllabus' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'syllabus' ? "Copied" : "Copy Roadmap"}
                  </button>
                  <button 
                    onClick={() => exportToPDF(syllabusRef, `Syllabus-Strategy-${Date.now()}`, syllabusSubject || "Syllabus Strategy Guide")}
                    disabled={downloadState.active}
                    className={`flex items-center gap-2 text-accent-secondary hover:underline font-bold text-[10px] uppercase tracking-wider transition-all ${downloadState.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download size={14} /> Save Strategy
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1" ref={syllabusRef}>
              {syllabusResult ? (
                <div className="prose prose-invert max-w-none">
                  <div className="space-y-8">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold font-headline text-text-main mb-8 pb-2 border-b border-white/10" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold font-headline text-text-main mb-6 mt-10" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold font-headline text-text-main mb-4" {...props} />,
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed text-text-main mb-4" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-6" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex gap-3 text-sm text-text-main glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-secondary shrink-0" />
                            <span>{props.children}</span>
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="text-accent-secondary font-bold" {...props} />,
                      }}
                    >
                      {syllabusResult}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <MapIcon size={40} className="text-text-dim" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">Build Your Roadmap</h3>
                  <p className="font-micro max-w-xs mx-auto">Upload your exam syllabus to receive a ranked topic list, study plan, and revision strategy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

        {/* History Box - Recent Activity */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold font-headline flex items-center gap-2">
              <History className="text-accent-primary" size={20} />
              Recent Activity
            </h3>
            <button 
              onClick={() => navigate("/history")}
              className="font-micro text-xs text-accent-primary hover:underline underline-offset-4"
            >
              View Full History
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            {stats.recent?.length > 0 ? stats.recent.map((item: any) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 bg-black/20 border border-border-dim rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                onClick={() => navigate("/history")}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'Evaluator' ? 'bg-accent-primary/10 text-accent-primary' : 
                    item.type === 'Interview' ? 'bg-accent-secondary/10 text-accent-secondary' :
                    item.type === 'Explainer' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {item.type === 'Evaluator' ? <LayoutDashboard size={18} /> : 
                     item.type === 'Interview' ? <History size={18} /> :
                     item.type === 'Explainer' ? <BookOpen size={18} /> :
                     <ScrollText size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-main group-hover:text-accent-primary transition-colors">{item.topic}</h4>
                    <p className="font-micro text-[10px] opacity-50">{item.date} • {item.type}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="font-headline text-lg font-bold text-text-main">
                    {item.type === 'Explainer' || item.type === 'Syllabus' ? "GEN" : `${item.score}%`}
                  </div>
                  <ChevronRight size={16} className="text-text-dim group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40 italic font-micro border border-dashed border-border-dim rounded-xl">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main font-sans flex overflow-hidden lg:overflow-visible selection:bg-accent-primary/30">
      <AnimatePresence>
        {downloadState.active && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="w-full max-w-md p-10 text-center space-y-8">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="377"
                    initial={{ strokeDashoffset: 377 }}
                    animate={{ strokeDashoffset: 377 - (377 * downloadState.progress) / 100 }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    className="text-accent-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold font-micro">{downloadState.progress}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-headline">Generating Premium Report</h3>
                <p className="text-text-dim font-micro text-sm animate-pulse">
                  {downloadState.message}
                </p>
              </div>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                    className="w-1 h-3 bg-accent-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            active={mode === "evaluate" || mode === "interview" || mode === "analytics" || mode === "explainer" || mode === "syllabus"}
          />
          <NavItem 
            icon={<User size={18}/>} 
            label="Profile" 
            onClick={() => { setIsSidebarOpen(false); navigate("/profile"); }}
          />
          <NavItem 
            icon={<History size={18}/>} 
            label="History" 
            onClick={() => { setIsSidebarOpen(false); navigate("/history"); }}
          />
          <NavItem 
            icon={<Settings size={18}/>} 
            label="Settings" 
            onClick={() => { setIsSidebarOpen(false); navigate("/settings"); }}
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
              {mode === "evaluate" ? "Answer Evaluator" : mode === "interview" ? "Interview Sim" : mode === "explainer" ? "AI Explainer" : mode === "syllabus" ? "Syllabus Navigator" : "Performance Analytics"}
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
              <button 
                onClick={() => { setMode("explainer"); setExplainerResult(null); }}
                className={`px-6 py-2 rounded-lg font-micro transition-all ${mode === "explainer" ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' : 'text-text-dim hover:text-text-main'}`}
              >
                Explainer
              </button>
              <button 
                onClick={() => { setMode("syllabus"); setSyllabusResult(null); }}
                className={`px-6 py-2 rounded-lg font-micro transition-all ${mode === "syllabus" ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' : 'text-text-dim hover:text-text-main'}`}
              >
                Syllabus
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-3 px-4 py-1.5 bg-panel-bg border border-border-dim rounded-full cursor-pointer hover:bg-panel-bg/80 transition-all" 
              onClick={() => { 
                setIsSidebarOpen(false); 
                navigate("/profile"); 
              }}
            >
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
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
               >
                 {renderAnalytics()}
               </motion.div>
            ) : mode === "explainer" ? (
              <motion.div 
                key="explainer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {renderExplainer()}
              </motion.div>
            ) : mode === "syllabus" ? (
              <motion.div 
                key="syllabus"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {renderSyllabusNavigator()}
              </motion.div>
            ) : mode === "evaluate" ? (
              <motion.div 
                key="evaluate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            handleEvaluate();
                          }
                        }}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-lg border border-border-dim font-mono text-xs text-accent-primary">
                            <Clock size={12} />
                            {Math.floor(interviewState.elapsedSeconds / 60).toString().padStart(2, '0')}:
                            {(interviewState.elapsedSeconds % 60).toString().padStart(2, '0')}
                          </div>
                          <button onClick={() => setInterviewState(s => ({ ...s, running: false }))} className="text-text-dim hover:text-text-main transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
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
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.shiftKey) {
                                  e.preventDefault();
                                  submitInterviewTurn();
                                }
                              }}
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

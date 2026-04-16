import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Mic2, 
  User, 
  BrainCircuit, 
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = user.username?.split(' ')[0] || "Agent";

  const headlineVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const features = [
    {
      id: "evaluate",
      title: "Answer Evaluator",
      description: "Submit your written answers and receive detailed AI scores, strengths, and improvement points.",
      icon: <Rocket className="w-8 h-8 text-accent-primary" />,
      path: "/dashboard?mode=evaluate",
      color: "from-accent-primary/20"
    },
    {
      id: "interview",
      title: "Mock Interview",
      description: "Experience an adaptive, real-time interview simulation with follow-up questions tailored to your performance.",
      icon: <Mic2 className="w-8 h-8 text-accent-secondary" />,
      path: "/dashboard?mode=interview",
      color: "from-accent-secondary/20"
    },
    {
      id: "profile",
      title: "Profile Settings",
      description: "Manage your personal information, security credentials, and view your progress insights.",
      icon: <User className="w-8 h-8 text-text-dim" />,
      path: "/profile",
      color: "from-white/5"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main font-sans selection:bg-accent-primary/30">
      <main className="relative z-10 max-w-6xl mx-auto px-8 py-20 lg:py-32">
        <header className="mb-16 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-micro mb-6"
          >
            <Sparkles size={14} />
            System Initialized
          </motion.div>
          
          <motion.h1 
            variants={headlineVariant}
            initial="hidden"
            animate="show"
            className="text-display text-text-main mb-6 flex flex-wrap gap-x-4 justify-center lg:justify-start"
          >
            {"Welcome back,".split(" ").map((word, i) => (
              <motion.span key={i} variants={letterVariant}>{word}</motion.span>
            ))}
            <motion.span variants={letterVariant} className="text-accent-secondary">
              {username}
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-text-dim text-lg lg:text-xl max-w-2xl leading-relaxed"
          >
            Your mission to career excellence starts here. Select a module to begin your professional evolution.
          </motion.p>
        </header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              variants={item}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(feature.path)}
              className="glass-card p-8 group cursor-pointer relative overflow-hidden flex flex-col h-full bg-gradient-to-br from-transparent to-transparent hover:to-white/5 transition-all duration-500"
            >
              {/* Feature Gradient Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="mb-8 relative z-10 transition-transform duration-500 group-hover:scale-110">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold font-headline text-text-main mb-4 relative z-10">
                {feature.title}
              </h3>
              
              <p className="text-text-dim text-sm leading-relaxed mb-8 flex-1 relative z-10">
                {feature.description}
              </p>

              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest transition-all relative z-10 p-1">
                <span className="text-accent-primary group-hover:pl-2 transition-all">Initialize Module</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-accent-primary" />
              </div>
              
              {/* Modern Card Border Lighting Effect */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 pt-8 border-t border-border-dim flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-emerald-400 font-micro">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Core Online
            </div>
            <div className="flex items-center gap-3 font-micro">
              <ShieldCheck size={14} />
              Session Secure
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-text-dim hover:text-text-main transition-all text-xs font-bold uppercase tracking-widest"
            >
              <LayoutDashboard size={16} />
              Go to Last Active
            </button>
            <div className="h-4 w-[1.5px] bg-border-dim" />
            <button 
              onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}
              className="text-text-dim hover:text-red-400 transition-all text-xs font-bold uppercase tracking-widest"
            >
              Terminate Session
            </button>
          </div>
        </motion.footer>
      </main>

      {/* Aesthetic Tech HUD elements */}
      <div className="fixed top-8 right-8 pointer-events-none hidden lg:block opacity-20">
          <div className="font-micro text-right leading-relaxed">
          SYS_ID: {Math.random().toString(16).substring(2, 8).toUpperCase()}<br />
          LOC: ASIA_PAC_SE1<br />
          ENC: AES_256_GCM
        </div>
      </div>
    </div>
  );
}

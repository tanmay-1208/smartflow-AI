import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Zap, Activity, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

export default function Home() {
  const [counts, setCounts] = useState({ tx: 0, months: 0, cash: 0 });
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startCounting();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  const startCounting = () => {
    let startTime = null;
    const duration = 2000;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setCounts({
        tx: Math.floor(ease * 35),
        months: Math.floor(ease * 6),
        cash: Math.floor(ease * 36)
      });
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white font-inter overflow-hidden scroll-smooth">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .mesh-bg {
          background: radial-gradient(circle at 15% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
          animation: meshPulse 8s ease-in-out infinite alternate;
        }
        
        @keyframes meshPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .float-fast { animation: float 3s ease-in-out infinite; }
        .float-slow { animation: float 5s ease-in-out infinite; }

        .glow-card {
          position: relative;
          background: rgba(17, 24, 39, 0.6);
        }
        .glow-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(45deg, rgba(16, 185, 129, 0.5), rgba(59, 130, 246, 0.5), transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .glow-card:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#0a0f1a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-emerald-400" size={24} />
            <span className="font-jakarta text-xl font-bold tracking-tight">SmartFlow AI</span>
          </div>
          <Link to="/login" className="px-5 py-2 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 px-4 md:px-6 mesh-bg overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs md:text-sm font-medium border border-blue-500/20">
              <Sparkles size={14} /> Now with AI Advisor
            </div>
            <h1 className="font-jakarta text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.2] md:leading-[1.1] tracking-tight">
              Smart Cash Flow for <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Indian Businesses</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              AI-powered forecasting, real-time tracking, and intelligent insights to keep your finances growing safely.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                Get Started Free <ChevronRight size={18} />
              </Link>
              <Link to="/dashboard" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-semibold transition-all">
                View Demo
              </Link>
            </div>
          </div>
          
          {/* Floating Visuals (Improved for desktop, hidden on very small mobile) */}
          <div className="relative lg:h-[500px] items-center justify-center hidden lg:flex">
            <div className="absolute w-64 p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl float-slow top-10 right-10 z-20">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-emerald-400" />
                <span className="font-medium text-white">Monthly Income</span>
              </div>
              <div className="text-3xl font-jakarta font-bold text-white">₹2,45,000</div>
              <div className="text-sm text-emerald-400 mt-2">+12% vs last month</div>
            </div>
            
            <div className="absolute w-72 p-6 rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 shadow-2xl float-fast bottom-10 left-10 z-30">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="text-blue-400" size={20} />
                </div>
                <div>
                  <div className="font-semibold mb-1 text-white">AI Insight</div>
                  <div className="text-sm text-gray-400">You can reduce operational expenses by 15% this week.</div>
                </div>
              </div>
            </div>
            
            <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-600/20 blur-3xl absolute opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#0a0f1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-jakarta text-3xl md:text-4xl font-bold">Everything you need to scale</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Built specifically to handle the dynamic cash flow needs of small and medium enterprises.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glow-card rounded-2xl p-8 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                <Activity className="text-blue-400" />
              </div>
              <h3 className="font-jakarta text-xl font-bold mb-3 text-white">Real-time Tracking</h3>
              <p className="text-gray-400 leading-relaxed">Live transaction sync with seamless categorization. Know exactly where every rupee goes instantly.</p>
            </div>
            
            <div className="glow-card rounded-2xl p-8 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <TrendingUp className="text-purple-400" />
              </div>
              <h3 className="font-jakarta text-xl font-bold mb-3 text-white">AI Forecasting</h3>
              <p className="text-gray-400 leading-relaxed">ML-powered cash flow predictions utilizing OLS regression models to spot trends before they happen.</p>
            </div>
            
            <div className="glow-card rounded-2xl p-8 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <Sparkles className="text-emerald-400" />
              </div>
              <h3 className="font-jakarta text-xl font-bold mb-3 text-white">Smart Insights</h3>
              <p className="text-gray-400 leading-relaxed">Personalized financial advice through our conversational AI. Ask questions and get actionable steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={counterRef} className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"></div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
          <div className="space-y-2">
            <div className="font-jakarta text-5xl md:text-6xl font-black text-white">{counts.tx}+</div>
            <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Transactions Tracked</div>
          </div>
          <div className="space-y-2">
            <div className="font-jakarta text-5xl md:text-6xl font-black text-white">{counts.months}</div>
            <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Months Analyzed</div>
          </div>
          <div className="space-y-2">
            <div className="font-jakarta text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">₹{counts.cash}K+</div>
            <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Cash Flow Managed</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 text-center text-gray-500 text-sm">
        Built for Indian SMBs · © 2026 SmartFlow AI
      </footer>
    </div>
  );
}
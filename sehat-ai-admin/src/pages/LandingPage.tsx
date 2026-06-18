import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Globe,
  Zap,
  HeartPulse,
  Stethoscope,
  Calendar,
  Users,
  Brain,
  ChevronRight,
  Star,
  Menu,
  X,
} from "lucide-react";

/* ── tiny counter hook ── */
const useCounter = (end: number, duration = 2000) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [end, duration]);
  return val;
};

export const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const doctors  = useCounter(500);
  const patients = useCounter(12000);
  const accuracy = useCounter(98);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#199A8E]/20 overflow-x-hidden">

      {/* ═══════════════════  BACKGROUND GRADIENTS  ═══════════════════ */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] bg-[#199A8E]/8 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] -right-[8%] w-[35%] h-[50%] bg-indigo-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-[#199A8E]/4 rounded-full blur-[160px]" />
      </div>

      {/* ═══════════════════  NAVBAR  ═══════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[72px] flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#199A8E] to-[#117a71] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#199A8E]/20 group-hover:shadow-[#199A8E]/40 transition-shadow">
              <HeartPulse size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Sehat<span className="text-[#199A8E]">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-500">
            {["Platform", "Solutions", "Trust & Security"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ & /g, "-")}`}
                className="relative hover:text-[#199A8E] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#199A8E] after:transition-all hover:after:w-full">
                {l}
              </a>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link to="/signin-select"
              className="hidden sm:inline-flex px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-300/50 active:scale-[.97]">
              Sign In
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3 animate-in slide-in-from-top">
            {["Platform", "Solutions", "Trust & Security"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-600 hover:text-[#199A8E]">
                {l}
              </a>
            ))}
            <Link to="/signin-select" className="block w-full text-center py-3 bg-[#199A8E] text-white font-bold rounded-xl mt-2">
              Sign In
            </Link>
          </div>
        )}
      </nav>

      {/* ═══════════════════  HERO  ═══════════════════ */}
      <header className="relative pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">

          {/* Text */}
          <div className="lg:w-[55%] space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#199A8E]/10 text-[#199A8E] rounded-full text-[11px] font-black uppercase tracking-[.12em]">
              <Zap size={13} className="fill-current" />
              <span>AI-Powered Healthcare</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] font-black leading-[1.08] tracking-tight">
              Smarter Care,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#199A8E] via-[#1aad9f] to-[#483D8B]">
                Better Lives.
              </span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Streamline your medical practice with intelligent appointment
              management, AI-powered diagnostics, and real-time patient insights
              — all in one seamless platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signin-select"
                className="group px-8 py-4 bg-[#199A8E] text-white rounded-2xl font-bold text-base shadow-xl shadow-[#199A8E]/25 hover:shadow-[#199A8E]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5">
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-base border border-slate-200 hover:border-[#199A8E]/30 hover:bg-[#199A8E]/[.03] transition-all">
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {["#6EE7B7", "#93C5FD", "#FCA5A5", "#FCD34D"].map((c, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-[3px] border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-sm text-slate-500">
                Trusted by <span className="font-bold text-slate-800">500+</span> medical specialists
              </p>
            </div>
          </div>

          {/* Hero Visuals */}
          <div className="lg:w-[45%] relative">
            {/* Main image card */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden border border-slate-100 rotate-1 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://img.freepik.com/free-vector/health-professional-team-concept-illustration_114360-1618.jpg"
                alt="Sehat AI Healthcare"
                className="w-full object-cover"
              />
            </div>

            {/* Floating badge — top-right */}
            <div className="absolute -top-4 -right-4 z-20 bg-slate-900 px-4 py-3 rounded-2xl shadow-2xl text-white flex items-center gap-2.5">
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-wide">2.4k+ Active Bookings</span>
            </div>

            {/* Floating badge — bottom-left */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security</p>
                <p className="font-bold text-slate-900 text-sm">End-to-End Encrypted</p>
              </div>
            </div>

            {/* Decorative blur circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#199A8E]/10 rounded-full blur-[80px] -z-10" />
          </div>
        </div>
      </header>

      {/* ═══════════════════  STATS BAR  ═══════════════════ */}
      <section className="relative -mt-10 z-20 max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {[
            { label: "Doctors",      value: `${doctors}+`,     icon: Stethoscope },
            { label: "Patients",     value: `${patients.toLocaleString()}+`, icon: Users },
            { label: "AI Accuracy",  value: `${accuracy}%`,    icon: Brain },
            { label: "Uptime",       value: "99.9%",           icon: Activity },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center py-8 gap-1">
              <s.icon size={20} className="text-[#199A8E] mb-1" />
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{s.value}</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════  FEATURES  ═══════════════════ */}
      <section className="py-28 bg-white" id="platform">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#199A8E] bg-[#199A8E]/10 rounded-full mb-4">
              Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Built for Modern Medicine
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Our ecosystem provides everything needed to move from paperwork to digital precision.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Activity,
                title: "AI Diagnostics",
                desc: "Assist clinical decisions with real-time data analysis and evidence-based recommendations.",
                color: "from-[#199A8E] to-emerald-600",
              },
              {
                icon: Globe,
                title: "Universal Access",
                desc: "Access patient records securely from any device, anywhere, at any time.",
                color: "from-indigo-500 to-violet-600",
              },
              {
                icon: Stethoscope,
                title: "Specialist Network",
                desc: "Connect with verified doctors across all departments and specialties instantly.",
                color: "from-amber-500 to-orange-600",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Intelligent appointment management that automatically prevents conflicts and double-bookings.",
                color: "from-sky-500 to-blue-600",
              },
              {
                icon: ShieldCheck,
                title: "Data Security",
                desc: "End-to-end encryption ensures complete protection for every patient record.",
                color: "from-rose-500 to-pink-600",
              },
              {
                icon: Brain,
                title: "Predictive Analytics",
                desc: "Leverage machine learning models to predict patient trends and optimize care outcomes.",
                color: "from-[#199A8E] to-teal-600",
              },
            ].map((f, i) => (
              <div key={i}
                className="group relative p-8 rounded-3xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200 transition-all duration-300 cursor-default">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                <ChevronRight size={16} className="absolute top-8 right-8 text-slate-300 group-hover:text-[#199A8E] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════  SOLUTIONS (How it Works)  ═══════════════════ */}
      <section className="py-28 bg-slate-50/60" id="solutions">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#199A8E] bg-[#199A8E]/10 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Three Steps to Digital Healthcare
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Getting started with Sehat AI takes less than 5 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Your Account", desc: "Sign up as a doctor or admin and complete your verified profile in minutes." },
              { step: "02", title: "Set Your Schedule", desc: "Configure weekly availability, consultation fees, and specialization preferences." },
              { step: "03", title: "Start Receiving Patients", desc: "Patients discover you, book appointments, and you get real-time notifications." },
            ].map((s, i) => (
              <div key={i} className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow group">
                <span className="text-6xl font-black text-[#199A8E]/10 group-hover:text-[#199A8E]/20 transition-colors absolute top-6 right-8 select-none">
                  {s.step}
                </span>
                <div className="w-10 h-10 bg-[#199A8E] text-white rounded-xl flex items-center justify-center text-sm font-black mb-6">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════  TESTIMONIALS  ═══════════════════ */}
      <section className="py-28 bg-white" id="trust-security">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#199A8E] bg-[#199A8E]/10 rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Loved by Healthcare Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Dr. Ayesha Khan", role: "Cardiologist", quote: "Sehat AI has transformed how I manage my practice. The scheduling system alone saved me hours every week." },
              { name: "Dr. Omar Farooq", role: "ENT Specialist", quote: "The AI-powered diagnostics are impressively accurate. My patients love the seamless booking experience." },
              { name: "Dr. Sara Ahmed", role: "Dermatologist", quote: "Security was my biggest concern. Sehat AI's end-to-end encryption gave me complete peace of mind." },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#199A8E] to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════  CTA SECTION  ═══════════════════ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-12 sm:p-16 text-center overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#199A8E] to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-24 bg-[#199A8E]/20 blur-3xl" />

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 relative">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8 relative">
              Join hundreds of healthcare professionals who are already using Sehat AI
              to deliver smarter, faster, and more secure patient care.
            </p>
            <Link to="/signin-select"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-[#199A8E] text-white rounded-2xl font-bold text-base shadow-xl shadow-[#199A8E]/30 hover:shadow-[#199A8E]/50 hover:-translate-y-0.5 transition-all relative">
              Get Started — It's Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════  FOOTER  ═══════════════════ */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#199A8E] to-[#117a71] rounded-lg flex items-center justify-center text-white">
                <HeartPulse size={16} />
              </div>
              <span className="text-base font-extrabold text-slate-800">
                Sehat<span className="text-[#199A8E]">AI</span>
              </span>
            </div>

            <div className="flex items-center gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-[#199A8E] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#199A8E] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#199A8E] transition-colors">Contact</a>
            </div>

            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Sehat AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

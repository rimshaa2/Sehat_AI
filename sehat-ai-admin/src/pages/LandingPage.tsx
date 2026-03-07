import { Link } from "react-router-dom";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Globe,
  Zap,
  HeartPulse,
  Stethoscope,
} from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#199A8E]/30 text-slate-900">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#199A8E]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-[#483D8B]/5 rounded-full blur-[100px]" />
      </div>

      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#199A8E] to-[#117a71] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <HeartPulse size={26} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Sehat AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a
              href="#features"
              className="hover:text-[#199A8E] transition-colors"
            >
              Platform
            </a>
            <a
              href="#solutions"
              className="hover:text-[#199A8E] transition-colors"
            >
              Solutions
            </a>
            <a href="#trust" className="hover:text-[#199A8E] transition-colors">
              Trust & Security
            </a>
          </div>

          <Link
            to="/signin-select"
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
          {/* Hero Text */}
          <div className="lg:w-1/2 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#199A8E]/10 text-[#199A8E] rounded-full text-xs font-black uppercase tracking-widest animate-fade-in">
              <Zap size={14} className="fill-current" />
              <span>The Future of Digital Medicine</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Smarter Care for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#199A8E] to-[#483D8B]">
                Better Lives.
              </span>
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Streamline your medical practice with Sehat AI. Manage
              appointments, analyze patient data, and leverage AI diagnostics in
              one seamless ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/signin-select"
                className="px-10 py-5 bg-[#199A8E] text-white rounded-[20px] font-black text-lg shadow-2xl shadow-emerald-200 hover:bg-[#15857a] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              >
                Join the Network{" "}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-10 py-5 bg-white text-slate-700 rounded-[20px] font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-4 border-white bg-slate-200"
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Trusted by <span className="text-slate-900">500+</span> Medical
                Specialists
              </p>
            </div>
          </div>

          {/* Hero Image / Illustration */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 p-4 bg-white rounded-[40px] shadow-2xl shadow-slate-200 transform rotate-2">
              <img
                src="https://img.freepik.com/free-vector/health-professional-team-concept-illustration_114360-1618.jpg"
                alt="Sehat AI Healthcare Team"
                className="rounded-[30px] w-full"
              />

              {/* Floating AI Status Card */}
              <div className="absolute -bottom-8 -left-12 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Security Protocol
                  </p>
                  <p className="font-bold text-slate-900 leading-none mt-1 text-lg">
                    Fully Encrypted
                  </p>
                </div>
              </div>

              {/* Floating Appointment Badge */}
              <div className="absolute -top-6 -right-6 bg-slate-900 p-4 rounded-2xl shadow-2xl text-white flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  2.4k+ Active Bookings
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Section */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-8 text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight">
            Built for Modern Medicine
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Our ecosystem provides everything needed to move from paperwork to
            digital precision.
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            {[
              {
                icon: Activity,
                title: "AI Diagnostics",
                desc: "Assist clinical decisions with real-time data analysis.",
              },
              {
                icon: Globe,
                title: "Universal Access",
                desc: "Patient records accessible securely from any device.",
              },
              {
                icon: Stethoscope,
                title: "Specialist Network",
                desc: "Connect with verified doctors across all departments.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-[#199A8E]/30 transition-all hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#199A8E] mb-6 group-hover:bg-[#199A8E] group-hover:text-white transition-all">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  Stethoscope,
  Chrome,
  ArrowRight,
  Loader2,
  HeartPulse,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Calendar,
  Users,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

export const DoctorLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Shared Logic after Firebase Login
  const handlePostLogin = async (user: any) => {
    const token = await user.getIdToken();
    await api.post("/users/sync", { idToken: token });
    navigate("/doctor/check-status");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handlePostLogin(result.user);
    } catch (error) {
      console.error("Google Login Failed", error);
      setError("Google sign-in failed. Please try again.");
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handlePostLogin(result.user);
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      toast.error("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] relative overflow-hidden">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#199A8E]/8 rounded-full blur-[140px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#483D8B]/8 rounded-full blur-[140px] -z-10" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — Brand Showcase                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center overflow-hidden">
        {/* Full-bleed gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#199A8E] via-[#15857a] to-[#0f6b62]" />

        {/* Decorative blobs */}
        <div className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -top-32 -left-32" />
        <div className="absolute w-[400px] h-[400px] bg-[#483D8B]/15 rounded-full blur-[100px] bottom-0 right-0" />
        <div className="absolute w-64 h-64 border border-white/10 rounded-full top-1/4 right-16" />
        <div className="absolute w-40 h-40 border border-white/5 rounded-full bottom-1/4 left-20" />

        {/* Content */}
        <div className="relative z-10 px-16 max-w-lg space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <HeartPulse size={28} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Sehat AI
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Doctor Portal
              <br />
              <span className="text-white/80">Your Digital Clinic</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Manage patients, digital prescriptions, and AI‑assisted
              diagnostics — all from one unified platform.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3 pt-4">
            {[
              {
                icon: Stethoscope,
                title: "AI Diagnostics",
                desc: "Smart symptom analysis and suggestions",
              },
              {
                icon: Calendar,
                title: "Appointment Management",
                desc: "Schedule, reschedule & track patient visits",
              },
              {
                icon: Users,
                title: "Patient Records",
                desc: "Secure access to medical history",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-5 py-4 rounded-2xl border border-white/10"
              >
                <div className="p-2.5 bg-white/15 rounded-xl flex-shrink-0">
                  <f.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{f.title}</p>
                  <p className="text-white/50 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-white/30 text-xs pt-6">
            © 2026 Sehat AI · Healthcare Network
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — Login Form                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#199A8E] to-[#117a71] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <HeartPulse size={22} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              Sehat AI
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back, Doctor
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Sign in to access your clinic dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock size={14} className="text-red-500" />
              </div>
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin text-slate-500" />
            ) : (
              <>
                <Chrome size={18} className="text-blue-600" />
                Sign in with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-semibold text-slate-400 bg-[#F8FAFC]">
                OR CONTINUE WITH EMAIL
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#199A8E] border-slate-300 rounded focus:ring-[#199A8E] accent-[#199A8E]"
                />
                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-[#199A8E] hover:text-[#15857a] transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#199A8E] to-[#15857a] text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200/60 hover:shadow-xl hover:shadow-emerald-200/80 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Login to Clinic <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <Link
            to="/signin-select"
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Back to Role Selection
          </Link>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 pt-2">
            © 2026 Sehat AI · Doctor Portal
          </p>
        </div>
      </div>
    </div>
  );
};
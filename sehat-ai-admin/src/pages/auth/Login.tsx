import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  HeartPulse,
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../lib/api";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const token = await user.getIdToken();

      const response = await api.post("/users/sync", { idToken: token });
      const { role } = response.data.user;

      console.log("Login success! Role: ", role);

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
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
        {/* Full‑bleed gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#199A8E] via-[#15857a] to-[#117a71]" />

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
              Smarter Healthcare,
              <br />
              <span className="text-white/80">Powered by AI</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Manage appointments, verify specialists, and monitor system health
              — all from one unified dashboard.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3 pt-4">
            {[
              {
                icon: Activity,
                title: "Real‑time Analytics",
                desc: "Monitor system health and patient flow",
              },
              {
                icon: ShieldCheck,
                title: "Doctor Verification",
                desc: "Credentialing & approval workflows",
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
            © 2026 Sehat AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — Login Form                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] space-y-8">
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
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Sign in to access your administration dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-red-500" />
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-400' : 'text-slate-400'}`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
                  placeholder="admin@sehatai.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${fieldErrors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]'
                    }`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-400' : 'text-slate-400'}`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl text-sm outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${fieldErrors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.password}</p>}
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
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-semibold text-slate-400 bg-[#F8FAFC]">
                OR
              </span>
            </div>
          </div>

          {/* Go back link */}
          <Link
            to="/signin-select"
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Back to Role Selection
          </Link>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 pt-2">
            © 2026 Sehat AI · Secure Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};
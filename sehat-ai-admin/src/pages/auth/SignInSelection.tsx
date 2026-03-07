import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCog,
  Stethoscope,
  ArrowRight,
  Smartphone,
  HeartPulse,
} from "lucide-react";

export const SignInSelection = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#199A8E]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sehat-purple/10 rounded-full blur-[120px] -z-10" />

      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 bg-linear-to-br from-[#199A8E] to-[#117a71] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
          <HeartPulse size={28} />
        </div>
        <span className="text-3xl font-black text-slate-800 tracking-tight">
          Sehat AI
        </span>
      </div>

      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
          Access Your Portal
        </h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">
          Choose your account type to continue to the Sehat AI healthcare
          dashboard
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* DOCTOR CARD - Professional Teal Theme */}
        <Link to="/doctor-login" className="group">
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white/70 backdrop-blur-xl p-10 rounded-4xl border border-slate-200/60 hover:border-[#199A8E] hover:shadow-2xl hover:shadow-emerald-100 transition-all cursor-pointer h-full relative flex flex-col"
          >
            <div className="w-20 h-20 bg-emerald-50 text-[#199A8E] rounded-3xl flex items-center justify-center mb-8 group-hover:bg-[#199A8E] group-hover:text-white transition-all duration-300 shadow-sm">
              <Stethoscope size={40} />
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Healthcare Specialist
            </h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">
              Access patient records, manage clinical appointments, and leverage
              AI diagnostic tools for smarter care.
            </p>

            <div className="mt-auto flex items-center text-[#199A8E] font-black text-sm uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
              Physician Login <ArrowRight size={20} />
            </div>
          </motion.div>
        </Link>

        {/* ADMIN CARD - Deep Indigo Theme */}
        <Link to="/login?role=admin" className="group">
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white/70 backdrop-blur-xl p-10 rounded-4xl border border-slate-200/60 hover:border-sehat-purple hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer h-full relative flex flex-col"
          >
            <div className="w-20 h-20 bg-indigo-50 text-sehat-purple rounded-3xl flex items-center justify-center mb-8 group-hover:bg-[#483D8B] group-hover:text-white transition-all duration-300 shadow-sm">
              <UserCog size={40} />
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              System Admin
            </h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">
              Manage platform users, verify specialist credentials, and monitor
              global analytics and system health.
            </p>

            <div className="mt-auto flex items-center text-sehat-purple font-black text-sm uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
              Admin Control <ArrowRight size={20} />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Patient Section - Visualizing the App-centric nature of SehatAI */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/40 flex flex-col sm:flex-row items-center gap-6 max-w-2xl"
      >
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
          <Smartphone size={32} />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[2px] mb-1">
            Looking for Patient Portal?
          </p>
          <p className="text-slate-600 font-medium">
            SehatAI for Patients is exclusively available on{" "}
            <span className="text-slate-900 font-bold">iOS and Android</span>.
          </p>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
          Get the App
        </button>
      </motion.div>
    </div>
  );
};

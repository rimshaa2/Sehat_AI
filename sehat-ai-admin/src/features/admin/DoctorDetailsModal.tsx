import { X, User, Briefcase, DollarSign, Award, FileText, Calendar, ShieldCheck, Mail, Phone, CheckCircle2 } from "lucide-react";
import type { Doctor } from "../../types/index";

type DoctorDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    onApprove?: (id: number, name: string) => void;
};

export const DoctorDetailsModal = ({
    isOpen,
    onClose,
    doctor,
    onApprove,
}: DoctorDetailsModalProps) => {
    if (!isOpen || !doctor) return null;

    const isPending = doctor.verificationStatus === "pending";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 text-white flex justify-between items-start bg-slate-800 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-bold uppercase border border-white/20 shadow-inner">
                            {doctor.user?.fullName.charAt(0) || "D"}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Dr. {doctor.user?.fullName}
                                </h2>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPending ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    }`}>
                                    {isPending ? "Pending Review" : "Verified Worker"}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 flex items-center gap-1.5 font-medium">
                                <Briefcase size={14} className="text-slate-400" />
                                {doctor.specialization}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                                <Award size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                            <p className="text-sm font-semibold text-slate-700">{doctor.experienceYears} Years</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                                <DollarSign size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee</p>
                            <p className="text-sm font-semibold text-slate-700">Rs {doctor.consultationFee}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                                <Calendar size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</p>
                            <p className="text-sm font-semibold text-slate-700">{new Date(doctor.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                                <ShieldCheck size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                            <p className="text-sm font-semibold text-slate-700 capitalize">{doctor.verificationStatus}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User size={14} /> Contact Information
                                </h3>
                                <div className="bg-white border text-sm border-slate-200 rounded-2xl divide-y divide-slate-100">
                                    <div className="flex items-center gap-3 p-4">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">{doctor.user?.email || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">{doctor.user?.phoneNumber || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Award size={14} /> Medical Credentials
                                </h3>
                                <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm p-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Award size={80} />
                                    </div>
                                    <p className="text-xs text-slate-500 mb-1">PMDC / License Number</p>
                                    <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">
                                        {doctor.licenseNumber || "NOT PROVIDED"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="h-full">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText size={14} /> Professional Biography
                                </h3>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-[calc(100%-28px)]">
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {doctor.bio || "No professional biography provided by the doctor yet."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    >
                        Close
                    </button>
                    {isPending && onApprove && (
                        <button
                            onClick={() => {
                                onApprove(doctor.id, doctor.user?.fullName);
                                onClose();
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#199A8E] hover:bg-[#15857a] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#199A8E]/20 transition-all active:scale-95"
                        >
                            <CheckCircle2 size={18} />
                            Approve Doctor
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

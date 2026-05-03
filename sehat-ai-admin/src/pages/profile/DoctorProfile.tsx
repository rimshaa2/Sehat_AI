import { useState, useEffect } from "react";
import {
    UserCircle,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Star,
    Users,
    Stethoscope,
    Clock,
    Edit3,
    Save,
    X,
    Loader2,
    Shield,
    Key,
} from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";

type TabKey = "personal" | "professional" | "qualifications" | "notifications" | "security";

const TABS: { key: TabKey; label: string }[] = [
    { key: "personal", label: "Personal Info" },
    { key: "professional", label: "Professional" },
    { key: "qualifications", label: "Qualifications" },
    { key: "notifications", label: "Notifications" },
    { key: "security", label: "Security" },
];

export const DoctorProfile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("personal");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    const hasPasswordProvider = user?.providerData?.some(p => p.providerId === "password");

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }
        if (!user || !user.email) return;

        setIsChangingPassword(true);
        try {
            if (hasPasswordProvider) {
                if (!currentPassword) {
                    toast.error("Please enter your current password.");
                    setIsChangingPassword(false);
                    return;
                }
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            }
            
            await updatePassword(user, newPassword);
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Change password error:", error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error("Please log out and log back in to change your password.");
            } else if (error.code === 'auth/wrong-password') {
                toast.error("Incorrect current password.");
            } else if (error.code === 'auth/weak-password') {
                toast.error("New password is too weak. Must be at least 6 characters.");
            } else {
                toast.error("Failed to update password. " + error.message);
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSendResetEmail = async () => {
        if (!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success("Password reset email sent! Check your inbox.");
        } catch (error: any) {
            toast.error("Failed to send reset email: " + error.message);
        }
    };

    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phone: "",
        specialization: "",
        licenseNumber: "",
        experienceYears: 0,
        consultationFee: 0,
        bio: "",
        totalPatients: 0,
        totalConsultations: 0,
    });

    const [editableProfile, setEditableProfile] = useState(profile);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Get doctor status which includes full doctor details
            const statusRes = await api.get("/doctors/status");
            const data = statusRes.data;

            // Get stats
            const statsRes = await api.get("/doctors/dashboard-stats");
            const stats = statsRes.data.stats;

            const newProfile = {
                fullName: user?.displayName || "Doctor",
                email: user?.email || "",
                phone: "",
                specialization: data.doctorDetails?.specialization || "General",
                licenseNumber: data.doctorDetails?.licenseNumber || "",
                experienceYears: data.doctorDetails?.experienceYears || 0,
                consultationFee: data.doctorDetails?.consultationFee || 0,
                bio: data.doctorDetails?.bio || "",
                totalPatients: stats?.totalPatients || 0,
                totalConsultations: stats?.todayAppts || 0,
            };
            setProfile(newProfile);
            setEditableProfile(newProfile);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/doctors/profile", {
                specialization: editableProfile.specialization,
                experienceYears: editableProfile.experienceYears,
                consultationFee: editableProfile.consultationFee,
                bio: editableProfile.bio,
            });
            setProfile(editableProfile);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditableProfile(profile);
        setIsEditing(false);
    };

    const initials = profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 size={28} className="text-[#199A8E] animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        My Profile
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View and update your profile information
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#199A8E] via-[#15857a] to-[#483D8B] rounded-2xl p-8 text-white shadow-xl">
                {/* Decorative blobs */}
                <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-[80px] -top-16 -right-16" />
                <div className="absolute w-48 h-48 bg-white/5 rounded-full blur-[60px] bottom-0 left-0" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black border-2 border-white/30 flex-shrink-0">
                        {initials}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-2xl font-black tracking-tight">
                            {profile.fullName}
                        </h2>
                        <p className="text-white/70 text-sm font-medium mt-1">
                            {profile.specialization} • {profile.experienceYears} years
                            experience
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-xs font-medium text-white/60">
                            <span className="flex items-center gap-1.5">
                                <Mail size={13} /> {profile.email}
                            </span>
                            {profile.phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone size={13} /> {profile.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Patients",
                        value: profile.totalPatients.toString(),
                        icon: Users,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                    },
                    {
                        label: "Consultations",
                        value: profile.totalConsultations.toString(),
                        icon: Stethoscope,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                    },
                    {
                        label: "Avg. Rating",
                        value: "4.9",
                        icon: Star,
                        color: "text-amber-600",
                        bg: "bg-amber-50",
                    },
                    {
                        label: "Experience",
                        value: `${profile.experienceYears} yrs`,
                        icon: Clock,
                        color: "text-purple-600",
                        bg: "bg-purple-50",
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`${stat.bg} ${stat.color} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}
                            >
                                <stat.icon size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs + Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tab Bar */}
                <div className="flex border-b border-slate-100 overflow-x-auto">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${isActive
                                        ? "border-[#199A8E] text-[#199A8E] bg-[#199A8E]/5"
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-8">
                    {activeTab === "personal" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-slate-800 mb-2">
                                <UserCircle size={18} />
                                <h3 className="text-base font-bold">Personal Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editableProfile.fullName}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={editableProfile.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={editableProfile.phone}
                                        placeholder="Not set"
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Gender
                                    </label>
                                    <select
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                                    >
                                        <option>Select</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Not set"
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "professional" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-slate-800 mb-2">
                                <Stethoscope size={18} />
                                <h3 className="text-base font-bold">Professional Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        value={editableProfile.specialization}
                                        disabled={!isEditing}
                                        onChange={(e) =>
                                            setEditableProfile({
                                                ...editableProfile,
                                                specialization: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        License Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editableProfile.licenseNumber}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        value={editableProfile.experienceYears}
                                        disabled={!isEditing}
                                        onChange={(e) =>
                                            setEditableProfile({
                                                ...editableProfile,
                                                experienceYears: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Consultation Fee ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={editableProfile.consultationFee}
                                        disabled={!isEditing}
                                        onChange={(e) =>
                                            setEditableProfile({
                                                ...editableProfile,
                                                consultationFee: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Bio
                                </label>
                                <textarea
                                    value={editableProfile.bio}
                                    disabled={!isEditing}
                                    rows={4}
                                    onChange={(e) =>
                                        setEditableProfile({
                                            ...editableProfile,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] disabled:opacity-60 disabled:cursor-not-allowed transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "qualifications" && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Calendar size={40} className="text-slate-300 mb-3" />
                            <h3 className="text-base font-semibold text-slate-800">
                                Qualifications & Certifications
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                Upload and manage your medical degrees, certifications, and
                                training records. Coming soon.
                            </p>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <MapPin size={40} className="text-slate-300 mb-3" />
                            <h3 className="text-base font-semibold text-slate-800">
                                Notification Preferences
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                Configure how and when you receive appointment and system
                                notifications. Coming soon.
                            </p>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-slate-800 mb-6">
                                <Shield size={18} />
                                <h3 className="text-base font-bold">Security Settings</h3>
                            </div>

                            <div className="max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Key size={16} className="text-[#199A8E]" />
                                    Change Password
                                </h4>
                                
                                {!hasPasswordProvider && (
                                    <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
                                        You signed in using Google. You can set a password for your account, or send a password reset email to yourself.
                                    </div>
                                )}

                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {hasPasswordProvider && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="pt-2 flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="flex-1 px-4 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
                                        >
                                            {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                                        </button>
                                        
                                        {!hasPasswordProvider && (
                                            <button
                                                type="button"
                                                onClick={handleSendResetEmail}
                                                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                                                title="Send Password Reset Email"
                                            >
                                                <Mail size={16} />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
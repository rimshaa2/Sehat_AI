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
    FileText,
    Plus,
    Trash2,
    Eye,
    UploadCloud,
    Download,
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

    // ── Qualifications State & Event Handlers ──
    const [qualifications, setQualifications] = useState<any[]>([]);
    const [qualLoading, setQualLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newDoc, setNewDoc] = useState({
        documentType: "Medical Degree (MBBS/MD)",
        documentName: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [viewDoc, setViewDoc] = useState<any | null>(null);

    useEffect(() => {
        if (activeTab === "qualifications") {
            fetchQualifications();
        }
    }, [activeTab]);

    const fetchQualifications = async () => {
        setQualLoading(true);
        try {
            const res = await api.get("/doctors/qualifications");
            setQualifications(res.data);
        } catch (error) {
            console.error("Failed to load qualifications", error);
            toast.error("Failed to load qualifications");
        } finally {
            setQualLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (!newDoc.documentName) {
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                setNewDoc({ ...newDoc, documentName: nameWithoutExt });
            }
        }
    };

    const handleAddQualification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a file to upload.");
            return;
        }
        if (!newDoc.documentName.trim()) {
            toast.error("Please enter a document name.");
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onloadend = async () => {
                const base64Data = reader.result as string;
                try {
                    const res = await api.post("/doctors/qualifications", {
                        documentType: newDoc.documentType,
                        documentName: newDoc.documentName,
                        fileData: base64Data,
                    });
                    toast.success("Document uploaded successfully!");
                    setQualifications((prev) => [...prev, res.data]);
                    setSelectedFile(null);
                    setNewDoc({
                        documentType: "Medical Degree (MBBS/MD)",
                        documentName: "",
                    });
                    const fileInput = document.getElementById("qual-file-input") as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                } catch (uploadError: any) {
                    console.error("Upload endpoint error:", uploadError);
                    toast.error(uploadError.response?.data?.error || "Failed to save document.");
                } finally {
                    setUploading(false);
                }
            };
        } catch (error) {
            console.error("FileReader error:", error);
            toast.error("Failed to read file.");
            setUploading(false);
        }
    };

    const handleDeleteQualification = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this qualification document?")) return;
        try {
            await api.delete(`/doctors/qualifications/${id}`);
            toast.success("Document deleted successfully.");
            setQualifications((prev) => prev.filter((q) => q.id !== id));
            if (viewDoc?.id === id) {
                setViewDoc(null);
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete document.");
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            return "Unknown Date";
        }
    };

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
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <FileText className="text-[#199A8E]" size={20} />
                                        Qualifications & Certifications
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Add and manage your medical degrees, certifications, and licenses.
                                    </p>
                                </div>
                            </div>

                            {qualLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Loader2 className="animate-spin text-[#199A8E] mb-3" size={32} />
                                    <p className="text-sm">Loading qualifications...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    {/* Left side: Document list */}
                                    <div className="lg:col-span-3 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            Your Documents ({qualifications.length})
                                        </h4>
                                        
                                        {qualifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6">
                                                <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-3">
                                                    <FileText size={32} />
                                                </div>
                                                <h5 className="text-sm font-semibold text-slate-700">No documents uploaded</h5>
                                                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                                    Attach your MBBS degree, specialization certificate, or PMDC registration to complete your medical profile.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {qualifications.map((qual) => {
                                                    let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                                                    if (qual.documentType.includes("License") || qual.documentType.includes("PMDC")) {
                                                        badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                                                    } else if (qual.documentType.includes("Specialization")) {
                                                        badgeColor = "bg-purple-50 text-purple-700 border-purple-100";
                                                    } else if (qual.documentType.includes("Experience")) {
                                                        badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                                                    }

                                                    return (
                                                        <div 
                                                            key={qual.id} 
                                                            className="flex items-center justify-between p-4 bg-white border border-slate-150 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#199A8E]/10 group-hover:text-[#199A8E] transition-colors shrink-0">
                                                                    <FileText size={22} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h5 className="text-sm font-semibold text-slate-800 truncate" title={qual.documentName}>
                                                                        {qual.documentName}
                                                                    </h5>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                                                            {qual.documentType}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400">
                                                                            Uploaded {formatDate(qual.uploadedAt)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewDoc(qual)}
                                                                    className="p-2 text-slate-500 hover:text-[#199A8E] hover:bg-slate-50 rounded-xl transition-all"
                                                                    title="View Document"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteQualification(qual.id)}
                                                                    className="p-2 text-slate-400 hover:text-red-550 hover:bg-red-50 rounded-xl transition-all"
                                                                    title="Delete Document"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side: Upload Form */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                                            <h4 className="text-sm font-bold text-slate-800">
                                                Attach Document
                                            </h4>
                                            
                                            <form onSubmit={handleAddQualification} className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        Document Type
                                                    </label>
                                                    <select
                                                        value={newDoc.documentType}
                                                        onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all"
                                                    >
                                                        <option value="Medical Degree (MBBS/MD)">Medical Degree (MBBS/MD)</option>
                                                        <option value="PMDC Registration Certificate">PMDC Registration Certificate</option>
                                                        <option value="Specialization Certificate">Specialization Certificate</option>
                                                        <option value="Experience Letter">Experience Letter</option>
                                                        <option value="Other Certificate">Other Certificate</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        Document Display Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newDoc.documentName}
                                                        onChange={(e) => setNewDoc({ ...newDoc, documentName: e.target.value })}
                                                        placeholder="e.g. MBBS Degree Certificate"
                                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                                        File Upload
                                                    </label>
                                                    <div className="relative border-2 border-dashed border-slate-200 hover:border-[#199A8E] rounded-xl bg-white p-6 text-center transition-all group cursor-pointer">
                                                        <input
                                                            id="qual-file-input"
                                                            type="file"
                                                            accept="image/*,application/pdf"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <UploadCloud size={28} className="text-slate-400 mx-auto mb-2 group-hover:text-[#199A8E] group-hover:scale-110 transition-all" />
                                                        {selectedFile ? (
                                                            <div className="text-xs">
                                                                <p className="font-semibold text-[#199A8E] truncate max-w-[200px] mx-auto">
                                                                    {selectedFile.name}
                                                                </p>
                                                                <p className="text-slate-400 mt-0.5">
                                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-600">
                                                                    Click to browse or drag file here
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 mt-1">
                                                                    Accepts JPG, PNG, or PDF (max 5MB)
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={uploading || !selectedFile}
                                                    className="w-full py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex justify-center items-center gap-2"
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus size={16} />
                                                            Upload Document
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
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

            {/* --- Document Viewer Modal --- */}
            {viewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-base font-bold text-slate-800">
                                    {viewDoc.documentName}
                                </h4>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    {viewDoc.documentType}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <a
                                    href={viewDoc.fileData}
                                    download={viewDoc.documentName}
                                    className="p-2 text-slate-500 hover:text-[#199A8E] hover:bg-slate-50 rounded-xl transition-all"
                                    title="Download Document"
                                >
                                    <Download size={18} />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setViewDoc(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 overflow-y-auto max-h-[75vh] flex items-center justify-center">
                            {viewDoc.fileData.startsWith("data:application/pdf") ? (
                                <div className="text-center py-10 w-full">
                                    <FileText size={64} className="text-slate-350 mx-auto mb-4" />
                                    <h5 className="text-sm font-semibold text-slate-700">PDF Document</h5>
                                    <p className="text-xs text-slate-400 mt-1 mb-6">
                                        This document is uploaded in PDF format and cannot be rendered inline.
                                    </p>
                                    <a
                                        href={viewDoc.fileData}
                                        download={viewDoc.documentName}
                                        className="px-6 py-3 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all inline-flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                        Download PDF to View
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={viewDoc.fileData}
                                    alt={viewDoc.documentName}
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Check,
  Video,
  FileText,
  Phone,
  MessageSquare,
  RefreshCcw,
  Search,
  Filter,
  Activity,
  ChevronRight,
  User,
  Stethoscope,
  X,
} from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

type TabType = "today" | "upcoming" | "history";

export const MyAppointments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    today: 0,
    confirmed: 0,
    pending: 0,
    teleconsults: 0,
  });

  useEffect(() => {
    if (user?.uid) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error(`Failed to update appointment status`);
      console.error(error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Fetch ALL appointments instead of just dashboard stats
      const res = await api.get("/doctors/my-appointments");
      const data = res.data;

      setAppointments(data || []);

      const todayStr = new Date().toISOString().split('T')[0];
      setStatsData({
        today: data.filter((a: any) => a.appointmentDate === todayStr).length || 0,
        confirmed: data.filter((a: any) => a.status === "completed").length || 0,
        pending: data.filter((a: any) => a.status === "scheduled").length || 0,
        teleconsults: 0,
      });
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Today's Appointments",
      value: statsData.today.toString(),
      icon: Calendar,
      gradient: "from-[#199A8E] to-[#15857a]",
      lightBg: "bg-[#199A8E]/8",
      lightText: "text-[#199A8E]",
    },
    {
      label: "Completed",
      value: statsData.confirmed.toString(),
      icon: Check,
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-500/8",
      lightText: "text-blue-600",
    },
    {
      label: "Scheduled",
      value: statsData.pending.toString(),
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-500/8",
      lightText: "text-amber-600",
    },
    {
      label: "Teleconsultations",
      value: statsData.teleconsults.toString(),
      icon: Video,
      gradient: "from-[#483D8B] to-[#5B4FB5]",
      lightBg: "bg-[#483D8B]/8",
      lightText: "text-[#483D8B]",
    },
  ];

  const tabConfig: { key: TabType; label: string; icon: typeof Calendar }[] = [
    { key: "today", label: "Today", icon: Calendar },
    { key: "upcoming", label: "Upcoming", icon: Clock },
    { key: "history", label: "History", icon: FileText },
  ];

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
          label: "Completed",
        };
      case "scheduled":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-500",
          label: "Scheduled",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-500",
          label: "Cancelled",
        };
      case "no-show":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-500",
          label: "No Show",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-600",
          border: "border-slate-200",
          dot: "bg-slate-400",
          label: status,
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your patient appointments
          </p>
        </div>
        <div className="flex items-center gap-3">


          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={14} className="text-[#199A8E]" />
            <span className="font-semibold text-slate-700">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCcw size={32} className="text-[#199A8E] animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading appointments...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden"
              >
                {/* Subtle gradient accent line at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`}
                />
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 leading-none">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.lightBg} ${stat.lightText} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}
                  >
                    <stat.icon size={22} strokeWidth={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Bar & Search */}
            <div className="border-b border-slate-100">
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 p-4 sm:p-5">
                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl">
                  {tabConfig.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                          ? "bg-white text-[#199A8E] shadow-sm"
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                          }`}
                      >
                        <tab.icon size={15} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 lg:flex-none">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patient name..."
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none w-full lg:w-72 transition-all placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <Filter size={16} />
                  </button>
                  <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <RefreshCcw size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="divide-y divide-slate-100">
              {appointments
                .filter((apt: any) => {
                  // Text Search
                  if (searchQuery && !apt.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }

                  // Tab Filtering Logic
                  const todayStr = new Date().toISOString().split("T")[0];

                  if (activeTab === "today") {
                    return apt.appointmentDate === todayStr;
                  } else if (activeTab === "upcoming") {
                    // Show scheduled and cancelled in upcoming
                    return apt.status === "scheduled" || apt.status === "cancelled";
                  } else if (activeTab === "history") {
                    // Show completed in history
                    return apt.status === "completed" || apt.status === "no-show";
                  }

                  return true;
                })
                .map((apt) => {
                  const statusConfig = getStatusConfig(apt.status);
                  const patientName = apt.patient?.fullName || "Guest Patient";
                  const patientPhone = apt.patient?.phoneNumber || "N/A";
                  const initials = patientName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2);

                  const aptTime = apt.timeSlot || "N/A";
                  const aptReason = apt.reason || "General Consultation";
                  const aptHistory = "No history provided."; // Not in standard fetch
                  const aptType = aptReason.length > 20 ? "Consultation" : aptReason;

                  return (
                    <div
                      key={apt.id}
                      className="group p-5 sm:p-6 hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      {/* Main Row */}
                      <div className="flex flex-col lg:flex-row gap-5">
                        {/* Left: Time Block */}
                        <div className="flex lg:flex-col items-center lg:items-center justify-start gap-2 lg:gap-1 lg:min-w-[90px] lg:pt-1">
                          <div className="flex items-center gap-2 lg:flex-col lg:gap-1">
                            <Clock
                              size={14}
                              className="text-[#199A8E] hidden lg:block"
                            />
                            <span className="text-sm font-bold text-slate-900">
                              {aptTime}
                            </span>
                            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                              30 min
                            </span>
                          </div>
                        </div>

                        {/* Vertical separator (desktop) */}
                        <div className="hidden lg:block w-px bg-slate-200 self-stretch" />

                        {/* Center: Patient Details */}
                        <div className="flex-1 min-w-0">
                          {/* Patient Header */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3.5">
                              {/* Avatar */}
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#483D8B] to-[#5B4FB5] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h3 className="text-sm font-bold text-slate-900 truncate">
                                    {patientName}
                                  </h3>
                                  {/* Status Badge */}
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                                    />
                                    {statusConfig.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <User size={12} />
                                    Adult · Unknown
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone size={12} />
                                    {patientPhone}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Type Badge */}
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#199A8E] bg-[#199A8E]/8 px-3 py-1.5 rounded-lg border border-[#199A8E]/15 whitespace-nowrap flex-shrink-0">
                              <Stethoscope size={13} />
                              {aptType}
                            </span>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Activity size={11} />
                                Reason for Visit
                              </p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {aptReason}
                              </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FileText size={11} />
                                Medical History
                              </p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {aptHistory}
                              </p>
                            </div>
                          </div>

                          {/* Mobile Type Badge */}
                          <div className="sm:hidden mt-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#199A8E] bg-[#199A8E]/8 px-3 py-1.5 rounded-lg border border-[#199A8E]/15">
                              <Stethoscope size={13} />
                              {aptType}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                            {apt.status === "scheduled" && (
                              <button
                                onClick={() => handleUpdateStatus(apt.id, "completed")}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#199A8E] text-white rounded-xl text-xs font-semibold hover:bg-[#15857a] shadow-sm shadow-[#199A8E]/20 transition-all duration-200 hover:shadow-md hover:shadow-[#199A8E]/25">
                                <Check size={14} />
                                Complete
                              </button>
                            )}
                            {apt.status === "scheduled" && (
                              <button
                                onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all duration-200">
                                <X size={14} />
                                Cancel
                              </button>
                            )}
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#483D8B]/8 text-[#483D8B] border border-[#483D8B]/15 rounded-xl text-xs font-semibold hover:bg-[#483D8B]/15 transition-all duration-200">
                              <Video size={14} />
                              Start Teleconsult
                            </button>

                            <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1" />

                            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-all">
                              <Phone size={13} />
                              <span className="hidden md:inline">Call</span>
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-all">
                              <MessageSquare size={13} />
                              <span className="hidden md:inline">Message</span>
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-all ml-auto">
                              View Details
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Empty State Fallback (when list would be empty) */}
            {appointments.length > 0 &&
              appointments.filter((apt: any) => {
                const todayStr = new Date().toISOString().split("T")[0];
                if (activeTab === "today") return apt.appointmentDate === todayStr;
                if (activeTab === "upcoming") return apt.status === "scheduled" || apt.status === "cancelled";
                if (activeTab === "history") return apt.status === "completed" || apt.status === "no-show";
                return true;
              }).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar size={28} className="text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 mb-1">
                  No appointments found for this tab
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Try switching tabs or adjusting your filters to find what you're looking for.
                </p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar size={28} className="text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 mb-1">
                  No appointments found
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  You don't have any appointments scheduled for this period. Check
                  back later or try a different filter.
                </p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

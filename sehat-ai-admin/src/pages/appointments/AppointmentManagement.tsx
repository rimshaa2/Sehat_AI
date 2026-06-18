import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,

  
  Download,
 
  Edit3,
  Trash2,
  Eye,
  RefreshCcw,
  X,
  ImageIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import api from "../../lib/api";
import { AppointmentModal } from "./AppointmentModal";
import toast from "react-hot-toast";

export const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending_review">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewedAppointment, setViewedAppointment] = useState<any>(null);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    completed: 0,
    pendingReview: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/admin/all");
      const data = res.data;
      setAppointments(data);
      const todayStr = new Date().toLocaleDateString();
      setStats({
        total: data.length,
        today: data.filter((a: any) => a.date === todayStr).length,
        pending: data.filter((a: any) => a.status?.toLowerCase() === "scheduled").length,
        completed: data.filter((a: any) => a.status?.toLowerCase() === "completed").length,
        pendingReview: data.filter((a: any) => a.paymentReviewStatus === "pending_review").length,
      });
    } catch (error) {
      console.error("Failed to load appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (data: any) => {
    try {
      await api.post("/appointments/admin/create", data);
      toast.success("Appointment successfully booked!");
      fetchAppointments();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error creating appointment. Please check IDs.");
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Appointment deleted successfully!");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to delete appointment");
    }
  };

  const submitEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/appointments/${editingAppointment.id}/reschedule`, {
        appointmentDate: editingAppointment.rawDate || editingAppointment.date,
        timeSlot: editingAppointment.time,
      });
      toast.success("Appointment rescheduled successfully!");
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to reschedule appointment");
    }
  };

  // ── Payment Review ─────────────────────────────────────────────────────────
  const handleApprovePayment = async (id: string) => {
    try {
      await api.patch(`/appointments/${id}/review-payment`, { action: "approve" });
      toast.success("Payment approved! Appointment confirmed.");
      setViewedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to approve payment");
    }
  };

  const handleRejectPayment = async (id: string) => {
    if (!rejectNote.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await api.patch(`/appointments/${id}/review-payment`, {
        action: "reject",
        note: rejectNote,
      });
      toast.success("Payment receipt rejected. Patient will be notified.");
      setViewedAppointment(null);
      setRejectNote("");
      setShowRejectInput(false);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to reject payment");
    }
  };

  const handleExport = () => {
    if (appointments.length === 0) { toast.error("No appointments to export."); return; }
    const headers = ["Patient", "Phone", "Doctor", "Specialization", "Date", "Time", "Type", "Status", "Payment", "Review Status"];
    const csvContent = [
      headers.join(","),
      ...appointments.map((apt: any) =>
        [`"${apt.patientName || ""}"`, `"${apt.patientPhone || ""}"`, `"${apt.doctorName || ""}"`,
         `"${apt.specialization || ""}"`, `"${apt.date || ""}"`, `"${apt.time || ""}"`,
         `"${apt.type || ""}"`, `"${apt.status || ""}"`, `"${apt.paymentMethod || ""}"`,
         `"${apt.paymentReviewStatus || ""}"`].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `appointments_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully!");
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return { style: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
      case "scheduled": return { style: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" };
      case "cancelled": return { style: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" };
      case "no-show":   return { style: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
      default:          return { style: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
    }
  };

  const getReviewBadge = (status: string) => {
    switch (status) {
      case "pending_review": return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">⏳ Pending Review</span>;
      case "approved":       return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">✅ Approved</span>;
      case "rejected":       return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">❌ Rejected</span>;
      default:               return null;
    }
  };

  // Filter logic
  const filtered = appointments.filter((apt: any) => {
    const matchSearch =
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === "all" || apt.paymentReviewStatus === "pending_review";
    return matchSearch && matchTab;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#199A8E]/10 flex items-center justify-center">
          <RefreshCcw size={22} className="text-[#199A8E] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Loading appointments...</p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments Management</h1>
          <p className="text-sm text-slate-500 mt-1">Overview and management of all patient appointments</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={14} className="text-[#199A8E]" />
          <span className="font-semibold text-slate-700">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Today", value: stats.today, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Scheduled", value: stats.pending, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Awaiting Review", value: stats.pendingReview, icon: ImageIcon, color: "text-amber-600", bg: "bg-amber-50", alert: stats.pendingReview > 0 },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => stat.label === "Awaiting Review" && setActiveTab("pending_review")}
            className={`relative bg-white p-5 rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden
              ${stat.label === "Awaiting Review" && stats.pendingReview > 0 ? "border-amber-300 cursor-pointer hover:shadow-md" : "border-slate-100 hover:shadow-md hover:border-slate-200"}`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.bg} opacity-80`} />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            {(stat as any).alert && (
              <p className="text-[10px] text-amber-600 font-bold mt-2">Click to review →</p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs + Search + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "all" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setActiveTab("pending_review")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "pending_review" ? "bg-white shadow text-amber-700" : "text-slate-500 hover:text-slate-700"}`}
          >
            Payment Review
            {stats.pendingReview > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {stats.pendingReview}
              </span>
            )}
          </button>
        </div>

        {/* Search + Export */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none w-56"
            />
          </div>
          <button
            onClick={fetchAppointments}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCcw size={16} className="text-slate-500" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
          >
            + New
          </button>
        </div>
      </div>

      {/* Pending Review Banner */}
      {activeTab === "pending_review" && stats.pendingReview > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-center gap-3">
          <ImageIcon size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {stats.pendingReview} payment screenshot{stats.pendingReview > 1 ? "s" : ""} awaiting review
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Click the eye icon on any row to view the receipt and approve or reject it.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Doctor</th>
                <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Payment</th>
                <th className="p-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 text-[#199A8E] flex items-center justify-center font-bold text-xs uppercase">
                        {apt.patientName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{apt.patientName}</p>
                        <p className="text-xs text-slate-400">{apt.patientPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-700">
                    Dr. {apt.doctorName}
                    <p className="text-[10px] text-[#199A8E] font-bold">{apt.specialization}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={13} className="text-slate-400" />
                      <span className="text-sm font-medium">{apt.date}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold ml-5 uppercase">{apt.time}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{apt.type}</span>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const cfg = getStatusConfig(apt.status);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {apt.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 uppercase font-bold">{apt.paymentMethod || "cash"}</span>
                      {getReviewBadge(apt.paymentReviewStatus)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setViewedAppointment(apt); setShowRejectInput(false); setRejectNote(""); }}
                        className="p-2 text-slate-400 hover:text-[#199A8E] hover:bg-emerald-50 rounded-xl transition-all"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEditingAppointment(apt)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Reschedule"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Calendar size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        {activeTab === "pending_review" ? "No payments awaiting review" : "No appointments found"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> appointment{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateAppointment} />

      {/* ── View / Payment Review Modal ── */}
      {viewedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-lg">Appointment Details</h3>
              <button onClick={() => { setViewedAppointment(null); setShowRejectInput(false); setRejectNote(""); }} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-3 text-sm overflow-y-auto">
              {/* Basic Info */}
              {[
                ["Patient",        viewedAppointment.patientName],
                ["Phone",          viewedAppointment.patientPhone],
                ["Doctor",         viewedAppointment.doctorName],
                ["Specialization", viewedAppointment.specialization],
                ["Date",           viewedAppointment.date],
                ["Time",           viewedAppointment.time],
                ["Reason",         viewedAppointment.type],
                ["Status",         viewedAppointment.status],
                ["Payment Method", viewedAppointment.paymentMethod || "cash"],
                ["Payment Status", viewedAppointment.paymentStatus || "pending"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500 text-xs font-bold uppercase">{label}</span>
                  <span className="font-medium text-right capitalize">{value}</span>
                </div>
              ))}

              {/* Review Status */}
              {viewedAppointment.paymentReviewStatus && viewedAppointment.paymentReviewStatus !== "not_required" && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold uppercase">Review Status</span>
                  {getReviewBadge(viewedAppointment.paymentReviewStatus)}
                </div>
              )}

              {/* Rejection note if any */}
              {viewedAppointment.paymentReviewNote && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                  <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason:</p>
                  <p className="text-xs text-red-600">{viewedAppointment.paymentReviewNote}</p>
                </div>
              )}

              {/* Receipt Image */}
              {viewedAppointment.paymentMethod === "bank" && viewedAppointment.receiptImage && (
                <div className="mt-2">
                  <span className="text-slate-500 text-xs font-bold uppercase block mb-2">Payment Receipt</span>
                  <img
                    src={viewedAppointment.receiptImage}
                    alt="Receipt"
                    className="w-full rounded-xl border border-slate-200"
                    style={{ maxHeight: "280px", objectFit: "contain" }}
                  />
                </div>
              )}

              {/* No receipt uploaded yet */}
              {viewedAppointment.paymentMethod === "bank" && !viewedAppointment.receiptImage && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 mt-2">
                  <ImageIcon size={18} className="text-slate-400" />
                  <p className="text-xs text-slate-500">No receipt uploaded yet</p>
                </div>
              )}

              {/* Reject reason input */}
              {showRejectInput && (
                <div className="mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Rejection Reason *</label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="e.g. Amount doesn't match, blurry image..."
                    className="w-full px-3 py-2 text-sm border border-red-200 rounded-xl focus:ring-2 focus:ring-red-200 outline-none resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-end gap-2 flex-shrink-0">
              {/* Show approve/reject only when receipt is pending review */}
              {viewedAppointment.paymentMethod === "bank" &&
               viewedAppointment.paymentReviewStatus === "pending_review" && (
                <>
                  {!showRejectInput ? (
                    <>
                      <button
                        onClick={() => handleApprovePayment(viewedAppointment.id)}
                        className="flex items-center gap-2 px-5 py-2 bg-[#199A8E] text-white hover:bg-emerald-600 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
                      >
                        <ThumbsUp size={15} /> Approve
                      </button>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold transition-all"
                      >
                        <ThumbsDown size={15} /> Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRejectPayment(viewedAppointment.id)}
                        className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold transition-all"
                      >
                        <ThumbsDown size={15} /> Confirm Reject
                      </button>
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectNote(""); }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                onClick={() => { setViewedAppointment(null); setShowRejectInput(false); setRejectNote(""); }}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Reschedule Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-blue-50/50">
              <h3 className="font-bold text-lg text-blue-900">Reschedule Appointment</h3>
              <button onClick={() => setEditingAppointment(null)} className="p-2 hover:bg-blue-100 rounded-full text-blue-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEditAppointment} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">New Date</label>
                <input
                  type="date"
                  required
                  value={editingAppointment.rawDate || ""}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, rawDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">New Time</label>
                <input
                  type="time"
                  required
                  value={editingAppointment.time || ""}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setEditingAppointment(null)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-200">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
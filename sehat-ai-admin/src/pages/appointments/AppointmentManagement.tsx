import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  MapPin,
  Edit3,
  Trash2,
  Eye,
  RefreshCcw,
} from "lucide-react";
import api from "../../lib/api";
import { AppointmentModal } from "./AppointmentModal";

export const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    completed: 0,
  });
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async (data: any) => {
    try {
      await api.post("/appointments/admin/create", data);
      alert("Appointment successfully booked!");
      fetchAppointments(); // Refresh the table
      setIsModalOpen(false);
    } catch (error) {
      alert("Error creating appointment. Please check IDs.");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/admin/all");
      const data = res.data;
      setAppointments(data);

      // Calculate dynamic stats from the live data
      const todayStr = new Date().toLocaleDateString();
      setStats({
        total: data.length,
        today: data.filter((a: any) => a.date === todayStr).length,
        pending: data.filter(
          (a: any) => a.status.toLowerCase() === "scheduled",
        ).length,
        completed: data.filter(
          (a: any) => a.status.toLowerCase() === "completed",
        ).length,
      });
    } catch (error) {
      console.error("Failed to load appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          style: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "scheduled":
        return {
          style: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };
      case "cancelled":
        return {
          style: "bg-red-50 text-red-600 border-red-200",
          dot: "bg-red-500",
        };
      case "no-show":
        return {
          style: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      default:
        return {
          style: "bg-slate-50 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#199A8E]/10 flex items-center justify-center">
          <RefreshCcw size={22} className="text-[#199A8E] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">
          Loading appointments...
        </p>
        <p className="text-xs text-slate-400">Syncing with SehatAI Calendar</p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Appointments Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview and management of all patient appointments
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={14} className="text-[#199A8E]" />
          <span className="font-semibold text-slate-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Appointments",
            value: stats.total.toLocaleString(),
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Today",
            value: stats.today.toLocaleString(),
            icon: Clock,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Pending",
            value: stats.pending.toLocaleString(),
            icon: AlertCircle,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Completed",
            value: stats.completed.toLocaleString(),
            icon: CheckCircle2,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${stat.bg} opacity-80`}
            />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={`${stat.bg} p-3 rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Area */}
      <div className="bg-white/70 backdrop-blur-xl rounded-4xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Table Header/Actions */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by patient or doctor..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={18} /> All Status
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Download size={18} /> Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-2 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#199A8E] text-white rounded-2xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              <Plus size={18} /> New Appointment
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[2px] font-bold">
              <tr>
                <th className="p-6">Patient</th>
                <th className="p-6">Doctor</th>
                <th className="p-6">Date & Time</th>
                <th className="p-6">Type</th>
                <th className="p-6">Location</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt: any) => (
                <tr
                  key={apt.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-[#199A8E] flex items-center justify-center font-bold text-xs uppercase">
                        {apt.patientName
                          .split(" ")
                          .map((n: any[]) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {apt.patientName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {apt.patientPhone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-semibold text-slate-700">
                    Dr. {apt.doctorName}
                    <p className="text-[10px] text-[#199A8E] font-bold">
                      {apt.specialization}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-sm font-medium">{apt.date}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold ml-5 uppercase">
                      {apt.time}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {apt.type}
                    </span>
                  </td>
                  <td className="p-6 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} /> {apt.location}
                    </div>
                  </td>
                  <td className="p-6">
                    {(() => {
                      const cfg = getStatusConfig(apt.status);
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.style}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {apt.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-[#199A8E] hover:bg-emerald-50 rounded-xl transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Calendar size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        No appointments found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Try adjusting your search or filters, or create a new
                        appointment.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {appointments.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {appointments.length}
              </span>{" "}
              appointment{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAppointment}
      />
    </div>
  );
};

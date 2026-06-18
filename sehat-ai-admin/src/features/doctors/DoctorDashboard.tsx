import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Bell,
  Video,
  ChevronRight,
  Activity,
  AlertTriangle,
  Loader2,
  CalendarX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { AppointmentCalendar } from "../../components/calendar/AppointmentCalendar";

interface Appointment {
  id: number;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  reason?: string;
  patient?: {
    fullName: string;
    phoneNumber?: string;
  };
}

interface DashboardData {
  stats: {
    todayAppts: number;
    totalPatients: number;
    upcoming: number;
    emergencies: number;
  };
  appointments: Appointment[];
}

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const doctorName = user?.displayName || "Doctor";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    stats: { todayAppts: 0, totalPatients: 0, upcoming: 0, emergencies: 0 },
    appointments: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/doctors/dashboard-stats");
      setData(res.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Today's Appts",
      value: data.stats.todayAppts.toString(),
      icon: Calendar,
      color: "text-[#199A8E]",
      bg: "bg-emerald-50 shadow-emerald-100",
    },
    {
      label: "Upcoming",
      value: data.stats.upcoming.toString(),
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50 shadow-blue-100",
    },
    {
      label: "Total Patients",
      value: data.stats.totalPatients.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 shadow-purple-100",
    },
    {
      label: "Emergencies",
      value: data.stats.emergencies.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 shadow-red-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={28} className="text-[#199A8E] animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#199A8E] via-[#15857a] to-[#483D8B] rounded-[32px] p-10 text-white shadow-2xl shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight">
              Welcome back, {doctorName}! 👋
            </h1>
            <p className="text-emerald-50/90 text-lg font-medium max-w-xl">
              {data.stats.todayAppts > 0
                ? `You have ${data.stats.todayAppts} appointment${data.stats.todayAppts > 1 ? "s" : ""} scheduled for today.`
                : "You have no appointments scheduled for today. Enjoy your day!"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate("/doctor/schedule")}
                className="px-8 py-3 bg-white text-[#199A8E] rounded-2xl font-bold text-sm shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Calendar size={18} /> View Schedule
              </button>
              {/* <button className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                <Video size={18} /> Start Teleconsult
              </button> */}
            </div>
          </div>
          <div className="hidden lg:block opacity-10 transform rotate-12 scale-110">
            <Activity size={200} strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div
                className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-inner`}
              >
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Appointments Table */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Today's Appointments
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {today}
              </p>
            </div>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="px-4 py-2 text-sm font-bold text-[#199A8E] bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              View All
            </button>
          </div>

          {data.appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase tracking-[2px] font-black text-slate-400 bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5">Patient</th>
                    <th className="px-8 py-5">Time</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.appointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 shadow-inner">
                            {apt.patient?.fullName?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {apt.patient?.fullName || "Unknown Patient"}
                            </p>
                            {apt.reason && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {apt.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                        {apt.timeSlot}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                            apt.status === "confirmed" ||
                            apt.status === "scheduled"
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                              : apt.status === "completed"
                                ? "text-blue-600 bg-blue-50 border-blue-100"
                                : apt.status === "cancelled"
                                  ? "text-red-600 bg-red-50 border-red-100"
                                  : "text-orange-600 bg-orange-50 border-orange-100"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="px-4 py-2 bg-[#199A8E] text-white text-xs font-bold rounded-xl hover:bg-[#15857a] shadow-lg shadow-emerald-100">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <CalendarX size={48} className="text-slate-200 mb-4" />
              <h3 className="text-base font-bold text-slate-800">
                No Appointments Today
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                You don't have any appointments scheduled for today. Check your
                schedule or take some well-deserved rest!
              </p>
              <button
                onClick={() => navigate("/doctor/schedule")}
                className="mt-5 px-6 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all"
              >
                View Full Schedule
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-[#199A8E]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Quick Actions
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "My Appointments",
                desc: "View and manage all appointments",
                path: "/doctor/appointments",
                color: "bg-emerald-50 border-emerald-100",
                iconColor: "text-emerald-600",
                icon: Calendar,
              },
              {
                label: "Schedule Management",
                desc: "Set your availability and time slots",
                path: "/doctor/schedule",
                color: "bg-blue-50 border-blue-100",
                iconColor: "text-blue-600",
                icon: Clock,
              },
              {
                label: "My Profile",
                desc: "Update your professional information",
                path: "/doctor/profile",
                color: "bg-purple-50 border-purple-100",
                iconColor: "text-purple-600",
                icon: Users,
              },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full p-5 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md hover:border-slate-200 transition-all group text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${action.color} ${action.iconColor}`}
                    >
                      <action.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {action.label}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-[#199A8E] group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Calendar */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2">
          Appointment Calendar
        </h2>
        <AppointmentCalendar />
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import {
  Users,
  CalendarCheck,
  Activity,
  Stethoscope,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import api from "../../lib/api";

interface AppointmentRow {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  rawDate: string;
  time: string;
  type: string;
  status: string;
}

export const Dashboard = () => {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aptsRes, docsRes, usersRes] = await Promise.all([
          api.get("/appointments/admin/all"),
          api.get("/doctors/admin/all"),
          api.get("/users/all-users"),
        ]);

        setAppointments(aptsRes.data || []);
        setDoctorCount(Array.isArray(docsRes.data) ? docsRes.data.length : 0);
        setUserCount(Array.isArray(usersRes.data) ? usersRes.data.length : 0);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Computed Stats ──
  const today = new Date().toISOString().split("T")[0];

  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter(
    (a) => a.rawDate === today
  ).length;

  const upcomingAppointments = appointments.filter(
    (a) => a.rawDate >= today && (a.status === "scheduled" || a.status === "confirmed")
  ).length;

  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  const scheduledCount = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled"
  ).length;

  const stats = [
    {
      label: "Total Doctors",
      value: doctorCount.toString(),
      subtext: "Registered physicians",
      icon: Stethoscope,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Appointments",
      value: totalAppointments.toLocaleString(),
      subtext: `${todayAppointments} today`,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Users",
      value: userCount.toLocaleString(),
      subtext: "Patients & staff",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Completed",
      value: completedAppointments.toLocaleString(),
      subtext: "Finished appointments",
      icon: CheckCircle2,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  // ── Usage Bars (percentage of total appointments) ──
  const pct = (n: number) =>
    totalAppointments > 0 ? Math.round((n / totalAppointments) * 100) : 0;

  const usageTrends = [
    { label: "Scheduled / Confirmed", value: pct(scheduledCount), color: "bg-emerald-500" },
    { label: "Completed", value: pct(completedAppointments), color: "bg-blue-500" },
    { label: "Cancelled", value: pct(cancelledCount), color: "bg-red-400" },
  ];

  // ── Recent 8 appointments ──
  const recentAppointments = appointments.slice(0, 8);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="text-[#199A8E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your healthcare system</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Trends & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointment Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">
            Appointment Breakdown
          </h3>
          <div className="space-y-6">
            {usageTrends.map((trend, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {trend.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {trend.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ${trend.color}`}
                    style={{ width: `${trend.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">
            Appointment Snapshot
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-md">
                  <Activity className="text-emerald-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Today</p>
                  <p className="text-xs text-emerald-600">
                    Active appointments
                  </p>
                </div>
              </div>
              <span className="font-bold text-gray-900">{todayAppointments}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Clock className="text-blue-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upcoming</p>
                  <p className="text-xs text-blue-600">Scheduled / Confirmed</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">{upcomingAppointments}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-md">
                  <CheckCircle2 className="text-gray-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completed</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">{completedAppointments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Recent Appointments</h3>
          <span className="text-xs text-gray-400">Showing latest {recentAppointments.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 pl-6">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Type</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No appointments found
                  </td>
                </tr>
              ) : (
                recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-900">
                      {apt.patientName}
                    </td>
                    <td className="p-4 text-gray-600">{apt.doctorName}</td>
                    <td className="p-4 text-gray-500 text-sm">{apt.date}</td>
                    <td className="p-4 text-gray-500 text-sm">{apt.time}</td>
                    <td className="p-4 text-gray-600">{apt.type}</td>
                    <td className="p-4 pr-6 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(apt.status)}`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

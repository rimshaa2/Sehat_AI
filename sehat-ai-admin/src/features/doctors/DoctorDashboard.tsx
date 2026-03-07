import React from "react";
import {
  Calendar,
  Clock,
  Users,
  Bell,
  Video,
  ChevronRight,
  Activity,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export const DoctorDashboard = () => {
  // Stats remain the same but with added visual depth
  const stats = [
    {
      label: "Today's Appts",
      value: "12",
      icon: Calendar,
      color: "text-[#199A8E]",
      bg: "bg-emerald-50 shadow-emerald-100",
    },
    {
      label: "Upcoming",
      value: "28",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50 shadow-blue-100",
    },
    {
      label: "Total Patients",
      value: "145",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 shadow-purple-100",
    },
    {
      label: "Emergencies",
      value: "2",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 shadow-red-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Hero Banner - Using Sehat AI Brand Gradients */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#199A8E] via-[#15857a] to-[#483D8B] rounded-[32px] p-10 text-white shadow-2xl shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight">
              Welcome back, Dr. Sarah Ahmed! 👋
            </h1>
            <p className="text-emerald-50/90 text-lg font-medium max-w-xl">
              Your day looks busy. You have 12 appointments scheduled, including
              2 critical emergency reviews.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <button className="px-8 py-3 bg-white text-[#199A8E] rounded-2xl font-bold text-sm shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all flex items-center gap-2">
                <Calendar size={18} /> View Schedule
              </button>
              <button className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                <Video size={18} /> Start Teleconsult
              </button>
            </div>
          </div>
          <div className="hidden lg:block opacity-10 transform rotate-12 scale-110">
            <Activity size={200} strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Stats Grid with Hover Elevation */}
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

      {/* Main Content Layout (Table + Emergencies) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Appointments Table - Takes 2/3 space on large screens */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Today's Appointments
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Saturday, March 07
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-bold text-[#199A8E] bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-[2px] font-black text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5">Patient</th>
                  <th className="px-8 py-5">Time</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  {
                    name: "John Anderson",
                    time: "09:00 AM",
                    type: "General Checkup",
                    status: "confirmed",
                  },
                  {
                    name: "Emily Brown",
                    time: "10:30 AM",
                    type: "Follow-up Visit",
                    status: "pending",
                  },
                  {
                    name: "Robert Smith",
                    time: "11:15 AM",
                    type: "Consultation",
                    status: "confirmed",
                  },
                ].map((apt, i) => (
                  <tr
                    key={i}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 shadow-inner">
                          {apt.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {apt.name}
                          </p>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${apt.status === "confirmed" ? "text-emerald-500" : "text-orange-500"}`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                      {apt.time}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        {apt.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                          Accept
                        </button>
                        <button className="px-4 py-2 bg-[#199A8E] text-white text-xs font-bold rounded-xl hover:bg-[#15857a] shadow-lg shadow-emerald-100">
                          Join Call
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Emergencies Sidebar - Column on the right */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-red-500 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Emergencies
              </h2>
            </div>
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                patient: "Robert Johnson",
                issue: "Abnormal BP",
                time: "12m ago",
                level: "Critical",
              },
              {
                patient: "Lisa Beckman",
                issue: "Medication Miss",
                time: "1h ago",
                level: "Warning",
              },
            ].map((alert, i) => (
              <div
                key={i}
                className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:border-red-200 transition-all group relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.level === "Critical" ? "bg-red-500" : "bg-orange-400"}`}
                />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      {alert.patient}
                    </h4>
                    <p className="text-xs text-red-600 font-bold mt-1">
                      {alert.issue}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold uppercase">
                      <Clock size={10} /> {alert.time}
                    </p>
                  </div>
                  <button className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Records - Bottom Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2">
          Recent Patient Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Alice Thompson",
              condition: "Hypertension",
              date: "Yesterday",
              trend: "up",
            },
            {
              name: "James Miller",
              condition: "Diabetes",
              date: "3 days ago",
              trend: "stable",
            },
            {
              name: "Sarah Davis",
              condition: "Post-Op",
              date: "1 week ago",
              trend: "down",
            },
            {
              name: "Michael Lee",
              condition: "Allergies",
              date: "2 weeks ago",
              trend: "stable",
            },
          ].map((record, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#483D8B]/10 text-[#483D8B] flex items-center justify-center font-black text-xs shadow-inner">
                  {record.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div
                  className={`p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-[#199A8E] transition-colors`}
                >
                  <ExternalLink size={16} />
                </div>
              </div>
              <h3 className="text-sm font-black text-slate-900 truncate">
                {record.name}
              </h3>
              <p className="text-xs text-[#199A8E] font-black uppercase tracking-widest mt-1">
                {record.condition}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {record.date}
                </span>
                <span className="text-[10px] font-black text-slate-700 hover:text-[#199A8E] cursor-pointer">
                  DETAILS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  UserCircle,
  LogOut,
  HeartPulse,
} from "lucide-react";
import { clsx } from "clsx";

const doctorMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/doctor/dashboard" },
  {
    icon: CalendarDays,
    label: "My Appointments",
    path: "/doctor/appointments",
  },
  { icon: Users, label: "Patient Records", path: "/doctor/patients" },
  {
    icon: ClipboardList,
    label: "Schedule Management",
    path: "/doctor/schedule",
  },
  { icon: UserCircle, label: "Profile", path: "/doctor/profile" },
];

export const DoctorSidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();

  return (
    <aside
      className={clsx(
        "bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-all duration-300 shadow-sm",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-3 h-24">
        <div className="bg-[#199A8E] p-2.5 rounded-2xl shadow-lg shadow-emerald-100">
          <HeartPulse size={24} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Sehat AI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#199A8E] font-bold">
              Doctor Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] px-4 mb-4">
            Medical Menu
          </p>
        )}

        {doctorMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ""}
              className={clsx(
                "group flex items-center rounded-2xl transition-all duration-200 font-semibold text-sm",
                isCollapsed ? "justify-center py-4" : "px-4 py-3.5 gap-3",
                isActive
                  ? "bg-[#199A8E] text-white shadow-md shadow-emerald-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#199A8E]",
              )}
            >
              <item.icon
                size={20}
                className={
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-[#199A8E]"
                }
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <div
          className={clsx(
            "bg-slate-50 rounded-2xl flex flex-col gap-3",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sehat-purple text-white flex items-center justify-center font-bold text-xs">
                SA
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">
                  Dr. Sarah Ahmed
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  Cardiologist
                </p>
              </div>
            </div>
          )}

          <button
            className={clsx(
              "flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all",
              isCollapsed ? "justify-center p-3" : "px-4 py-2.5 justify-center",
            )}
          >
            <LogOut size={16} />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
};

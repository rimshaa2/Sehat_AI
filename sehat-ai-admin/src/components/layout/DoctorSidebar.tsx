import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  UserCircle,
  LogOut,
  HeartPulse,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";

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

interface DoctorSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onMobileClose: () => void;
}

export const DoctorSidebar = ({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onMobileClose,
}: DoctorSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const doctorName = user?.displayName || "Doctor";
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      navigate("/login");
    }
  };

  const sidebarContent = (
    <aside
      className={clsx(
        "bg-white flex flex-col h-full transition-all duration-300 relative",
        // Desktop: fixed sidebar with border
        "lg:border-r lg:border-slate-200/80",
        // Width
        isCollapsed ? "lg:w-[78px]" : "lg:w-72",
        // Mobile: full width inside overlay
        "w-72"
      )}
    >
      {/* Decorative gradient line at the very top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#199A8E] via-[#15857a] to-[#483D8B] z-10" />

      {/* Brand Header */}
      <div
        className={clsx(
          "flex items-center h-20 border-b border-slate-100",
          isCollapsed ? "flex-col justify-center gap-1 px-3" : "px-5 gap-3"
        )}
      >
        {/* Logo + Text row */}
        <div className={clsx("flex items-center", isCollapsed ? "" : "gap-3 flex-1 min-w-0")}>
          <div className="relative flex-shrink-0">
            <div className="bg-gradient-to-br from-[#199A8E] to-[#15857a] p-2.5 rounded-2xl shadow-lg shadow-[#199A8E]/20 ring-2 ring-[#199A8E]/10">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-[#199A8E]/20 animate-ping opacity-20 pointer-events-none" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
                Sehat AI
              </h1>
              <p className="text-[10px] uppercase tracking-[3px] text-[#199A8E] font-bold">
                Doctor Portal
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) / Close (mobile) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 text-slate-400 hover:text-[#199A8E] hover:bg-[#199A8E]/[0.06] rounded-xl transition-all duration-200 flex-shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <button
          onClick={onMobileClose}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2.5px] px-3 mb-3">
            Medical Menu
          </p>
        )}

        {doctorMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={isCollapsed ? item.label : undefined}
              className={clsx(
                "group relative flex items-center rounded-2xl transition-all duration-200 font-semibold text-[13px]",
                isCollapsed
                  ? "justify-center py-3.5 mx-1"
                  : "px-4 py-3 gap-3",
                isActive
                  ? "bg-gradient-to-r from-[#199A8E] to-[#15857a] text-white shadow-lg shadow-[#199A8E]/20"
                  : "text-slate-500 hover:bg-[#199A8E]/[0.06] hover:text-[#199A8E]"
              )}
            >
              {/* Active indicator bar for collapsed mode */}
              {isActive && isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
              )}

              <item.icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={clsx(
                  "transition-all duration-200 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-[#199A8E] group-hover:scale-110"
                )}
              />

              {!isCollapsed && (
                <span className="truncate animate-in fade-in slide-in-from-left-1 duration-200">
                  {item.label}
                </span>
              )}

              {/* Hover tooltip for collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>



      {/* Bottom Profile Section */}
      <div
        className={clsx(
          "border-t border-slate-100",
          isCollapsed ? "p-2" : "p-4"
        )}
      >
        <div
          className={clsx(
            "bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100",
            isCollapsed ? "p-2 space-y-2" : "p-4 space-y-3"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#483D8B] to-[#5B4FB5] text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ring-2 ring-[#483D8B]/10">
                SA
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {doctorName}
                </p>
                <p className="text-[10px] text-[#199A8E] font-semibold truncate">
                  Cardiologist
                </p>
              </div>
              {/* Online indicator */}
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-emerald-100 flex-shrink-0" />
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#483D8B] to-[#5B4FB5] text-white flex items-center justify-center font-bold text-[10px] shadow-sm ring-2 ring-[#483D8B]/10 relative">
                SA
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
              </div>
            </div>
          )}

          <button
            onClick={() => handleLogout()}
            className={`
              flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-xl transition-all
              ${isCollapsed ? "justify-center p-3" : "px-4 py-3 w-full text-sm font-bold"}
            `}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar: fixed position */}
      <div className="hidden lg:block fixed top-0 left-0 h-full z-30">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          {/* Sidebar drawer */}
          <div className="relative h-full animate-in slide-in-from-left duration-300 w-fit shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
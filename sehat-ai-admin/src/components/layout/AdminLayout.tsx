import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Calendar,
  BarChart,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      navigate("/login");
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: UserCog, label: "Doctors Management", path: "/admin/doctors" },
    { icon: Calendar, label: "Appointments", path: "/admin/appointments" },
    { icon: BarChart, label: "Reports & Analytics", path: "/admin/reports" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Decor (Optional but adds premium feel) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#199A8E]/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sehat-purple/5 blur-[120px]" />
      </div>
      {/* Sidebar */}
      <aside
        className={`
        ${isCollapsed ? "w-20" : "w-72"} 
        bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col fixed h-full z-20 transition-all duration-300
      `}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="bg-[#199A8E] rounded-xl p-2">
                <Activity className="text-white h-5 w-5" />
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Sehat AI
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all ${isCollapsed ? "mx-auto" : ""}`}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : ""} // Tooltip on collapse
                className={`
                  w-full flex items-center rounded-xl transition-all duration-200 group
                  ${isCollapsed ? "justify-center py-4" : "px-4 py-3.5 justify-between"}
                  ${isActive ? "bg-[#199A8E] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-[#199A8E]"
                    }
                  />
                  {!isCollapsed && (
                    <span className="font-semibold text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && isActive && (
                  <ChevronRight size={14} className="text-emerald-100" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User & Logout Section */}
        <div className="p-4 border-t border-slate-50">
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
      </aside>

      {/* Main Content Area */}
      <main
        className={`
        flex-1 transition-all duration-300 
        ${isCollapsed ? "ml-20" : "ml-72"}
      `}
      >
        <div className="p-8 max-w-400 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

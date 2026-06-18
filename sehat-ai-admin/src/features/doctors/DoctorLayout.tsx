import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DoctorSidebar } from "../../components/layout/DoctorSidebar";
import {
  Menu,
  Bell,
  Search,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_URL = (() => {
  const base =
    (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";
  return base.replace(/\/api\/?$/, "");
})();

export const DoctorLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    { id: string; message: string; type: string; time: Date }[]
  >([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { dbUserId } = useAuth();

  useEffect(() => {
    if (!dbUserId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      socket.emit("JOIN_USER_ROOM", { userId: dbUserId });
    });

    socket.on("NEW_NOTIFICATION", (data: any) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          id: Date.now().toString() + Math.random(),
          message: data.message,
          type: data.type,
          time: new Date(),
        },
        ...prev,
      ]);
      toast.success(data.message, {
        duration: 4000,
        position: "top-right",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [dbUserId]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar Component */}
      <DoctorSidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "lg:ml-[78px]" : "lg:ml-72"
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
            >
              <Menu size={22} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
            >
              <Menu size={20} />
            </button>

            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search patient records..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#199A8E] outline-none w-64 transition-all focus:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action: Notification Bell with Pulse */}
            <div className="relative">
              <button
                onClick={() => {
                  setUnreadCount(0);
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className={`relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all ${isNotificationsOpen ? "bg-slate-100 text-[#199A8E]" : ""}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[11px] font-medium text-[#199A8E] hover:text-[#15857a]"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          No new notifications
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          You're all caught up!
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 items-start"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.type === "NEW_APPOINTMENT" ? "bg-blue-50 text-blue-500" : "bg-[#199A8E]/10 text-[#199A8E]"}`}
                            >
                              {notif.type === "NEW_APPOINTMENT" ? (
                                <Calendar size={14} />
                              ) : (
                                <MessageSquare size={14} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-slate-700 leading-snug">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {notif.time.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Minimalist Profile Trigger */}
            {/* <Link href="/profile"> */}

            <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer hover:border-[#199A8E] transition-all overflow-hidden">
              <User size={20} />
            </div>
            {/* </Link> */}
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

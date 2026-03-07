import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { DoctorSidebar } from "../../components/layout/DoctorSidebar";
import { Menu, Bell, Search, User } from "lucide-react";

export const DoctorLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar Component */}
      <DoctorSidebar isCollapsed={isCollapsed} />

      {/* Main Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
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
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Minimalist Profile Trigger */}
            <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer hover:border-[#199A8E] transition-all overflow-hidden">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-400 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

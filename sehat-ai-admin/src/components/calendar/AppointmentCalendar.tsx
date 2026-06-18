import { useState, useEffect, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CalendarX,
    Loader2,
} from "lucide-react";
import api from "../../lib/api";

interface CalendarAppointment {
    id: number;
    appointmentDate: string;
    timeSlot: string;
    status: string;
    reason?: string;
    patient?: {
        fullName: string;
        phoneNumber?: string;
        email?: string;
    };
}

export const AppointmentCalendar = () => {
    const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get("/doctors/my-appointments");
            setAppointments(res.data);
        } catch (error) {
            console.error("Failed to load appointments for calendar", error);
        } finally {
            setLoading(false);
        }
    };

    // Build a map of date -> appointments
    const appointmentMap = useMemo(() => {
        const map: Record<string, CalendarAppointment[]> = {};
        appointments.forEach((apt) => {
            const dateKey = apt.appointmentDate?.split("T")[0];
            if (!dateKey) return;
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(apt);
        });
        return map;
    }, [appointments]);

    // Calendar helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () =>
        setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () =>
        setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        const todayStr = new Date().toISOString().split("T")[0];
        setSelectedDate(todayStr);
    };

    const todayStr = new Date().toISOString().split("T")[0];

    // Build calendar grid (6 rows x 7 cols)
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
    while (calendarDays.length % 7 !== 0) calendarDays.push(null);

    const getDayKey = (day: number) => {
        const m = String(month + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${m}-${d}`;
    };

    const selectedAppointments = selectedDate
        ? appointmentMap[selectedDate] || []
        : [];

    const statusColor = (status: string) => {
        switch (status) {
            case "confirmed":
            case "scheduled":
                return "bg-emerald-500";
            case "completed":
                return "bg-blue-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-orange-500";
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
            case "scheduled":
                return "text-emerald-700 bg-emerald-50 border-emerald-100";
            case "completed":
                return "text-blue-700 bg-blue-50 border-blue-100";
            case "cancelled":
                return "text-red-700 bg-red-50 border-red-100";
            default:
                return "text-orange-700 bg-orange-50 border-orange-100";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="text-[#199A8E] animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">{monthName}</h2>
                        <button
                            onClick={goToToday}
                            className="text-xs font-bold text-[#199A8E] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        if (day === null) {
                            return (
                                <div
                                    key={idx}
                                    className="h-[90px] border-b border-r border-slate-50 bg-slate-50/30"
                                />
                            );
                        }

                        const dayKey = getDayKey(day);
                        const dayApts = appointmentMap[dayKey] || [];
                        const isToday = dayKey === todayStr;
                        const isSelected = dayKey === selectedDate;

                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(dayKey)}
                                className={`h-[90px] border-b border-r border-slate-50 p-2 text-left transition-all hover:bg-slate-50 relative group ${isSelected ? "bg-[#199A8E]/5 ring-1 ring-[#199A8E]/20 ring-inset" : ""
                                    }`}
                            >
                                <span
                                    className={`text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${isToday
                                            ? "bg-[#199A8E] text-white"
                                            : isSelected
                                                ? "text-[#199A8E]"
                                                : "text-slate-700"
                                        }`}
                                >
                                    {day}
                                </span>

                                {/* Appointment dots */}
                                {dayApts.length > 0 && (
                                    <div className="mt-1 space-y-0.5">
                                        {dayApts.slice(0, 2).map((apt, i) => (
                                            <div
                                                key={i}
                                                className={`text-[9px] font-semibold text-white px-1.5 py-0.5 rounded truncate ${statusColor(apt.status)}`}
                                            >
                                                {apt.timeSlot} {apt.patient?.fullName?.split(" ")[0] || ""}
                                            </div>
                                        ))}
                                        {dayApts.length > 2 && (
                                            <span className="text-[9px] font-bold text-slate-400 pl-1">
                                                +{dayApts.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Detail Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">
                        {selectedDate
                            ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })
                            : "Select a date"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {selectedDate
                            ? `${selectedAppointments.length} appointment${selectedAppointments.length !== 1 ? "s" : ""}`
                            : "Click on a date to view appointments"}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {!selectedDate ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <CalendarX size={36} className="text-slate-200 mb-3" />
                            <p className="text-sm text-slate-500 font-medium">
                                Click a date on the calendar to view appointments
                            </p>
                        </div>
                    ) : selectedAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <CalendarX size={36} className="text-slate-200 mb-3" />
                            <p className="text-sm font-semibold text-slate-700">
                                No appointments
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Nothing scheduled for this day
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {apt.patient?.fullName?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {apt.patient?.fullName || "Unknown"}
                                                </p>
                                                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                                                    <Clock size={11} />
                                                    {apt.timeSlot}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${statusBadge(apt.status)}`}
                                        >
                                            {apt.status}
                                        </span>
                                    </div>
                                    {apt.reason && (
                                        <p className="text-xs text-slate-500 mt-2 pl-12">
                                            {apt.reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
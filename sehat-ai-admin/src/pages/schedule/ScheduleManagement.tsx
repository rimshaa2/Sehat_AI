import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Save,
  Plus,
  X,
  Settings2,
  CalendarOff,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "../../lib/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DaySchedule {
  enabled: boolean;
  from: string;
  to: string;
}

interface BlockedDate {
  date: string;
  reason: string;
}

export const ScheduleManagement = () => {
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<string, DaySchedule>
  >(
    Object.fromEntries(
      DAYS.map((day) => [
        day,
        {
          enabled: !["Saturday", "Sunday"].includes(day),
          from: "09:00",
          to: "17:00",
        },
      ])
    )
  );

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { date: "2026-03-15", reason: "Medical Conference" },
    { date: "2026-03-22", reason: "Personal Leave" },
    { date: "2026-04-05", reason: "Public Holiday" },
  ]);

  const [appointmentDuration, setAppointmentDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("10");
  const [maxPerDay, setMaxPerDay] = useState("20");
  const [allowSelfBooking, setAllowSelfBooking] = useState(true);

  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch saved availability on mount
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctors/availability");
      const data = res.data;

      if (data && data.length > 0) {
        const loaded: Record<string, DaySchedule> = {};
        DAYS.forEach((day) => {
          const match = data.find((d: any) => d.dayOfWeek === day);
          if (match) {
            loaded[day] = {
              enabled: match.isAvailable,
              from: match.startTime?.substring(0, 5) || "09:00",
              to: match.endTime?.substring(0, 5) || "17:00",
            };
          } else {
            loaded[day] = { enabled: false, from: "09:00", to: "17:00" };
          }
        });
        setWeeklySchedule(loaded);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateTime = (day: string, field: "from" | "to", value: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const addBlockedDate = () => {
    if (!newBlockDate) return;
    setBlockedDates((prev) => [
      ...prev,
      { date: newBlockDate, reason: newBlockReason || "Unavailable" },
    ]);
    setNewBlockDate("");
    setNewBlockReason("");
  };

  const removeBlockedDate = (index: number) => {
    setBlockedDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Map weekly schedule to backend format
      const schedule = DAYS.map((day) => ({
        dayOfWeek: day,
        startTime: weeklySchedule[day].from,
        endTime: weeklySchedule[day].to,
        isAvailable: weeklySchedule[day].enabled,
      }));

      await api.put("/doctors/availability", { schedule });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save availability:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate quick stats
  const activeDays = Object.values(weeklySchedule).filter(
    (d) => d.enabled
  ).length;
  const totalHours = Object.values(weeklySchedule)
    .filter((d) => d.enabled)
    .reduce((sum, d) => {
      const from = parseInt(d.from.split(":")[0]) + parseInt(d.from.split(":")[1]) / 60;
      const to = parseInt(d.to.split(":")[0]) + parseInt(d.to.split(":")[1]) / 60;
      return sum + Math.max(0, to - from);
    }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Schedule Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your availability and working hours
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 ${saveSuccess
              ? "bg-emerald-500 text-white shadow-emerald-100"
              : "bg-[#199A8E] text-white shadow-emerald-100 hover:bg-[#15857a]"
            }`}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={18} />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Weekly Schedule (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Manage Your Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Manage Your Schedule
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set your availability and working hours
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Calendar size={13} className="text-[#199A8E]" />
                <span className="font-semibold text-slate-700">
                  Weekly Schedule
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {DAYS.map((day) => {
                const schedule = weeklySchedule[day];
                return (
                  <div
                    key={day}
                    className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border transition-all duration-200 ${schedule.enabled
                        ? "bg-white border-slate-200 hover:border-[#199A8E]/30 hover:shadow-sm"
                        : "bg-slate-50/50 border-slate-100"
                      }`}
                  >
                    {/* Toggle + Day Name */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <button
                        onClick={() => toggleDay(day)}
                        className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
                      >
                        {schedule.enabled ? (
                          <ToggleRight
                            size={32}
                            className="text-[#199A8E]"
                            fill="#199A8E"
                          />
                        ) : (
                          <ToggleLeft
                            size={32}
                            className="text-slate-300"
                          />
                        )}
                      </button>
                      <span
                        className={`text-sm font-bold ${schedule.enabled
                            ? "text-slate-900"
                            : "text-slate-400"
                          }`}
                      >
                        {day}
                      </span>
                    </div>

                    {/* Time Inputs */}
                    {schedule.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            From
                          </span>
                          <div className="relative">
                            <Clock
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="time"
                              value={schedule.from}
                              onChange={(e) =>
                                updateTime(day, "from", e.target.value)
                              }
                              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none w-[130px] transition-all"
                            />
                          </div>
                        </div>
                        <span className="text-slate-300 font-bold">→</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            To
                          </span>
                          <div className="relative">
                            <Clock
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="time"
                              value={schedule.to}
                              onChange={(e) =>
                                updateTime(day, "to", e.target.value)
                              }
                              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none w-[130px] transition-all"
                            />
                          </div>
                        </div>

                        {/* Available badge */}
                        <span className="hidden md:inline-flex items-center gap-1 ml-auto text-[10px] font-bold text-[#199A8E] bg-[#199A8E]/8 px-2.5 py-1 rounded-lg border border-[#199A8E]/15">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#199A8E]" />
                          Available
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">
                        Not available this day
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blocked Dates Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Blocked Dates & Holidays
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mark dates when you're unavailable
                </p>
              </div>
              <CalendarOff size={18} className="text-slate-400" />
            </div>

            <div className="p-6 space-y-4">
              {/* Add new blocked date */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none transition-all"
                  />
                </div>
                <input
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  onClick={addBlockedDate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] transition-all active:scale-95 shadow-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Block Date</span>
                </button>
              </div>

              {/* List of blocked dates */}
              {blockedDates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {blockedDates.map((blocked, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-3 px-4 py-3 bg-red-50/60 rounded-2xl border border-red-100 hover:border-red-200 transition-all"
                    >
                      <div className="flex-shrink-0 p-2 bg-red-100 rounded-xl">
                        <CalendarOff size={16} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(blocked.date + "T00:00").toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {blocked.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => removeBlockedDate(i)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarOff size={28} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">
                    No blocked dates
                  </p>
                  <p className="text-xs text-slate-400">
                    Add dates when you're not available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings (1/3 width) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Appointment Settings card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Settings2 size={18} className="text-[#199A8E]" />
              <h2 className="text-base font-bold text-slate-900">
                Appointment Settings
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Appointment Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["15", "30", "45"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAppointmentDuration(val)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${appointmentDuration === val
                          ? "bg-[#199A8E] text-white shadow-md shadow-[#199A8E]/20"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-[#199A8E]/30"
                        }`}
                    >
                      {val} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Buffer Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Buffer Time
                </label>
                <p className="text-[11px] text-slate-400">
                  Break between appointments
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {["0", "5", "10", "15"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBufferTime(val)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${bufferTime === val
                          ? "bg-[#199A8E] text-white shadow-md shadow-[#199A8E]/20"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-[#199A8E]/30"
                        }`}
                    >
                      {val}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Max per day */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Max Appointments / Day
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={maxPerDay}
                    onChange={(e) => setMaxPerDay(e.target.value)}
                    min={1}
                    max={50}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Self-booking toggle */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Allow self-booking
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Patients can book online
                  </p>
                </div>
                <button
                  onClick={() => setAllowSelfBooking(!allowSelfBooking)}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  {allowSelfBooking ? (
                    <ToggleRight
                      size={36}
                      className="text-[#199A8E]"
                      fill="#199A8E"
                    />
                  ) : (
                    <ToggleLeft size={36} className="text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats mini card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Quick Stats
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Active Days",
                  value: `${activeDays}/7`,
                  color: "text-[#199A8E]",
                },
                {
                  label: "Hours / Week",
                  value: `${totalHours.toFixed(1)}h`,
                  color: "text-blue-600",
                },
                {
                  label: "Blocked Dates",
                  value: blockedDates.length.toString(),
                  color: "text-red-500",
                },
                {
                  label: "Slots / Day",
                  value:
                    appointmentDuration !== "0"
                      ? Math.floor(
                        (totalHours / activeDays || 0) *
                        (60 /
                          (parseInt(appointmentDuration) +
                            parseInt(bufferTime)))
                      ).toString()
                      : "0",
                  color: "text-amber-600",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-500 font-medium">
                    {stat.label}
                  </span>
                  <span className={`text-sm font-black ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}

              {/* Visual progress bar for active days */}
              <div className="pt-2">
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className={`h-2 flex-1 rounded-full transition-colors ${weeklySchedule[day].enabled
                          ? "bg-[#199A8E]"
                          : "bg-slate-200"
                        }`}
                      title={day}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-400 font-medium">
                    Mon
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    Sun
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
            <div className="flex gap-3">
              <AlertCircle
                size={18}
                className="text-blue-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-bold text-blue-900">
                  Schedule Tip
                </p>
                <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                  Keep buffer time between appointments to allow for notes and
                  preparation. A 10-minute buffer is recommended for most
                  practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

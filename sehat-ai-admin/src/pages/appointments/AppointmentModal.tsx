import { useState } from "react";
import { X, User, Stethoscope, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import api from "../../lib/api";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const AppointmentModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AppointmentModalProps) => {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "Consultation",
    location: "Room 101",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/appointments/book", {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.appointmentTime,
        reason: formData.type + (formData.notes ? ` - ${formData.notes}` : ""),
        amount: 50, // Default consultation fee or fetch from doctor profile
      });

      // Clear form on success
      setFormData({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        type: "Consultation",
        location: "Room 101",
        notes: "",
      });

      // Notify parent to close and refresh
      onSubmit(formData);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.response?.data?.error || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-[#199A8E] p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Schedule Appointment</h2>
              <p className="text-sm opacity-80">
                Book a new medical session in the SehatAI system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Patient ID / Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  placeholder="Enter Patient ID"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Assigned Doctor
              </label>
              <div className="relative">
                <Stethoscope
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  placeholder="Enter Doctor ID"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, doctorId: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Appointment Date
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  type="date"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Preferred Time
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  type="time"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Type and Location */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Session Type
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#199A8E]"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Lab Review</option>
                <option>Vaccination</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Location / Room
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  value={formData.location}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 border border-transparent hover:bg-slate-50 rounded-2xl transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 flex items-center justify-center gap-2 py-4 bg-[#199A8E] text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-[#15857a] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Booking...
                </>
              ) : (
                "Create Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

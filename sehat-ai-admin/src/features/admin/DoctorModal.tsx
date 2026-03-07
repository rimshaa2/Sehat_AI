import React, { useState, useEffect } from "react";
import { X, User, Briefcase, DollarSign, ShieldCheck } from "lucide-react";
import type { Doctor } from "../../types/index";

type DoctorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  doctor?: Doctor | null;
};

export const DoctorModal = ({
  isOpen,
  onClose,
  onSubmit,
  doctor,
}: DoctorModalProps) => {
  const isEditMode = !!doctor;

  const initialState = {
    specialization: "",
    experienceYears: 0,
    consultationFee: 0,
    licenseNumber: "",
    bio: "",
    user: { fullName: "", email: "" },
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (doctor) {
      setFormData({
        specialization: doctor.specialization,
        experienceYears: doctor.experienceYears,
        consultationFee: doctor.consultationFee,
        licenseNumber: doctor.licenseNumber,
        bio: doctor.bio || "",
        user: {
          fullName: doctor.user?.fullName || "",
          email: doctor.user?.email || "",
        },
      });
    } else {
      setFormData(initialState);
    }
  }, [doctor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // CRITICAL: Ensure numbers are actually numbers for Sequelize
    const finalData = {
      ...formData,
      experienceYears: Number(formData.experienceYears),
      consultationFee: Number(formData.consultationFee),
    };
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div
          className={`p-8 text-white flex justify-between items-center ${isEditMode ? "bg-sehat-purple" : "bg-[#199A8E]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Update Specialist" : "Register Specialist"}
              </h2>
              <p className="text-sm opacity-80">
                Managing medical staff credentials
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
          className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Personal Info */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  value={formData.user.fullName}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user: { ...formData.user, fullName: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Email
              </label>
              <input
                required
                type="email"
                disabled={isEditMode}
                value={formData.user.email}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-50 outline-none"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    user: { ...formData.user, email: e.target.value },
                  })
                }
              />
            </div>

            {/* Professional Info */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Specialization
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  value={formData.specialization}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Consultation Fee
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  required
                  type="number"
                  value={formData.consultationFee}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFee: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Bio Field - Matching your Model's TEXT type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              Professional Biography
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#199A8E] outline-none resize-none"
              placeholder="Tell patients about this doctor's expertise..."
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className={`flex-2 py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] ${isEditMode ? "bg-sehat-purple hover:shadow-indigo-200" : "bg-[#199A8E] hover:shadow-emerald-200"}`}
            >
              {isEditMode ? "Save Changes" : "Confirm Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

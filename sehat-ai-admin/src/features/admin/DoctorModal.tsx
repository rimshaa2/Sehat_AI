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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.user.fullName.trim()) errs.fullName = "Full name is required.";
    else if (formData.user.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters.";
    if (!isEditMode) {
      if (!formData.user.email.trim()) errs.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(formData.user.email)) errs.email = "Enter a valid email address.";
    }
    if (!formData.specialization) errs.specialization = "Specialization is required.";
    if (!formData.consultationFee || Number(formData.consultationFee) <= 0) errs.consultationFee = "Fee must be greater than 0.";
    if (!formData.licenseNumber.trim()) errs.licenseNumber = "License number is required.";
    else if (!/^\d{1,6}-[A-Za-z]$/.test(formData.licenseNumber.trim())) errs.licenseNumber = "Invalid PMDC format (e.g., 12345-P).";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearErr = (field: string) => setFieldErrors(p => { const n = { ...p }; delete n[field]; return n; });

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
    if (!validate()) return;
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
                  value={formData.user.fullName}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ${fieldErrors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#199A8E]'
                    }`}
                  onChange={(e) => {
                    setFormData({ ...formData, user: { ...formData.user, fullName: e.target.value } });
                    clearErr('fullName');
                  }}
                />
              </div>
              {fieldErrors.fullName && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.fullName}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Email
              </label>
              <input
                type="email"
                disabled={isEditMode}
                value={formData.user.email}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl disabled:opacity-50 outline-none focus:ring-2 ${fieldErrors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#199A8E]'
                  }`}
                onChange={(e) => {
                  setFormData({ ...formData, user: { ...formData.user, email: e.target.value } });
                  clearErr('email');
                }}
              />
              {fieldErrors.email && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.email}</p>}
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
                <select
                  value={formData.specialization}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none appearance-none focus:ring-2 ${fieldErrors.specialization ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#199A8E]'
                    }`}
                  onChange={(e) => {
                    setFormData({ ...formData, specialization: e.target.value });
                    clearErr('specialization');
                  }}
                >
                  <option value="" disabled>Select Specialization</option>
<option value="Allergy & Immunology">Allergy & Immunology</option>
<option value="Bones">Bones</option>
<option value="Cardiology">Cardiology</option>
<option value="Dental">Dental</option>
<option value="Dermatology">Dermatology</option>
<option value="Ear, Nose & Throat">Ear, Nose & Throat</option>
<option value="Endocrinology">Endocrinology</option>
<option value="General Practice">General Practice</option>
<option value="General Surgery">General Surgery</option>
<option value="Gastroenterology">Gastroenterology</option>
<option value="Gynaecology">Gynaecology</option>
<option value="Haematology">Haematology</option>
<option value="Hepatology">Hepatology</option>
<option value="Infectious Disease">Infectious Disease</option>
<option value="Mental wellness">Mental wellness</option>
<option value="Nephrology">Nephrology</option>
<option value="Neurology">Neurology</option>
<option value="Nutrition & Dietetics">Nutrition & Dietetics</option>
<option value="Oncology">Oncology</option>
<option value="Ophthalmology">Ophthalmology</option>
<option value="Orthopaedics">Orthopaedics</option>
<option value="Paediatrics">Paediatrics</option>
<option value="Physiotherapy">Physiotherapy</option>
<option value="Psychiatry">Psychiatry</option>
<option value="Pulmonology">Pulmonology</option>
<option value="Rheumatology">Rheumatology</option>
<option value="Urology">Urology</option>
<option value="Vascular Surgery">Vascular Surgery</option>
                </select>
              </div>
              {fieldErrors.specialization && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.specialization}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                License / PMDC Number
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="e.g. 12345-P"
                  value={formData.licenseNumber}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ${fieldErrors.licenseNumber ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#199A8E]'
                    }`}
                  onChange={(e) => {
                    setFormData({ ...formData, licenseNumber: e.target.value });
                    clearErr('licenseNumber');
                  }}
                />
              </div>
              {fieldErrors.licenseNumber && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.licenseNumber}</p>}
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
                  type="number"
                  value={formData.consultationFee}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ${fieldErrors.consultationFee ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#199A8E]'
                    }`}
                  onChange={(e) => {
                    setFormData({ ...formData, consultationFee: Number(e.target.value) });
                    clearErr('consultationFee');
                  }}
                />
              </div>
              {fieldErrors.consultationFee && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{fieldErrors.consultationFee}</p>}
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Award, Loader2 } from "lucide-react";
import api from "../../lib/api";

export const DoctorApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    specialization: "",
    licenseNumber: "",
    experienceYears: "",
    consultationFee: "",
    bio: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.specialization) errs.specialization = "Specialization is required.";
    if (!form.experienceYears) errs.experienceYears = "Experience is required.";
    else if (Number(form.experienceYears) < 0 || Number(form.experienceYears) > 70) errs.experienceYears = "Enter a valid number (0–70).";
    if (!form.consultationFee) errs.consultationFee = "Consultation fee is required.";
    else if (Number(form.consultationFee) <= 0) errs.consultationFee = "Fee must be greater than 0.";
    if (!form.licenseNumber.trim()) errs.licenseNumber = "License number is required.";
    else if (!/^\d{1,6}-[A-Za-z]$/.test(form.licenseNumber.trim())) errs.licenseNumber = "Invalid PMDC format. Expected: 12345-P (digits, dash, letter).";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearErr = (field: string) => setFieldErrors(p => { const n = { ...p }; delete n[field]; return n; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/doctors/apply", form);
      navigate("/doctor/pending"); // Success! Send them to waiting room.
    } catch (error) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Doctor Verification
          </h2>
          <p className="text-gray-500 mt-1">
            Please provide your medical credentials to join Sehat AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <select
                  className={`w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 ${fieldErrors.specialization ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-sehat-teal'
                    }`}
                  value={form.specialization}
                  onChange={(e) => {
                    setForm({ ...form, specialization: e.target.value });
                    clearErr('specialization');
                  }}
                >
                  <option value="" disabled>Select...</option>
                  <option value="Ear, Nose & Throat">Ear, Nose & Throat</option>
                  <option value="Mental wellness">Mental wellness</option>
                  <option value="Dental">Dental</option>
                  <option value="Bones">Bones</option>
                </select>
              </div>
              {fieldErrors.specialization && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.specialization}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${fieldErrors.experienceYears ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-sehat-teal'
                  }`}
                value={form.experienceYears}
                onChange={(e) => {
                  setForm({ ...form, experienceYears: e.target.value });
                  clearErr('experienceYears');
                }}
              />
              {fieldErrors.experienceYears && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.experienceYears}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Fee (PKR)
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${fieldErrors.consultationFee ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-sehat-teal'
                }`}
              placeholder="e.g. 1500"
              value={form.consultationFee}
              onChange={(e) => {
                setForm({ ...form, consultationFee: e.target.value });
                clearErr('consultationFee');
              }}
            />
            {fieldErrors.consultationFee && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.consultationFee}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PMDC / Medical License Number
            </label>
            <div className="relative">
              <Award
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="e.g. 12345-P"
                className={`w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 ${fieldErrors.licenseNumber ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-sehat-teal'
                  }`}
                value={form.licenseNumber}
                onChange={(e) => {
                  setForm({ ...form, licenseNumber: e.target.value });
                  clearErr('licenseNumber');
                }}
              />
            </div>
            {fieldErrors.licenseNumber && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.licenseNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Bio
            </label>
            <textarea
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sehat-teal"
              placeholder="Tell us about your medical background..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sehat-teal text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition-all flex justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Submit for Verification"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

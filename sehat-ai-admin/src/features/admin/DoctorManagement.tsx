import { useEffect, useState } from "react";
import {
  Check,
  Search,
  ShieldCheck,
  Clock,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import api from "../../lib/api";
import { DoctorModal } from "./DoctorModal";

import type { Doctor } from "../../types/index";

export const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"verified" | "pending">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors/admin/all");
      setDoctors(res.data);
    } catch (error) {
      console.error("Failed to load doctors", error);
    } finally {
      setLoading(false);
    }
  };

  // Unified Open Handlers
  const handleOpenAdd = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  // Unified Submit Logic (Create & Update)
  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedDoctor) {
        // UPDATE LOGIC
        await api.put(`/admin/doctor/${selectedDoctor.id}`, formData);
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === selectedDoctor.id
              ? {
                  ...doc,
                  ...formData, // Updates specialization, fee, etc.
                  user: {
                    ...doc.user,
                    fullName: formData.user.fullName, // Specifically update nested name
                    email: formData.user.email,
                  },
                }
              : doc,
          ),
        );

        alert("Doctor updated successfully!");
      } else {
        // CREATE LOGIC
        await api.post("/admin/register-doctor", {
          ...formData,
          password: "TemporaryPassword123!",
          role: "doctor",
        });
        fetchDoctors();
        alert("Doctor registered successfully!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleApprove = async (doctorId: number, name: string) => {
    if (!window.confirm(`Approve Dr. ${name}?`)) return;
    try {
      await api.put(`/doctors/verify/${doctorId}`);
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId
            ? { ...doc, verificationStatus: "verified" }
            : doc,
        ),
      );
    } catch (error) {
      alert("Verification failed.");
    }
  };

  const handleDelete = async (doctorId: number, name: string) => {
    if (!window.confirm(`Permanently remove Dr. ${name}?`)) return;
    try {
      await api.delete(`/admin/doctor/${doctorId}`);
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (error) {
      alert("Failed to delete doctor.");
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesTab = doc.verificationStatus === activeTab;
    const matchesSearch =
      doc.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = doctors.filter(
    (d) => d.verificationStatus === "pending",
  ).length;

  if (loading)
    return (
      <div className="p-8 text-[#199A8E] font-bold">
        Loading SehatAI Staff...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Doctors Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage SehatAI medical professionals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#199A8E] w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#199A8E] text-white rounded-lg text-sm font-bold hover:bg-[#15857a] transition-all"
          >
            <Plus size={18} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === "pending"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock
            size={16}
            className={activeTab === "pending" ? "text-orange-500" : ""}
          />
          Pending{" "}
          {pendingCount > 0 && (
            <span className="ml-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("verified")}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === "verified"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShieldCheck
            size={16}
            className={activeTab === "verified" ? "text-emerald-500" : ""}
          />
          Verified
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 pl-6">Doctor Name</th>
              <th className="p-4">Specialization</th>
              <th className="p-4">License / Exp</th>
              <th className="p-4">Applied Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-gray-900">
                      {doc.user?.fullName}
                    </div>
                    <div className="text-xs text-gray-500">{doc.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                      {doc.specialization}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-mono">{doc.licenseNumber}</div>
                    <div className="text-xs text-gray-500">
                      {doc.experienceYears} Years Exp.
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        doc.verificationStatus === "verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {doc.verificationStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex justify-end gap-2">
                      {activeTab === "pending" && (
                        <button
                          onClick={() =>
                            handleApprove(doc.id, doc.user?.fullName)
                          }
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.user?.fullName)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-10 w-10 text-gray-300" />
                    <p className="text-base font-semibold text-gray-900 mt-2">
                      No {activeTab} doctors found
                    </p>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      {activeTab === "pending" 
                        ? "There are currently no new doctor applications waiting to be reviewed."
                        : "No verified doctors match your search."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        doctor={selectedDoctor}
      />
    </div>
  );
};

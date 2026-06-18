import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  ChevronRight,
  MoreVertical,
  UserPlus,
  X,
  Heart,
  Droplets,
  AlertTriangle,
  Pill
} from "lucide-react";
import api from "../../lib/api";

const calculateAge = (dob: string) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const PatientRecords = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientMedicines, setPatientMedicines] = useState<any[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // We derive unique patients from the doctor's appointments
      const res = await api.get("/doctors/my-appointments");
      const appointments = res.data || [];
      console.log("Fetched appointments for patients screen:", appointments.length);
      
      // Extract unique patients
      const patientMap = new Map();
      
      appointments.forEach((apt: any) => {
        if (apt.patient) { // Check for valid patient object
          const pId = apt.patientId || apt.patient.id;
          if (!pId) {
            console.warn("Skipping appointment with no patient ID:", apt);
            return;
          }

          if (!patientMap.has(pId)) {
            patientMap.set(pId, {
              ...apt.patient,
              patientId: pId,
              latestAppointment: apt.appointmentDate,
              totalVisits: 1,
              status: "Active",
              age: calculateAge(apt.patient.dateOfBirth),
              gender: apt.patient.gender || "Unknown",
              medicalContext: apt.reason || apt.patient.medicalHistory || "General Consultation",
            });
          } else {
            const existing = patientMap.get(pId);
            existing.totalVisits += 1;
            // Update latest appointment and medical context if this one is newer
            if (new Date(apt.appointmentDate) > new Date(existing.latestAppointment)) {
              existing.latestAppointment = apt.appointmentDate;
              if (apt.reason) existing.medicalContext = apt.reason;
            }
          }
        }
      });
      
      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const nameMatch = p.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = p.phoneNumber?.includes(searchQuery);
    return nameMatch || phoneMatch;
  });

  const openPatientDetails = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingMedicines(true);
    try {
      const res = await api.get(`/medicines/patient/${patient.patientId}`);
      setPatientMedicines(res.data || []);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const closePatientDetails = () => {
    setSelectedPatient(null);
    setPatientMedicines([]);
  };

  // BMI Calculation
  const renderBMI = (w: number, h: number) => {
    if (!w || !h || h === 0) return "N/A";
    const val = (w / ((h / 100) ** 2)).toFixed(1);
    const v = parseFloat(val);
    const label = v < 18.5 ? "Underweight" : v < 25 ? "Normal weight" : v < 30 ? "Overweight" : "Obese";
    const color = v < 18.5 ? "text-amber-500" : v < 25 ? "text-emerald-500" : v < 30 ? "text-orange-500" : "text-red-500";
    return <span className={`font-semibold ${color}`}>{val} ({label})</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage all your registered patients
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-95">
            <UserPlus size={18} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#199A8E]/20 focus:border-[#199A8E] outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Medical Context</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-center">Visits</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#199A8E] border-t-transparent animate-spin mb-3"></div>
                      <p>Loading patient records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                        <User className="text-slate-400" size={28} />
                      </div>
                      <p className="text-slate-700 font-semibold mb-1">No patients found</p>
                      <p className="text-slate-500 text-sm">
                        {searchQuery ? "No matching patients for your search." : "You haven't seen any patients yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient: any) => {
                  const initials = patient.fullName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2) || "P";

                  return (
                    <tr key={patient.patientId} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#199A8E] to-[#15857a] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#199A8E] transition-colors">
                              {patient.fullName || "Unknown Patient"}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{patient.gender}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span>{patient.age} yrs</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="font-medium">#{patient.patientId}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-slate-600 text-sm">
                            <Phone size={13} className="text-slate-400" />
                            {patient.phoneNumber || "Not provided"}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Mail size={12} className="text-slate-400" />
                            {patient.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex items-start gap-2">
                          <Activity size={14} className="text-[#199A8E] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600 line-clamp-2" title={patient.medicalContext}>
                            {patient.medicalContext}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Calendar size={14} className="text-[#199A8E]" />
                          {patient.latestAppointment 
                            ? new Date(patient.latestAppointment).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#199A8E]/10 text-[#199A8E] font-bold text-xs">
                          {patient.totalVisits}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openPatientDetails(patient)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Medical Records"
                          >
                            <Activity size={18} />
                          </button>
                          <button 
                            onClick={() => openPatientDetails(patient)}
                            className="p-2 text-slate-400 hover:text-[#199A8E] hover:bg-[#199A8E]/10 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <ChevronRight size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {!loading && filteredPatients.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
            <p>Showing <span className="font-semibold text-slate-700">{filteredPatients.length}</span> patients</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50">Prev</button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#199A8E] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedPatient.fullName?.substring(0, 2).toUpperCase() || "PT"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedPatient.fullName}</h2>
                  <p className="text-sm text-slate-500">Patient ID: #{selectedPatient.patientId}</p>
                </div>
              </div>
              <button 
                onClick={closePatientDetails}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Health Profile Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} className="text-[#199A8E]" />
                  Health Profile
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Age / Gender</p>
                    <p className="font-semibold text-slate-900">{selectedPatient.age} / {selectedPatient.gender}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Droplets size={12} className="text-red-500" /> Blood Type
                    </p>
                    <p className="font-semibold text-slate-900">{selectedPatient.bloodType || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Weight / Height</p>
                    <p className="font-semibold text-slate-900">
                      {selectedPatient.weight ? `${selectedPatient.weight} kg` : "-"} / {selectedPatient.height ? `${selectedPatient.height} cm` : "-"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">BMI</p>
                    <p className="font-semibold text-slate-900">
                      {renderBMI(selectedPatient.weight, selectedPatient.height)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" />
                  Medical Context
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <p className="text-xs text-rose-600/70 font-semibold mb-2 flex items-center gap-1">
                      <AlertTriangle size={14} /> Known Allergies
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedPatient.allergies || "No known allergies."}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600/70 font-semibold mb-2">
                      Medical History / Conditions
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedPatient.medicalHistory || "No significant medical history provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Contact</h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row gap-6">
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{selectedPatient.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Emergency Contact</p>
                    <p className="text-sm font-medium text-slate-900">{selectedPatient.emergencyContact || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Medicine Logs */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Pill size={16} className="text-[#199A8E]" />
                  Active Medicine Logs
                </h3>
                
                {loadingMedicines ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-[#199A8E] border-t-transparent animate-spin"></div>
                  </div>
                ) : patientMedicines.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100">
                    <Pill size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-600 font-medium">No medicine logs found</p>
                    <p className="text-slate-400 text-sm">The patient has not logged any medicines.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {patientMedicines.map((med) => (
                      <div key={med.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${med.color}15` }}
                        >
                          <Pill size={18} color={med.color || "#199A8E"} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{med.name}</p>
                          <p className="text-sm text-slate-500">
                            {med.dose} {med.unit} • {med.freq}
                          </p>
                          {med.note && (
                            <p className="text-xs text-slate-400 mt-2 italic">"{med.note}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

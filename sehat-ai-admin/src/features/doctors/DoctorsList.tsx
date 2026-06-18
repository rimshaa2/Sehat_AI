import { useEffect, useState } from 'react';
import { Check, X, Clock, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verified' | 'pending'>('verified');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      // Create a new endpoint /doctors/all in your backend that returns EVERYONE
      // Or filter client-side if your list is small
      const res = await api.get('/doctors/all'); 
      setDoctors(res.data);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: number, name: string) => {
    if (!confirm(`Promote ${name} to Doctor? They will gain access to patient data.`)) return;

    try {
      // Call the API
      await api.put(`/doctors/verify/${doctorId}`);
      
      // Update UI Instantly (Optimistic Update)
      setDoctors(prev => prev.map(d => 
        d.id === doctorId ? { ...d, verificationStatus: 'verified' } : d
      ));
      
      alert("Doctor Verified Successfully!");
    } catch (error) {
      alert("Failed to verify doctor. Check console.");
    }
  };

  const pendingCount = doctors.filter(d => d.verificationStatus === 'pending').length;
  const filteredDoctors = doctors.filter(d => d.verificationStatus === activeTab);

  if (loading) return <div className="p-8 text-gray-500">Loading Medical Staff...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Staff</h1>
          <p className="text-gray-500 mt-1">Manage verification and permissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('verified')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-all ${
            activeTab === 'verified' 
              ? 'text-sehat-teal border-b-2 border-sehat-teal' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ShieldCheck size={18} />
          Active Doctors
        </button>

        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-all ${
            activeTab === 'pending' 
              ? 'text-orange-600 border-b-2 border-orange-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Clock size={18} />
          Pending Requests
          {pendingCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {activeTab === 'pending' ? "No pending applications." : "No active doctors found."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">License</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{doc.user?.fullName || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">{doc.user?.email}</div>
                  </td>
                  <td className="p-4 text-gray-700">{doc.specialization}</td>
                  <td className="p-4 font-mono text-sm text-gray-500">{doc.licenseNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      doc.verificationStatus === 'verified' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {doc.verificationStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {activeTab === 'pending' ? (
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => handleApprove(doc.id, doc.user?.fullName)}
                           className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition border border-green-200"
                         >
                           <Check size={16} /> Approve
                         </button>
                         <button className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition border border-red-200">
                           <X size={16} /> Reject
                         </button>
                      </div>
                    ) : (
                      <button className="text-gray-400 hover:text-sehat-teal text-sm">View Details</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
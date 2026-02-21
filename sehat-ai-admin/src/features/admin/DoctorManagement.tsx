import { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  Search, 
  ShieldCheck, 
  Clock, 
  MoreVertical,
  Filter
} from 'lucide-react';
import api from '../../lib/api';

interface Doctor {
  id: number;
  specialization: string;
  licenseNumber: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  experienceYears: number;
  consultationFee: number;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verified' | 'pending'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Real Data on Load
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors/admin/all');
      setDoctors(res.data);
    } catch (error) {
      console.error("Failed to load doctors", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Approval Action
  const handleApprove = async (doctorId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to approve Dr. ${name}?`)) return;

    try {
      // Call Backend
      await api.put(`/doctors/verify/${doctorId}`);
      
      // Update UI Optimistically (Instant Feedback)
      setDoctors(prev => prev.map(doc => 
        doc.id === doctorId ? { ...doc, verificationStatus: 'verified' } : doc
      ));
    } catch (error) {
      alert("Failed to verify doctor. Check console.");
    }
  };

  // Filter Logic
  const filteredDoctors = doctors.filter(doc => {
    const matchesTab = doc.verificationStatus === activeTab;
    const matchesSearch = doc.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = doctors.filter(d => d.verificationStatus === 'pending').length;

  if (loading) return <div className="p-8">Loading Medical Staff...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-gray-500 mt-1">Approve and manage medical staff</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
             <input 
               type="text" 
               placeholder="Search doctors..." 
               className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 w-64"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
             <Filter size={16} /> Filter
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === 'pending' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={16} className={activeTab === 'pending' ? 'text-orange-500' : ''} />
          Pending Requests
          {pendingCount > 0 && (
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
              {pendingCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === 'verified' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck size={16} className={activeTab === 'verified' ? 'text-emerald-500' : ''} />
          Active Doctors
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {activeTab === 'pending' ? "No pending applications." : "No active doctors found."}
          </div>
        ) : (
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
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-gray-900">{doc.user?.fullName || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{doc.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                      {doc.specialization}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 font-mono">{doc.licenseNumber}</div>
                    <div className="text-xs text-gray-500">{doc.experienceYears} Years Exp.</div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      doc.verificationStatus === 'verified' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        doc.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}></span>
                      {doc.verificationStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    {activeTab === 'pending' ? (
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => handleApprove(doc.id, doc.user?.fullName)}
                           className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition shadow-sm"
                         >
                           <Check size={16} /> Approve
                         </button>
                         <button className="flex items-center gap-1 bg-white border border-gray-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                           <X size={16} /> Reject
                         </button>
                      </div>
                    ) : (
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={20} />
                      </button>
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
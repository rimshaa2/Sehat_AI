import { 
  Users, 
  CalendarCheck, 
  Activity, 
  AlertTriangle, 
  Download,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const Dashboard = () => {
  // Mock Data (Replace with API calls later)
  const stats = [
    { 
      label: 'Total Doctors', 
      value: '48', 
      subtext: '+3 this month', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Appointments', 
      value: '2,847', 
      subtext: '+12% from last week', 
      icon: CalendarCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Active Users', 
      value: '1,234', 
      subtext: '892 patients online', 
      icon: Activity, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Emergency Alerts', 
      value: '3', 
      subtext: 'Requires attention', 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
  ];

  const usageTrends = [
    { label: 'Appointments', value: 85, color: 'bg-emerald-500' },
    { label: 'Patient Records', value: 92, color: 'bg-blue-500' },
    { label: 'Prescriptions', value: 78, color: 'bg-purple-500' },
    { label: 'Teleconsultations', value: 65, color: 'bg-green-500' },
  ];

  const appointments = [
    { patient: 'John Anderson', doctor: 'Dr. Sarah Johnson', date: '2026-02-04', time: '09:00 AM', type: 'General Checkup', status: 'confirmed' },
    { patient: 'Emily Davis', doctor: 'Dr. Michael Chen', date: '2026-02-04', time: '10:30 AM', type: 'Follow up', status: 'pending' },
    { patient: 'Robert Smith', doctor: 'Dr. Lisa Wong', date: '2026-02-04', time: '11:00 AM', type: 'Consultation', status: 'confirmed' },
    { patient: 'Maria Garcia', doctor: 'Dr. Sarah Johnson', date: '2026-02-04', time: '02:00 PM', type: 'Lab Review', status: 'completed' },
    { patient: 'David Wilson', doctor: 'Dr. Emily Brown', date: '2026-02-05', time: '09:30 AM', type: 'Treatment', status: 'confirmed' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your healthcare system</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Trends & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Usage Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">System Usage Trends</h3>
          <div className="space-y-6">
            {usageTrends.map((trend, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{trend.label}</span>
                  <span className="text-sm font-bold text-gray-900">{trend.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${trend.color}`} 
                    style={{ width: `${trend.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">Appointment Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-md">
                  <Activity className="text-emerald-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Today</p>
                  <p className="text-xs text-emerald-600">Active appointments</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">124</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Clock className="text-blue-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upcoming</p>
                  <p className="text-xs text-blue-600">Next 7 days</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">487</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-md">
                  <CheckCircle2 className="text-gray-600 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completed</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">1,249</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Recent Appointments</h3>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-emerald-500 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 pl-6">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Type</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((apt, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-gray-900">{apt.patient}</td>
                  <td className="p-4 text-gray-600">{apt.doctor}</td>
                  <td className="p-4 text-gray-500 text-sm">{apt.date}</td>
                  <td className="p-4 text-gray-500 text-sm">{apt.time}</td>
                  <td className="p-4 text-gray-600">{apt.type}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
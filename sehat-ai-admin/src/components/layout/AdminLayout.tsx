import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCog, 
  Calendar, 
  BarChart, 
  Activity, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: UserCog, label: 'Doctors Management', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: BarChart, label: 'Reports & Analytics', path: '/admin/reports' },
    { icon: Activity, label: 'System Monitoring', path: '/admin/monitoring' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 rounded-lg p-2">
              <Activity className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Sehat AI</h1>
              <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
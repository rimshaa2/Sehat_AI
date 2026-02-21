import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { clsx } from 'clsx'; // Helper for conditional classes

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Stethoscope, label: 'Manage Doctors', path: '/doctors' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold text-primary border-b border-gray-700">
        Sehat AI <span className="text-xs text-gray-400">Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-white shadow-lg" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
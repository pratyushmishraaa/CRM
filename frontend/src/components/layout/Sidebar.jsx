import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, TrendingUp, Activity,
  Users, FileText, Bot, LogOut, Building2, Briefcase,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const nav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',      icon: UserCheck,        label: 'Leads' },
  { to: '/deals',      icon: TrendingUp,       label: 'Deals' },
  { to: '/contacts',   icon: Users,            label: 'Contacts' },
  { to: '/accounts',   icon: Building2,        label: 'Accounts' },
  { to: '/activities', icon: Activity,         label: 'Activities' },
  { to: '/ai',         icon: Bot,              label: 'AI Assistant' },
];

const adminNav = [
  { to: '/users', icon: Users,    label: 'Users' },
  { to: '/audit', icon: FileText, label: 'Audit Logs' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    toast.success('Signed out');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase size={14} className="text-white" />
          </div>
          <h1 className="text-base font-bold">SaaS CRM</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate pl-9">
          {user?.tenantId?.split('-')[0]}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={17} />{label}
          </NavLink>
        ))}

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 pt-4 pb-1">Admin</p>
            {adminNav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon size={17} />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full px-2 py-1 rounded hover:bg-gray-800 transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
}

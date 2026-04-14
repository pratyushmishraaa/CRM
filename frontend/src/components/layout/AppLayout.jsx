import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/leads':      'Leads',
  '/deals':      'Deals',
  '/contacts':   'Contacts',
  '/accounts':   'Accounts',
  '/activities': 'Activities',
  '/ai':         'AI Assistant',
  '/users':      'User Management',
  '/audit':      'Audit Logs',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'SaaS CRM';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <span className="text-xs text-gray-400 bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
            💻 Software CRM
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

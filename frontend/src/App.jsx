import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import axios from 'axios';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Deals from './pages/Deals';
import Activities from './pages/Activities';
import AIAssistant from './pages/AIAssistant';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Contacts from './pages/Contacts';
import Accounts from './pages/Accounts';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Guard({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * On every app load, if the user was previously logged in but the
 * accessToken is gone (page refresh), silently restore it via the
 * HTTP-only refresh token cookie.
 */
function TokenRestorer({ children }) {
  const { isAuthenticated, accessToken, setAccessToken, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      if (isAuthenticated && !accessToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          setAccessToken(data.data.accessToken);
        } catch {
          // Refresh token expired — force re-login
          logout();
        }
      }
      setReady(true);
    };
    restore();
  }, []);

  // Don't render routes until we've attempted token restore
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <TokenRestorer>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Guard><AppLayout /></Guard>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"  element={<Dashboard />} />
              <Route path="leads"      element={<Leads />} />
              <Route path="deals"      element={<Deals />} />
              <Route path="contacts"   element={<Contacts />} />
              <Route path="accounts"   element={<Accounts />} />
              <Route path="activities" element={<Activities />} />
              <Route path="ai"         element={<AIAssistant />} />
              <Route path="users"  element={<Guard roles={['admin', 'manager']}><Users /></Guard>} />
              <Route path="audit"  element={<Guard roles={['admin']}><AuditLogs /></Guard>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TokenRestorer>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: '14px' } }} />
    </QueryClientProvider>
  );
}

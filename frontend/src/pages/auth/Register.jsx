import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Briefcase, TrendingUp, Users, Zap, BarChart2, Shield } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  tenantName: z.string().min(2, 'Company name required'),
  firstName:  z.string().min(2, 'Required'),
  lastName:   z.string().min(2, 'Required'),
  email:      z.string().email('Invalid email'),
  password:   z.string().min(8, 'Min 8 characters'),
});

const FEATURES = [
  { icon: TrendingUp, text: 'Lead & deal pipeline management' },
  { icon: Users,      text: 'Team collaboration with RBAC' },
  { icon: Zap,        text: 'Free trial & MRR tracking' },
  { icon: BarChart2,  text: 'Revenue forecasting & analytics' },
  { icon: Shield,     text: 'Competitor intel & contract tracking' },
];

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome, ${user.firstName}! Your workspace is ready.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold">SaaS CRM</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Close more deals.<br />Grow faster.
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            The CRM built for software companies — track leads, manage deals, and forecast revenue.
          </p>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-400" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-xs">© 2025 SaaS CRM. Built for software teams.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
            <p className="text-gray-500 mt-1 text-sm">Start your free SaaS CRM in 30 seconds</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="label">Company Name</label>
                <input {...register('tenantName')} className="input" placeholder="Acme Software Inc" />
                {errors.tenantName && <p className="text-red-500 text-xs mt-1">{errors.tenantName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <input {...register('firstName')} className="input" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input {...register('lastName')} className="input" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Work Email</label>
                <input type="email" {...register('email')} className="input" placeholder="you@company.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <input type="password" {...register('password')} className="input" placeholder="Min 8 characters" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 mt-2">
                {loading ? 'Creating workspace...' : 'Create Free Workspace →'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

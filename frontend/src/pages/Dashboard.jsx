import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Activity, DollarSign, FlaskConical, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../lib/axios';
import StatCard from '../components/ui/StatCard';
import { fmt, LEAD_STAGES, DEAL_STAGES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => <div key={i} className="card animate-pulse h-28 bg-gray-100" />)}
        </div>
      </div>
    );
  }

  const { summary, software, charts, topLeads } = data || {};

  const revenueData = charts?.revenueByMonth?.map((m) => ({
    name: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
    revenue: m.revenue,
  })) || [];

  const leadData = charts?.leadsByStage?.map((s) => ({
    name: LEAD_STAGES.find((l) => l.value === s._id)?.label || s._id,
    value: s.count,
  })) || [];

  const dealData = charts?.dealsByStage?.map((s) => ({
    name: DEAL_STAGES.find((d) => d.value === s._id)?.label || s._id,
    value: s.count,
    amount: s.value,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Good {hour()}, {user?.firstName} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Your sales pipeline overview</p>
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads"    value={summary?.totalLeads ?? 0}        icon={Users}      color="blue"   sub={`+${summary?.newLeadsThisMonth ?? 0} this month`} />
        <StatCard title="Open Deals"     value={summary?.openDeals ?? 0}         icon={TrendingUp} color="purple" />
        <StatCard title="Revenue Won"    value={fmt(summary?.totalRevenue ?? 0)} icon={DollarSign} color="green"  />
        <StatCard title="Activities (7d)" value={summary?.activitiesThisWeek ?? 0} icon={Activity} color="orange" />
      </div>

      {/* SaaS metrics */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SaaS Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Free Trial Leads"    value={software?.trialLeads ?? 0}       icon={FlaskConical} color="blue"   sub="On active trial" />
          <StatCard title="Renewals This Month" value={software?.renewalDeals ?? 0}     icon={RefreshCw}    color="orange" sub="Up for renewal" />
          <StatCard title="Total MRR"           value={fmt(software?.totalMRR ?? 0)}    icon={DollarSign}   color="green"  sub="Monthly recurring" />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue — Last 6 Months</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty text="No revenue data yet" />}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Leads by Stage</h3>
          {leadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name.slice(0, 8)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {leadData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty text="No lead data yet" />}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Deal Pipeline by Stage</h3>
          {dealData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dealData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={85} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty text="No deal data yet" />}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Top AI-Scored Leads</h3>
          {topLeads?.length > 0 ? (
            <div className="space-y-3">
              {topLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-gray-400">{lead.company || '—'} · {lead.stage}</p>
                  </div>
                  <span className={`text-sm font-bold ${lead.aiScore >= 70 ? 'text-green-600' : lead.aiScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {lead.aiScore}/100
                  </span>
                </div>
              ))}
            </div>
          ) : <Empty text="No scored leads yet" />}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">{text}</div>;
}

function hour() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

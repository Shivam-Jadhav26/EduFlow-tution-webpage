import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Layers, ClipboardList, CreditCard, 
  MessageSquare, TrendingUp, UserPlus, FilePlus, 
  Send, AlertCircle, Calendar, ArrowUpRight,
  TrendingDown, MoreVertical, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

const COLORS = ['#0d9488', '#0891b2', '#2563eb', '#4f46e5', '#7c3aed'];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/admin');
        setData(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch admin dashboard:', err);
        setError('Failed to load dashboard data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-500 font-bold italic animate-pulse">Gathering institute insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-center max-w-lg mx-auto mt-20">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 mb-2 italic">Dashboard Unavailable</h2>
        <p className="text-slate-600 mb-6 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} className="font-bold">Try Again</Button>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Students', val: data.kpis.totalStudents.toString(), change: data.kpis.studentChange, up: data.kpis.studentChange?.startsWith('+'), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Unassigned Students', val: data.kpis.unassignedCount.toString(), change: 'Requires Action', up: false, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Batches', val: data.kpis.totalBatches.toString(), change: 'Stable', up: true, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Fees', val: data.kpis.pendingFees, change: data.kpis.feeChange, up: !data.kpis.feeChange?.startsWith('-'), icon: CreditCard, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Today Attendance', val: data.kpis.todayAttendance, change: data.kpis.attendanceChange, up: data.kpis.attendanceChange?.startsWith('+'), icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Institute Analytics</h1>
          <p className="text-slate-500 font-medium">Monitoring growth, engagement, and operational efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold border-slate-200" onClick={() => navigate('/admin/attendance')}>
            <Calendar size={18} /> Schedule
          </Button>
          <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/admin/students')}>
            <UserPlus size={18} /> Add Student
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl", kpi.bg, kpi.color)}>
                  <kpi.icon size={24} />
                </div>
                {kpi.change && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-bold",
                    kpi.up ? "text-emerald-600" : "text-amber-500"
                  )}>
                    {kpi.up ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
                    {kpi.change}
                  </div>
                )}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{kpi.val}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollments Chart */}
        <Card className="lg:col-span-2" title="New Enrollments" description="Daily student registrations for the current period">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Pie */}
        <Card title="Class Distribution" description="Students count by grade">
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.classDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.classDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{data.kpis.totalStudents}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {data.classDistribution.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="text-slate-900">{item.value} stds</span>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Recently Registered Students */}
        <Card className="lg:col-span-1" title="Recently Registered" description="Latest students joining EduFlow">
          <div className="space-y-4 pt-2">
            {(data.recentlyRegistered || []).map((student: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase cursor-default">
                    {student.name.substring(0,2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 italic line-clamp-1">{student.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Class {student.class}</p>
                  </div>
                </div>
                <Badge variant={student.batch ? 'success' : 'warning'} className="text-[9px] uppercase px-2 shrink-0">
                  {student.batch ? 'Assigned' : 'Unassigned'}
                </Badge>
              </div>
            ))}
            {!data.recentlyRegistered?.length && (
               <p className="text-center text-sm font-medium text-slate-400 py-6 italic">No recent registrations.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Doubts (Pending Verification) */}
        <Card className="lg:col-span-1" title="Unresolved Doubts" description="Latest student queries awaiting reply">
          <div className="space-y-4">
            {(data.unresolvedDoubts || []).map((doubt: any, i: number) => (
              <div key={i} onClick={() => navigate('/admin/doubts')} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-slate-900 italic">{doubt.student}</h4>
                  <span className="text-[10px] font-medium text-slate-400">{doubt.time}</span>
                </div>
                <p className="text-xs text-slate-600 italic mb-3 line-clamp-1">"{doubt.query}"</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[9px] uppercase">{doubt.subject}</Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-primary px-0 group-hover:scale-105 transition-transform">Reply Now</Button>
                </div>
              </div>
            ))}
            {!data.unresolvedDoubts?.length && (
              <p className="text-center py-10 text-slate-400 font-bold italic text-sm">All doubts resolved! 🎉</p>
            )}
          </div>
        </Card>

        {/* Revenue/Collection Chart */}
        <Card className="lg:col-span-2" title="Fee Collections" description="Monthly revenue tracking">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.feeCollections}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card title="Quick Actions" description="Fast-track daily operational tasks">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/tests')} className="flex flex-col h-auto py-6 gap-3 rounded-2xl border-dashed border-2 hover:border-primary hover:bg-primary/5 group">
            <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:scale-110 transition-transform"><FilePlus size={24} /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 italic">Create Test</p>
              <p className="text-[10px] text-slate-500 font-medium">MCQ/Subjective</p>
            </div>
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/notifications')} className="flex flex-col h-auto py-6 gap-3 rounded-2xl border-dashed border-2 hover:border-blue-600 hover:bg-blue-50 group">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><Send size={24} /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 italic">Send Alerts</p>
              <p className="text-[10px] text-slate-500 font-medium">SMS/WhatsApp</p>
            </div>
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/attendance')} className="flex flex-col h-auto py-6 gap-3 rounded-2xl border-dashed border-2 hover:border-amber-600 hover:bg-amber-50 group">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600 group-hover:scale-110 transition-transform"><AlertCircle size={24} /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 italic">Mark Attendance</p>
              <p className="text-[10px] text-slate-500 font-medium">All Batches</p>
            </div>
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/batches')} className="flex flex-col h-auto py-6 gap-3 rounded-2xl border-dashed border-2 hover:border-indigo-600 hover:bg-indigo-50 group">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:scale-110 transition-transform"><Layers size={24} /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 italic">Batch Report</p>
              <p className="text-[10px] text-slate-500 font-medium">Performance Insights</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};

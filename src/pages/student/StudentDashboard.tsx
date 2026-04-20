import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, Clock, Calendar, CheckCircle2, 
  TrendingUp, Play, FileText, ChevronRight, Award,
  MessageSquare, ClipboardList, BrainCircuit, AlertCircle, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/student');
        setData(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold italic animate-pulse">Analyzing your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-center max-w-lg mx-auto mt-20">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 mb-2 italic">Oops! Something went wrong</h2>
        <p className="text-slate-600 mb-6 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} className="font-bold">Try Refreshing</Button>
      </div>
    );
  }

  const isUnassigned = !user?.batch || user?.batch === 'Unassigned Batch' || (typeof user?.batch === 'object' && user?.batch?.name === 'Unassigned Batch');

  if (isUnassigned) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-lg mx-auto px-4 mt-8">
        <div className="bg-orange-50 text-orange-500 p-6 rounded-[2rem] mb-2 shadow-inner border border-orange-100">
           <Lock size={64} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 italic uppercase">Access Restricted</h1>
        <p className="text-slate-600 font-medium text-lg leading-relaxed">
          You are not assigned to any batch yet. Please contact your administrator to complete your enrollment and unlock your dashboard materials.
        </p>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => window.location.reload()} size="lg" className="font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">Check Current Status</Button>
        </div>
      </div>
    );
  }

  const stats = data.stats || {};
  const kpis = [
    { label: 'Attendance', val: `${stats.attendancePct || 0}%`, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Score', val: `${stats.avgScore || 0}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Doubts', val: (stats.totalDoubts || 0).toString(), icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tests Taken', val: (stats.testsTaken || 0).toString().padStart(2, '0'), icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 font-medium">Here's what's happening with your studies today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-2 text-sm italic">Class {user?.class} • {user?.batch?.name || user?.batch}</Badge>
          <Button size="sm" onClick={() => navigate('/student/doubts')} className="gap-2 rounded-full font-bold">Ask AI Doubts <BrainCircuit size={16} /></Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((stat, i) => (
          <Card key={i} className="p-4 md:p-4">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <Card className="lg:col-span-2" title="Learning Progress" description="Your performance trend across monthly assessments">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.performanceData || []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card title="Smart Suggestions" description="AI insights based on your recent performance">
          <div className="space-y-4">
            {(data.recommendations || []).map((s: any, i: number) => (
              <div key={i} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex gap-4">
                  <div className={cn("p-2 rounded-lg shrink-0", 
                    s.type === 'High' ? 'bg-red-50 text-red-600' : 
                    s.type === 'Med' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  )}>
                    {s.type === 'High' ? <AlertCircle size={18} /> : s.type === 'Med' ? <BrainCircuit size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm italic">{s.title}</h4>
                      <Badge variant={s.type === 'High' ? 'error' : s.type === 'Med' ? 'warning' : 'success'} className="text-[10px] scale-90">{s.type}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
            {!data.recommendations?.length && (
              <p className="text-center py-8 text-slate-400 font-bold italic text-sm">No suggestions today. Keep studying!</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


        {/* Recent Performance Recap */}
        <Card className="lg:col-span-3" title="Quick Test History" description="Recent assessment outcomes">
           <div className="space-y-4 pt-2">
              {(data.recentResults || []).map((res: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 bg-slate-50/30 italic">
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{res.test || 'Test'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(res.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary leading-none mb-1">{res.score}</p>
                    <Badge variant={res.passed ? 'success' : 'error'} className="text-[8px] uppercase">
                      {res.passed ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>
              ))}
              {!data.recentResults?.length && (
                <p className="text-center py-8 text-slate-400 font-bold italic text-sm">No recent tests taken.</p>
              )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Upcoming Classes */}
        <Card title="Upcoming Classes" description="Next 24 hours schedule">
          <div className="space-y-4">
            {(data.upcomingClasses || []).map((cls: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 italic">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg"><Clock size={16} className="text-slate-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{cls.subject}</p>
                    <p className="text-xs text-slate-500 font-medium">{cls.teacher} • {cls.time}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{cls.type || 'Lecture'}</Badge>
              </div>
            ))}
            {!data.upcomingClasses?.length && (
              <p className="text-center py-8 text-slate-400 font-bold italic text-sm flex items-center justify-center h-full">No classes scheduled for today.</p>
            )}
          </div>
        </Card>

        {/* Subjects Attendance */}
        <Card title="Attendance Summary" description="Subject-wise percentage">
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendanceBySubject || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar 
                  dataKey="pct" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dynamic Task Tracking derived from Pending Tests/Alerts */}
        <Card title="Pending Obligations" description="Prioritized items for this week">
          <div className="space-y-4">
            {(data.tasks || []).map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-200 group-hover:border-primary"
                )}>
                  {t.done && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", t.done ? "text-slate-400 line-through" : "text-slate-700")}>{t.task}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.due === 'Done' ? 'Completed' : `Due: ${t.due}`}</p>
                </div>
              </div>
            ))}
            {!data.tasks?.length && (
              <p className="text-center py-8 text-slate-400 font-bold italic text-sm flex items-center justify-center h-full">You are all caught up! ✨</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

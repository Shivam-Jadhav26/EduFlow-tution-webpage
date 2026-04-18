import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, Clock, Calendar, CheckCircle2, 
  TrendingUp, Play, FileText, ChevronRight, Award,
  MessageSquare, ClipboardList, BrainCircuit, AlertCircle
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

export const StudentDashboard = () => {
  const { user } = useAuth();
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

  const kpis = [
    { label: 'Attendance', val: data.kpis.attendance, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Score', val: data.kpis.avgScore, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Doubts', val: data.kpis.totalDoubts.toString(), icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tests Taken', val: data.kpis.testsTaken.toString().padStart(2, '0'), icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 font-medium">Here's what's happening with your studies today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-2 text-sm italic">Class {user?.class} • {user?.batch}</Badge>
          <Button size="sm" className="gap-2 rounded-full font-bold">Ask AI Doubts <BrainCircuit size={16} /></Button>
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
              <AreaChart data={data.performanceTrend}>
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
                    {s.type === 'High' ? <BrainCircuit size={18} /> : s.type === 'Med' ? <CheckCircle2 size={18} /> : <Award size={18} />}
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
            <Button variant="outline" className="w-full text-xs font-bold border-primary/20 text-primary hover:bg-primary/5">View Full Analysis</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Continue Learning" description="Pick up where you left off in your enrolled subjects">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {(data.courses || []).map((course: any, i: number) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video cursor-pointer shadow-sm hover:shadow-xl transition-all">
                <img src={course.img || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400&h=200'} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
                  <Badge variant="secondary" className="w-fit mb-2 text-[10px] bg-white/20 text-white backdrop-blur-md border-white/30 italic">{course.subject}</Badge>
                  <h4 className="text-white font-black italic text-lg leading-tight mb-3">{course.title}</h4>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-white/70 font-bold uppercase">{course.progress}% Completed</span>
                    <div className="bg-white/20 p-1.5 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!data.courses?.length && (
              <div className="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black italic">No enrolled courses found.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Performance Recap */}
        <Card title="Quick Test History" description="Recent assessment outcomes">
           <div className="space-y-4 pt-2">
              {(data.recentTests || []).map((res: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 bg-slate-50/30 italic">
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{res.test}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{res.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary leading-none mb-1">{res.score}</p>
                    <Badge variant={res.score.split('/')[0] >= res.score.split('/')[1]/2 ? 'success' : 'error'} className="text-[8px] uppercase">
                      {res.score.split('/')[0] >= res.score.split('/')[1]/2 ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>
              ))}
              {!data.recentTests?.length && (
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
                <Badge variant="secondary" className="text-[10px]">{cls.type}</Badge>
              </div>
            ))}
            {!data.upcomingClasses?.length && (
              <p className="text-center py-8 text-slate-400 font-bold italic text-sm">No classes scheduled for today.</p>
            )}
            <Button variant="ghost" className="w-full text-xs font-bold text-slate-500">View Full Timetable</Button>
          </div>
        </Card>

        {/* Subjects Attendance */}
        <Card title="Attendance Summary" description="Subject-wise percentage">
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendanceBySubject}>
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

        {/* Recent Homework/Tasks (Simulated via Notifications/Context) */}
        <Card title="Tasks & Homework" description="Pending items for this week">
          <div className="space-y-4">
            {[
              { task: 'Science Lab Manual', due: 'Tomorrow', done: false },
              { task: 'History Notes (Ch-4)', due: '2 Days', done: false },
              { task: 'Math Practice Sets', due: 'Done', done: true },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-200 group-hover:border-primary"
                )}>
                  {t.done && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", t.done ? "text-slate-400 line-through" : "text-slate-700")}>{t.task}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.due === 'Done' ? 'Completed' : `Due ${t.due}`}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

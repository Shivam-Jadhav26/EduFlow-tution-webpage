import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, Users, BookOpen, Clock,
  Target, Zap, Award, ArrowUpRight,
  ArrowDownRight, Filter, Download
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const performanceTrends = [
  { month: 'Jan', math: 65, science: 72, english: 88 },
  { month: 'Feb', math: 70, science: 75, english: 85 },
  { month: 'Mar', math: 68, science: 80, english: 90 },
  { month: 'Apr', math: 85, science: 85, english: 82 },
  { month: 'May', math: 78, science: 92, english: 95 },
];

const batchPerformance = [
  { batch: 'Batch A', avg: 85, top: 98 },
  { batch: 'Batch B', avg: 72, top: 92 },
  { batch: 'Batch C', avg: 78, top: 88 },
  { batch: 'Batch D', avg: 65, top: 85 },
];

const dropOutRisk = [
  { name: 'Low Risk', value: 240 },
  { name: 'Medium Risk', value: 45 },
  { name: 'High Risk', value: 15 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const AdminAnalytics = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic uppercase">Advanced Analytics Dashboard</h1>
          <p className="text-slate-500 font-medium">Deep dive into academic performance and operational trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold rounded-xl border-slate-200">
            <Filter size={18} /> Filters
          </Button>
          <Button className="gap-2 font-bold rounded-xl shadow-lg shadow-primary/20">
            <Download size={18} /> Export Report
          </Button>
        </div>
      </div>

      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap size={24} />
            </div>
            <Badge variant="success" className="italic">+18.5% YoY</Badge>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Retention Rate</p>
          <h3 className="text-3xl font-black text-slate-900">94.2%</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-2 italic">Based on active enrollment cycles</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Target size={24} />
            </div>
            <Badge variant="primary" className="italic">On Track</Badge>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Average Test Score</p>
          <h3 className="text-3xl font-black text-slate-900">78.5<span className="text-lg text-slate-400">/100</span></h3>
          <p className="text-[10px] text-slate-400 font-medium mt-2 italic">Aggregated across all active batches</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Award size={24} />
            </div>
            <Badge variant="secondary" className="italic">Top 5%</Badge>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Student Engagement</p>
          <h3 className="text-3xl font-black text-slate-900">8.4<span className="text-lg text-slate-400">/10</span></h3>
          <p className="text-[10px] text-slate-400 font-medium mt-2 italic">Daily active platform usage metrics</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject-wise Performance Trends */}
        <Card className="lg:col-span-2" title="Subject Performance Trends" description="Monthly average scores across core subjects">
          <div className="h-[350px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends}>
                <defs>
                  <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorScience" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="math" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorMath)" name="Mathematics" />
                <Area type="monotone" dataKey="science" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScience)" name="Science" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dropout Risk Analysis */}
        <Card title="Student Health Score" description="Probability of dropout based on attendance & test frequency">
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dropOutRisk}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {dropOutRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {dropOutRisk.map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{item.value} stds</span>
                  <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${(item.value / 300) * 100}%`, backgroundColor: COLORS[i] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Batch-wise Performance Comparison */}
        <Card title="Batch Performance Benchmarking" description="Average vs Top scores recorded per batch">
          <div className="h-[300px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="avg" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Average Score" barSize={30} />
                <Bar dataKey="top" fill="#0d9488" radius={[4, 4, 0, 0]} name="Top Score" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Insight List */}
        <Card title="AI Powered Insights" description="Automated recommendations for institute growth">
          <div className="space-y-4 pt-2">
            {[
              { title: 'Focus on Geometry', desc: 'Batch B shows a 15% lower average in Geometry compared to others.', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Attendance Correlation', desc: 'Students with >95% attendance scored 22% higher in recent mock tests.', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Class 9 Enrollment Peak', desc: 'Predicting a 20% surge in Class 9 enrollments for next month cycle.', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Test Frequency Impact', desc: 'Batch A\'s improvement is attributed to bi-weekly testing frequency.', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((insight, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic transition-all hover:bg-white hover:shadow-md cursor-default">
                <div className={cn("p-3 rounded-xl shrink-0 h-fit", insight.bg, insight.color)}>
                  <insight.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">{insight.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

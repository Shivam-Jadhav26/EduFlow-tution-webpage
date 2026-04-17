import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  TrendingUp, Award, Target, Loader2,
  ChevronRight, BrainCircuit, History, BookOpen
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentResults = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results')
      .then(res => setResults(res.data.data.results || []))
      .catch(err => console.error('Failed to fetch results:', err))
      .finally(() => setLoading(false));
  }, []);

  const latest = results[0];
  const avgPct = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / results.length)
    : 0;

  const performanceTrend = results.slice().reverse().map((r, i) => ({
    test: r.testTitle || `Test ${i + 1}`,
    score: Math.round((r.score / r.totalMarks) * 100),
  }));

  // Subject-wise aggregation
  const bySubject: Record<string, { correct: number; wrong: number }> = {};
  results.forEach(r => {
    const sub = r.subject || 'General';
    if (!bySubject[sub]) bySubject[sub] = { correct: 0, wrong: 0 };
    bySubject[sub].correct += r.score;
    bySubject[sub].wrong += r.totalMarks - r.score;
  });
  const subjectAnalysisData = Object.entries(bySubject).map(([subject, v]) => ({ subject, ...v }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="font-black italic text-slate-400">Loading Performance Data...</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 p-8">
        <div className="p-6 bg-slate-100 rounded-3xl text-slate-300"><BookOpen size={48} /></div>
        <h2 className="text-2xl font-black italic text-slate-900">No Results Yet</h2>
        <p className="text-slate-400 font-medium italic max-w-sm">You haven't taken any tests yet. Complete a test to see your performance analytics here.</p>
      </div>
    );
  }

  const latestPct = latest ? Math.round((latest.score / latest.totalMarks) * 100) : 0;
  const scoreOffset = Math.round(440 - (latestPct / 100) * 440);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Academic Performance</h1>
          <p className="text-slate-500 font-medium italic">Detailed analysis of your test scores and learning growth.</p>
        </div>
        <Button className="gap-2 font-bold rounded-xl italic shadow-lg shadow-primary/20 h-12 px-6">
          <History size={18} /> Full History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Test Result */}
        <Card className="lg:col-span-1 shadow-xl border-white" title="Latest Performance" description={`Result for ${latest?.testTitle || 'Latest Test'}`}>
          <div className="flex flex-col items-center text-center py-4">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                  className={latestPct >= 80 ? "text-emerald-500" : latestPct >= 60 ? "text-amber-500" : "text-red-500"}
                  strokeDasharray="440" strokeDashoffset={scoreOffset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={cn("text-4xl font-black italic", latestPct >= 80 ? "text-emerald-600" : latestPct >= 60 ? "text-amber-600" : "text-red-600")}>
                  {latestPct}%
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy</p>
              </div>
            </div>
            <p className="text-base font-black text-slate-900 italic mb-3">{latest?.testTitle || 'Latest Test'}</p>
            <Badge variant={latestPct >= 80 ? 'success' : latestPct >= 60 ? 'warning' : 'error'} className="italic font-black px-4 py-1 text-sm">
              {latestPct >= 80 ? 'Excellent!' : latestPct >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
            <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-center">
              <div><p className="text-xl font-black text-slate-900">{latest?.score}</p><p className="text-[10px] font-bold uppercase text-slate-400 italic">Scored</p></div>
              <div><p className="text-xl font-black text-slate-900">{latest?.totalMarks}</p><p className="text-[10px] font-bold uppercase text-slate-400 italic">Total</p></div>
            </div>
          </div>
        </Card>

        {/* Growth Chart */}
        <Card className="lg:col-span-2 shadow-xl shadow-slate-200/50 border-slate-50" title="Performance Trend" description="Score consistency over recent assessments">
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="test" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#0d9488' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0d9488"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject-wise breakdown */}
        <Card title="Subject Analysis" description="Score distribution across subjects" className="shadow-xl border-slate-50 shadow-slate-200/50">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="correct" name="Correct Marks" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="wrong" name="Wrong Marks" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stats summary */}
        <Card title="Performance Summary" description="Overall statistics from all tests" className="shadow-xl border-slate-50 shadow-slate-200/50">
          <div className="space-y-6">
            {[
              { label: 'Tests Completed', value: results.length, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Average Accuracy', value: `${avgPct}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Best Score', value: `${Math.round(Math.max(...results.map(r => (r.score / r.totalMarks) * 100)))}%`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'AI Insight', value: avgPct >= 80 ? 'Excellent Performer' : 'Keep Improving', icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 pb-5 border-b border-slate-50 last:border-0">
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}><stat.icon size={20} /></div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{stat.label}</p>
                  <p className="text-lg font-black text-slate-900 italic">{stat.value}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  AlertCircle, Download, MoreVertical, Star, Loader2, Database
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

const COLORS = ['#0d9488', '#10b981', '#f59e0b', '#ef4444']; // A+, A, B, C

export const AdminResults = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/results/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportPDF = () => {
    window.print(); // Natively simple report trick for admins
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 size={40} className="animate-spin text-primary" /></div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 bg-red-50/50 rounded-3xl border border-red-100">
        <Database size={48} className="text-red-400" />
        <h2 className="text-xl font-black italic text-red-900">Data Synchronization Error</h2>
        <p className="text-red-500 font-medium italic text-center max-w-md">Failed to compile metrics. Please restart the backend Terminal to trigger the custom Endpoint route!</p>
        <Button className="mt-4 shadow-lg shadow-black/5" onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  const { average, passingRate, criticalCount, topScorer, pieData, classPerformance, recentTabulations } = data;

  const formattedPieData = [
    { name: 'A+ (90-100)', value: pieData[0] },
    { name: 'A (75-89)', value: pieData[1] },
    { name: 'B (60-74)', value: pieData[2] },
    { name: 'C (< 60)', value: pieData[3] },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Academic Performance Insights</h1>
          <p className="text-slate-500 font-medium italic">Comprehensive analysis of student results across batches and subjects.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl h-12 px-6" onClick={exportPDF}>
            <Download size={18} /> Print Reports
          </Button>
          <Button className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Star size={18} fill="currentColor" /> Rank Generator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Institute Average', value: `${average}%`, up: average >= 75 },
          { label: 'Top Scorer', value: topScorer?.name || 'N/A', sub: topScorer ? `Class ${topScorer.class} - ${topScorer.pct}%` : 'No attempts' },
          { label: 'Passing Rate', value: `${passingRate}%`, grow: passingRate > 0 ? '+ Active' : '', up: passingRate >= 50 },
          { label: 'Critical Threshold', value: `${criticalCount} Students`, sub: 'Below 40% aggregate' },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col justify-center border-slate-100 shadow-sm hover:border-primary/20 transition-all">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic">{stat.label}</p>
             <p className="text-2xl font-black text-slate-900 leading-none mb-1 truncate">{stat.value}</p>
             {stat.grow && (
               <div className={cn("text-[10px] font-bold italic", stat.up ? "text-emerald-600" : "text-red-500")}>
                  {stat.grow}
               </div>
             )}
             {stat.sub && (
               <p className="text-[10px] font-medium text-slate-500 italic mt-1">{stat.sub}</p>
             )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-100 shadow-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 italic tracking-tight">Grade Distribution</h3>
              <p className="text-xs font-bold text-slate-400 italic">Across all active batches this semester</p>
            </div>
            <MoreVertical size={20} className="text-slate-300" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="avg" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-slate-100 shadow-slate-100">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 italic tracking-tight">Aggregates</h3>
              <Badge variant="outline" className="italic">Live Data</Badge>
           </div>
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {formattedPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-2xl font-black text-slate-900 leading-none">{passingRate}%</p>
                 <p className="text-[8px] font-black text-slate-400 uppercase italic">Passed</p>
              </div>
           </div>
           <div className="space-y-3 mt-4">
              {formattedPieData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[10px] font-black text-slate-500 italic uppercase">{entry.name}</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-900">{entry.value}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <Card title="Recent Tabulations" description="Manually verify recent test score uploads and student rankings" className="border-slate-100 shadow-slate-100">
         <div className="overflow-x-auto mt-6">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Student Name</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Batch</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Subject</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Score</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Trend</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {recentTabulations.map((res: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="py-4 px-4 font-black text-slate-900 italic text-sm">{res.studentId?.name || 'Unknown'}</td>
                       <td className="py-4 px-4 font-bold text-slate-500 italic text-xs">{res.batchId?.name || 'Class ' + res.studentId?.class}</td>
                       <td className="py-4 px-4 font-bold text-slate-400 italic text-[10px] uppercase tracking-widest">{res.subject || 'N/A'}</td>
                       <td className="py-4 px-4">
                          <Badge variant={res.marks >= 75 ? 'success' : res.marks >= 40 ? 'warning' : 'error'} className="italic">
                             {res.marks}%
                          </Badge>
                       </td>
                       <td className="py-4 px-4">
                          <div className={cn("p-1.5 rounded-lg w-fit transition-transform group-hover:scale-110", res.marks >= 50 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                             <AlertCircle size={14} className={res.marks >= 50 ? "rotate-180" : ""} />
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};

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
        <Card className="lg:col-span-2 border-slate-100 shadow-sm" title="Class-wise Performance" description="Comparative analysis of average, top, and lowest scores per standard">
          <div className="h-[350px] w-full pt-4">
            {classPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="class" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                  <Bar dataKey="top" name="Highest" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="avg" name="Average" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="low" name="Lowest" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-2xl">
                 No test attempts found to plot standard metrics.
               </div>
            )}
          </div>
        </Card>

        <Card title="Grade Distribution" description="Current student population by grade scale" className="border-slate-100 shadow-sm">
           <div className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0,1,2,3].map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           
           <div className="space-y-3 pt-6 border-t border-slate-50 mt-4">
              {[
                { label: 'A+ Grade', count: pieData[0], color: 'bg-teal-600' },
                { label: 'A Grade', count: pieData[1], color: 'bg-emerald-500' },
                { label: 'B Grade', count: pieData[2], color: 'bg-amber-500' },
                { label: 'C Grade', count: pieData[3], color: 'bg-red-500' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center italic">
                   <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                   </div>
                   <span className="text-xs font-black text-slate-900">{item.count}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <Card title="Recent Performance Tabulations" description="Student-wise drill down for the latest evaluation cycles" className="border-slate-100 shadow-sm">
         <div className="overflow-x-auto mt-6">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Student Name</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Batch</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Assessment Subject</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4 text-center">Score Result</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {recentTabulations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 italic">No grading records found in database.</td>
                    </tr>
                  )}
                  {recentTabulations.map((row: any) => (
                    <tr key={row._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-4 text-sm font-black text-slate-900 italic">{row.name}</td>
                       <td className="py-4 px-4 text-xs font-bold text-slate-500 italic"><Badge>{row.batch}</Badge></td>
                       <td className="py-4 px-4 text-sm font-black text-slate-700 italic">{row.subject}</td>
                       <td className={cn("py-4 px-4 text-sm font-black italic text-center", row.pct >= 40 ? 'text-emerald-600' : 'text-red-500')}>
                          {row.pct}%
                       </td>
                       <td className="py-4 px-4">
                          <button className="p-2 h-auto text-slate-300 hover:text-primary transition-all">
                             <MoreVertical size={18} />
                          </button>
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

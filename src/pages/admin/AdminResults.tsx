import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, Award, Target, AlertCircle, 
  ChevronRight, BrainCircuit, History,
  Search, Filter, Download, MoreVertical, Star
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const classPerformance = [
  { class: '10th', avg: 74, top: 98, low: 42 },
  { class: '9th', avg: 82, top: 96, low: 58 },
  { class: '8th', avg: 68, top: 92, low: 38 },
  { class: '7th', avg: 85, top: 99, low: 62 },
];

const COLORS = ['#0d9488', '#10b981', '#f59e0b', '#ef4444'];

export const AdminResults = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Academic Performance Insights</h1>
          <p className="text-slate-500 font-medium italic">Comprehensive analysis of student results across batches and subjects.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Download size={18} /> Detailed Reports
          </Button>
          <Button className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Star size={18} fill="currentColor" /> Rank Generator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Institute Average', value: '78.4%', grow: '+2.1%', up: true },
          { label: 'Top Scorer', value: 'Rahul Sharma', sub: 'Class 10th - 98%' },
          { label: 'Passing Rate', value: '94.2%', grow: '+0.5%', up: true },
          { label: 'Critical Threshold', value: '18 Students', sub: 'Below 40% marks' },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic">{stat.label}</p>
             <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
             {stat.grow && (
               <div className={cn("text-[10px] font-bold italic", stat.up ? "text-emerald-600" : "text-red-500")}>
                  {stat.grow} from last term
               </div>
             )}
             {stat.sub && (
               <p className="text-[10px] font-medium text-slate-500 italic">{stat.sub}</p>
             )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Class-wise Performance" description="Comparative analysis of average, top, and lowest scores per standard">
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="class" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="top" name="Highest" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="avg" name="Average" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="low" name="Lowest" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Grade Distribution" description="Current student population by grade scale">
           <div className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'A+ (90-100)', value: 45 },
                      { name: 'A (75-90)', value: 120 },
                      { name: 'B (60-75)', value: 85 },
                      { name: 'C (< 60)', value: 30 },
                    ]}
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-3 pt-4 border-t border-slate-50 mt-4">
              {[
                { label: 'A+ Grade', count: 45, color: 'bg-teal-600' },
                { label: 'A Grade', count: 120, color: 'bg-emerald-500' },
                { label: 'B Grade', count: 85, color: 'bg-amber-500' },
                { label: 'C Grade', count: 30, color: 'bg-red-500' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center italic">
                   <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                   </div>
                   <span className="text-xs font-black text-slate-900">{item.count}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <Card title="Recent Performance Tabulations" description="Student-wise drill down for the latest evaluation cycles">
         <div className="overflow-x-auto mt-6">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Student Name</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Batch</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4 text-center">Algebra (%)</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4 text-center">Physics (%)</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4 text-center">Total Avg</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Status</th>
                  </tr>
               </thead>
               <tbody>
                  {[
                    { name: 'Rahul Sharma', batch: 'Morning Elite', alg: 98, phy: 92, avg: 95, color: 'text-emerald-600' },
                    { name: 'Aditi Khanna', batch: 'Morning Elite', alg: 84, phy: 78, avg: 81, color: 'text-slate-900' },
                    { name: 'Kabir Vats', batch: 'Board Booster', alg: 42, phy: 38, avg: 40, color: 'text-red-600' },
                    { name: 'Sanya Gupta', batch: 'Weekend Foundation', alg: 72, phy: 88, avg: 80, color: 'text-slate-900' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-4 text-sm font-black text-slate-900 italic">{row.name}</td>
                       <td className="py-4 px-4 text-xs font-bold text-slate-500 italic">{row.batch}</td>
                       <td className="py-4 px-4 text-sm font-black text-slate-700 italic text-center">{row.alg}%</td>
                       <td className="py-4 px-4 text-sm font-black text-slate-700 italic text-center">{row.phy}%</td>
                       <td className={cn("py-4 px-4 text-sm font-black italic text-center", row.color)}>{row.avg}%</td>
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

import { motion } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Clock, Search, 
  Filter, Download, Calendar, ArrowUpRight, 
  MoreVertical, ShieldAlert
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const mockDailySummary = [
  { batch: 'Morning Elite', present: 42, absent: 3, late: 0, class: '10th' },
  { batch: 'Evening Scholars', present: 32, absent: 5, late: 1, class: '9th' },
  { batch: 'Weekend Foundation', present: 18, absent: 4, late: 0, class: '8th' },
  { batch: 'Board Booster', present: 48, absent: 2, late: 0, class: '10th' },
];

const lowAttendanceStudents = [
  { id: '1', name: 'Kabir Vats', class: '10th', rate: '68%', status: 'Critical', bg: 'bg-red-50 text-red-600' },
  { id: '2', name: 'Ishita Roy', class: '9th', rate: '72%', status: 'Warning', bg: 'bg-amber-50 text-amber-600' },
];

export const AdminAttendance = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Attendance Audit</h1>
          <p className="text-slate-500 font-medium italic">Monitor real-time student presence and generate compliance reports.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Download size={18} /> Export CSV
          </Button>
          <Button className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Calendar size={18} /> Daily Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Today Presence', value: '88%', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Unexcused Absences', value: '14', icon: ShieldAlert, color: 'text-red-500' },
          { label: 'Late Joiners', value: '03', icon: Clock, color: 'text-amber-600' },
          { label: 'Pending Audit', value: '02 Batches', icon: Filter, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col items-center text-center py-6">
             <div className={cn("p-3 rounded-2xl bg-slate-50 mb-4", stat.color)}>
                <stat.icon size={28} />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{stat.label}</p>
             <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card title="Today's Batch Attendance" description="Overview of student presence across all active sessions">
              <div className="space-y-6 mt-6">
                 {mockDailySummary.map((batch, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white italic font-black text-lg">
                           {batch.class.substring(0,2)}
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors">{batch.batch}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest">Schedule: Active</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                         <div className="text-center">
                            <p className="text-sm font-black text-emerald-600 italic leading-none mb-1">{batch.present}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Present</p>
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-black text-red-500 italic leading-none mb-1">{batch.absent}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
                         </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-sm font-black text-amber-500 italic leading-none mb-1">{batch.late}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Late</p>
                         </div>
                         <Button variant="ghost" className="p-2 h-auto text-slate-300 hover:text-primary transition-all">
                            <ArrowUpRight size={20} />
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="space-y-8">
           <Card title="Attendance Alerts" description="Students falling below 75% threshold">
              <div className="space-y-4">
                 {lowAttendanceStudents.map((stu) => (
                   <div key={stu.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200" />
                        <div>
                           <p className="text-sm font-black text-slate-900 italic leading-tight">{stu.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 italic">Class: {stu.class}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <Badge variant={stu.status === 'Critical' ? 'error' : 'warning'} className="italic mb-1">{stu.rate}</Badge>
                         <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter italic">Notify Parent</p>
                      </div>
                   </div>
                 ))}
                 <Button className="w-full h-12 rounded-xl font-black italic bg-red-500 hover:bg-red-600 mt-4">Send Collective Alerts</Button>
              </div>
           </Card>

           <Card title="Monthly Trends" className="bg-slate-900 border-none text-white">
              <div className="space-y-4 italic">
                 <p className="text-sm font-medium text-slate-400 italic">"Average attendance is up by <span className="text-emerald-400 font-black">4.2%</span> compared to last month."</p>
                 <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>Physical</span>
                       <span>84%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[84%]" />
                    </div>
                 </div>
                 <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>Test Days</span>
                       <span>96%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[96%]" />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

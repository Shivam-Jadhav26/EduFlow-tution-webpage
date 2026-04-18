import { motion } from 'motion/react';
import { Clock, Calendar, MapPin, User, Plus, Edit2, Filter, MoreVertical, RefreshCw } from 'lucide-react';
import { timetable as studentTimetable } from '../../data/mockData';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const fullTimetable = [
  ...studentTimetable,
  { id: 't7', day: 'Monday', time: '02:00 PM - 03:30 PM', subject: 'Biology', teacher: 'Dr. Shah', batchId: 'b2' },
  { id: 't8', day: 'Tuesday', time: '11:00 AM - 12:30 PM', subject: 'Hindi', teacher: 'Mrs. Saxena', batchId: 'b3' },
  { id: 't9', day: 'Wednesday', time: '04:00 PM - 05:30 PM', subject: 'Chemistry', teacher: 'Prof. Roy', batchId: 'b2' },
];

export const AdminTimetable = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Faculty Scheduling</h1>
          <p className="text-slate-500 font-medium italic">Coordinate class timings, faculty availability, and room assignments.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl px-6">
            <RefreshCw size={18} /> Conflict Audit
          </Button>
          <Button className="gap-2 font-black italic rounded-xl px-6">
            <Plus size={18} /> Schedule Class
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
           {['All Batches', '10th Morning', '9th Evening', '8th Weekend'].map((opt, i) => (
             <button key={i} className={cn(
               "px-4 py-2 text-xs font-black italic rounded-lg transition-all",
               i === 0 ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
             )}>{opt}</button>
           ))}
        </div>
        <div className="ml-auto flex gap-4">
           <Badge variant="outline" className="italic font-bold flex items-center gap-2">
             <Calendar size={12} fill="currentColor" /> 16 - 22 May, 2024
           </Badge>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                 <th className="py-6 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timing Slot</th>
                 {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                   <th key={day} className="py-6 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 border-l border-slate-100/50">{day}</th>
                 ))}
              </tr>
            </thead>
            <tbody>
              {[
                '09:00 AM - 10:30 AM',
                '11:00 AM - 12:30 PM',
                '01:00 PM - 02:30 PM',
                '04:00 PM - 05:30 PM',
                '06:00 PM - 07:30 PM',
              ].map((slot, sIdx) => (
                <tr key={sIdx}>
                  <td className="py-8 px-6 text-xs font-black text-slate-900 italic border-b border-slate-50">
                     <span className="flex items-center gap-2 italic uppercase">
                        <Clock size={12} className="text-primary" /> {slot.split(' - ')[0]}
                     </span>
                  </td>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const lessons = fullTimetable.filter(t => t.day === day && (t.time.includes(slot.split(' - ')[0]) || slot.includes(t.time.split(' - ')[0])));
                    
                    return (
                      <td key={day} className="p-2 border-b border-slate-50 border-l border-slate-100/30">
                        <div className="space-y-2">
                          {lessons.map(lesson => (
                            <div key={lesson.id} className="group p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-lg hover:shadow-primary/5 transition-all text-left">
                               <div className="flex justify-between items-start mb-1">
                                  <Badge className="text-[8px] h-fit px-1.5 py-0 italic">{lesson.subject}</Badge>
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={12} /></button>
                               </div>
                               <p className="text-[10px] font-black italic text-slate-900 leading-tight">{lesson.teacher}</p>
                               <div className="flex items-center justify-between mt-2">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider italic">Room 102</p>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                               </div>
                            </div>
                          ))}
                          {lessons.length === 0 && (
                            <button className="w-full py-4 border-2 border-dashed border-slate-50 rounded-2xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 hover:bg-slate-50 transition-all text-slate-300">
                               <Plus size={16} />
                               <span className="text-[8px] font-black uppercase tracking-widest mt-1">Free</span>
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

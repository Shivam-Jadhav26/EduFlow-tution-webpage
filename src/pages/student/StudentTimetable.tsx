import { motion } from 'motion/react';
import { Clock, Calendar, MapPin, User, ArrowRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { timetable } from '../../data/mockData';
import { cn } from '../../utils/cn';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StudentTimetable = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Weekly Timetable</h1>
          <p className="text-slate-500 font-medium italic">Your personalized schedule for the current academic session.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button className="px-4 py-2 text-xs font-black italic rounded-lg bg-white shadow-sm text-primary transition-all">Today</button>
          <button className="px-4 py-2 text-xs font-black italic rounded-lg text-slate-500 hover:text-slate-700 transition-all">This Week</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {days.map((day) => {
          const classes = timetable.filter(item => item.day === day);
          const isToday = day === new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

          return (
            <div key={day} className="space-y-4">
              <div className={cn(
                "p-3 rounded-xl text-center border transition-all",
                isToday ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-900"
              )}>
                <p className="text-xs font-black italic uppercase tracking-widest">{day.substring(0, 3)}</p>
              </div>

              <div className="space-y-3">
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <motion.div
                      key={cls.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter italic">{cls.subject}</span>
                        <h4 className="text-sm font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors">{cls.time.split(' - ')[0]}</h4>
                        
                        <div className="space-y-1.5 mt-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
                            <User size={12} />
                            <span>{cls.teacher}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
                            <MapPin size={12} />
                            <span>Room 102</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">No Classes</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Card title="Quick Resources" className="bg-slate-900 border-none text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Syllabus Copy', sub: 'PDF - 2.4 MB' },
            { label: 'Batch Guidelines', sub: 'PDF - 1.1 MB' },
            { label: 'Faculty Directory', sub: 'Instant View' },
            { label: 'Holiday List', sub: 'Current Year' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
              <div>
                <p className="text-sm font-black italic group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
              </div>
              <ArrowRight size={16} className="text-slate-500 group-hover:text-primary transition-transform group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, MapPin, User, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { TimetableEntry } from '../../types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StudentTimetable = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'week'>('week');

  const currentDayStr = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/timetable');
        if (data.success) {
          setTimetable(data.data.timetable);
        } else {
          setError(data.message || 'Failed to fetch timetable');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching timetable');
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const daysToShow = viewMode === 'today' ? (days.includes(currentDayStr) ? [currentDayStr] : days) : days;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-col h-full min-h-[400px] text-red-500">
        <p className="font-bold italic">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100/50 rounded-lg text-sm group transition-all hover:bg-red-100">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Weekly Timetable</h1>
          <p className="text-slate-500 font-medium italic">Your personalized schedule for the current academic session.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('today')}
            className={cn(
                "px-4 py-2 text-xs font-black italic rounded-lg transition-all",
                viewMode === 'today' ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Today
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={cn(
                "px-4 py-2 text-xs font-black italic rounded-lg transition-all",
                viewMode === 'week' ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            This Week
          </button>
        </div>
      </div>

      <div className={cn(
        "grid gap-4",
        viewMode === 'week' ? "grid-cols-1 lg:grid-cols-6" : "grid-cols-1 max-w-md"
      )}>
        {daysToShow.map((day) => {
          const classes = timetable.filter(item => item.day === day);
          const isToday = day === currentDayStr;

          return (
            <div key={day} className="space-y-4">
              <div className={cn(
                "p-3 rounded-xl text-center border transition-all",
                isToday && viewMode === 'week' ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-900",
                viewMode === 'today' ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : ""
              )}>
                <p className="text-xs font-black italic uppercase tracking-widest">{day.substring(0, 3)}</p>
              </div>

              <div className="space-y-3">
                {classes.length > 0 ? (
                  classes.map((cls: any) => (
                    <motion.div
                      key={cls._id || cls.id}
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
                            <span>{cls.room || 'Room 102'}</span>
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


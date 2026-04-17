import { useState, useEffect } from 'react';
import { Clock, Calendar, Plus, Edit2, Trash2, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

const TIME_SLOTS = [
  '09:00 AM - 10:30 AM',
  '11:00 AM - 12:30 PM',
  '01:00 PM - 02:30 PM',
  '04:00 PM - 05:30 PM',
  '06:00 PM - 07:30 PM',
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AdminTimetable = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  const [selectedTimeScope, setSelectedTimeScope] = useState<string>('This Week');
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: TIME_SLOTS[0],
    subject: '',
    teacher: '',
    room: '',
    batchId: '',
    type: 'class'
  });

  useEffect(() => {
    api.get('/batches').then(res => setBatches(res.data.data.batches || [])).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const res = await api.get('/timetable', { params: selectedBatchFilter !== 'all' ? { batchId: selectedBatchFilter } : {} });
        setTimetable(res.data.data.timetable || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedBatchFilter, refetchTrigger]);

  const openForm = (entry?: any, preload?: {day: string, time: string}) => {
    if (entry) {
      setSelectedEntry(entry);
      setFormData({
        day: entry.day,
        time: entry.time,
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room || '',
        batchId: entry.batchId?._id || entry.batchId || '',
        type: entry.type || 'class'
      });
    } else {
      setSelectedEntry(null);
      setFormData({
        day: preload?.day || 'Monday',
        time: preload?.time || TIME_SLOTS[0],
        subject: '',
        teacher: '',
        room: '',
        batchId: batches.length > 0 && selectedBatchFilter && selectedBatchFilter !== 'all' ? selectedBatchFilter : '',
        type: 'class'
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      if (selectedEntry) {
        await api.put(`/timetable/${selectedEntry._id}`, formData);
      } else {
        await api.post('/timetable', formData);
      }
      setShowModal(false);
      setRefetchTrigger(prev => prev + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save timetable entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this class from the schedule?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      setRefetchTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Timetable Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic text-slate-900">{selectedEntry ? 'Edit Scheduled Class' : 'Schedule New Class'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Entry Type</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 font-bold" 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="class">Regular Class</option>
                    <option value="exam">Exam Section</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Subject Topic</label>
                <input 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Advanced Calculus" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Day</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}
                  >
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Time Slot</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                  >
                    {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Teacher / Instructor</label>
                <input 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} placeholder="Teacher Name" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Batch Assigned</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})}
                  >
                    <option value="" disabled>Select Target Batch</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Room / Class Link</label>
                  <input 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="Room 101 or Meet Link" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-xl font-bold italic" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl font-black italic shadow-lg shadow-primary/20" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Class'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Faculty Scheduling</h1>
          <p className="text-slate-500 font-medium italic">Coordinate class timings, faculty availability, and room assignments.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl px-6" onClick={() => setRefetchTrigger(prev => prev + 1)}>
            <RefreshCw size={18} /> Audit Sync
          </Button>
          <Button className="gap-2 font-black italic rounded-xl px-6" onClick={() => openForm()}>
            <Plus size={18} /> Schedule Class
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
           <button 
             onClick={() => setSelectedBatchFilter('all')}
             className={cn(
               "px-4 py-2 text-xs font-black italic rounded-lg transition-all",
               selectedBatchFilter === 'all' ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
             )}>All Batches</button>
           {batches.map((batch) => (
             <button 
               key={batch._id}
               onClick={() => setSelectedBatchFilter(batch._id)}
               className={cn(
                 "px-4 py-2 text-xs font-black italic rounded-lg transition-all",
                 selectedBatchFilter === batch._id ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
               )}>{batch.name}</button>
           ))}
        </div>
        <div className="ml-auto flex gap-4">
           <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
             <Calendar size={14} className="text-slate-400" />
             <select 
               className="bg-transparent border-none outline-none text-sm font-bold italic text-slate-700 cursor-pointer pr-2"
               value={selectedTimeScope}
               onChange={(e) => setSelectedTimeScope(e.target.value)}
             >
               <option value="This Day">This Day</option>
               <option value="This Week">This Week</option>
               <option value="This Month">This Month</option>
               <option value="This Year">This Year</option>
             </select>
           </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-slate-400 font-bold italic">Loading master timetable...</p>
            </div>
          ) : (
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                   <th className="py-6 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timing Slot</th>
                   {DAYS.map(day => (
                     <th key={day} className="py-6 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 border-l border-slate-100/50">{day}</th>
                   ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, sIdx) => (
                  <tr key={sIdx}>
                    <td className="py-8 px-6 text-xs font-black text-slate-900 italic border-b border-slate-50 relative bg-white z-10 w-44">
                       <span className="flex items-center gap-2 italic uppercase">
                          <Clock size={12} className="text-primary" /> {slot.split(' - ')[0]}
                       </span>
                    </td>
                    {DAYS.map(day => {
                      const lessons = timetable.filter(t => t.day === day && (t.time === slot || t.time.includes(slot.split(' - ')[0])));
                      
                      return (
                        <td key={day} className="p-2 border-b border-slate-50 border-l border-slate-100/30 align-top">
                          <div className="space-y-2 h-full">
                            {lessons.map(lesson => (
                              <div key={lesson._id} className={cn(
                                "group p-3 rounded-2xl border hover:shadow-lg transition-all text-left relative cursor-pointer",
                                lesson.type === 'exam' 
                                  ? "bg-red-50 border-red-100 hover:border-red-200 hover:bg-white hover:shadow-red-500/5" 
                                  : "bg-slate-50 border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-primary/5"
                              )} onClick={() => openForm(lesson)}>
                                 <div className="flex justify-between items-start mb-1">
                                    <Badge className={cn(
                                      "text-[8px] h-fit px-1.5 py-0 italic break-words whitespace-normal",
                                      lesson.type === 'exam' ? "border-red-200 text-red-600 bg-red-100" : "border-primary/20 text-primary bg-primary/5"
                                    )}>
                                      {lesson.type === 'exam' ? 'EXAM: ' : ''}{lesson.subject}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="text-red-500 hover:bg-red-50 p-1 rounded" onClick={(e) => handleDelete(lesson._id, e)}><Trash2 size={12} /></button>
                                    </div>
                                 </div>
                                 <p className="text-[10px] font-black italic text-slate-900 leading-tight pr-4">{lesson.teacher}</p>
                                 <div className="flex items-center justify-between mt-2">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider italic flex items-center gap-1">
                                        {lesson.room ? lesson.room : 'TBD'}
                                    </p>
                                    <div className="text-[8px] px-1 font-bold bg-slate-200 text-slate-500 rounded uppercase">{lesson.batchId?.name || 'All'}</div>
                                 </div>
                              </div>
                            ))}
                            {lessons.length === 0 && (
                              <button 
                                onClick={() => openForm(null, {day, time: slot})}
                                className="w-full h-full min-h-[80px] py-4 border-2 border-dashed border-transparent rounded-2xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-slate-300"
                              >
                                 <Plus size={16} />
                                 <span className="text-[8px] font-black uppercase tracking-widest mt-1">Schedule Here</span>
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
          )}
        </div>
      </div>
    </div>
  );
};

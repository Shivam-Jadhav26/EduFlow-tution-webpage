import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({length: 12}, (_, i) => (i + 1).toString());
const MINS = ['00', '15', '30', '45'];

const getOrdinal = (n: number) => {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
};

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData: any | null;
}

export const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    schedule: '',
    teacher: '',
    defaultFees: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState({ hour: '4', min: '00', period: 'Evening' });

  useEffect(() => {
    if (initialData) {
      const schedule = initialData.timing || initialData.schedule || '';
      setFormData({
        name: initialData.name || '',
        class: initialData.class || '',
        schedule: schedule,
        teacher: initialData.teacher || '',
        defaultFees: initialData.defaultFees || 0
      });

      // Parse schedule if it matches format "Day, Day | hh:mm Period"
      if (schedule && schedule.includes('|')) {
        const [daysPart, timePart] = schedule.split('|').map((s: string) => s.trim());
        setSelectedDays(daysPart.split(',').map((s: string) => s.trim()));
        
        const timeMatch = timePart.match(/(\d+):(\d+)\s+(Morning|Evening)/);
        if (timeMatch) {
          setSelectedTime({
            hour: parseInt(timeMatch[1]).toString(),
            min: timeMatch[2],
            period: timeMatch[3]
          });
        }
      } else {
        setSelectedDays([]);
        setSelectedTime({ hour: '4', min: '00', period: 'Evening' });
      }
    } else {
      setFormData({ name: '', class: '', schedule: '', teacher: '', defaultFees: 0 });
      setSelectedDays([]);
      setSelectedTime({ hour: '4', min: '00', period: 'Evening' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let finalSchedule = formData.schedule;
      if (selectedDays.length > 0) {
        finalSchedule = `${selectedDays.join(', ')} | ${selectedTime.hour}:${selectedTime.min} ${selectedTime.period}`;
      }

      await onSubmit({ ...formData, schedule: finalSchedule });
      onClose();
    } catch (error) {
      console.error('Failed to submit batch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-black italic text-slate-900">
            {initialData ? 'Edit Batch' : 'Create New Batch'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic">Batch Name</label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. Science Batch A"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic">Class</label>
            <select
              value={formData.class}
              onChange={e => setFormData({...formData, class: e.target.value})}
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select Class...</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                <option key={num} value={`${getOrdinal(num)}`}>{getOrdinal(num)} Grade</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase italic">Schedule (Days & Time)</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    selectedDays.includes(day) 
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
               <select 
                 value={selectedTime.hour}
                 onChange={e => setSelectedTime(prev => ({...prev, hour: e.target.value}))}
                 className="bg-white border hover:border-slate-300 border-slate-200 rounded-lg font-bold text-slate-700 outline-none p-2 w-16 text-center shadow-sm"
               >
                  {HOURS.map(h => <option key={h} value={h}>{h.padStart(2, '0')}</option>)}
               </select>
               <span className="font-bold text-slate-400">:</span>
               <select 
                 value={selectedTime.min}
                 onChange={e => setSelectedTime(prev => ({...prev, min: e.target.value}))}
                 className="bg-white border hover:border-slate-300 border-slate-200 rounded-lg font-bold text-slate-700 outline-none p-2 w-16 text-center shadow-sm"
               >
                  {MINS.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               
               <div className="flex flex-1 sm:flex-none justify-center bg-white rounded-lg p-1 ml-auto border border-slate-200 shadow-sm overflow-hidden">
                 <button 
                   type="button" 
                   className={cn("px-2 sm:px-3 py-1.5 text-xs font-bold rounded-md transition-all", selectedTime.period === 'Morning' ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:text-slate-600 bg-transparent")} 
                   onClick={() => setSelectedTime(prev => ({...prev, period: 'Morning'}))}
                 >
                   Morning
                 </button>
                 <button 
                   type="button" 
                   className={cn("px-2 sm:px-3 py-1.5 text-xs font-bold rounded-md transition-all", selectedTime.period === 'Evening' ? "bg-indigo-100 text-indigo-700" : "text-slate-400 hover:text-slate-600 bg-transparent")} 
                   onClick={() => setSelectedTime(prev => ({...prev, period: 'Evening'}))}
                 >
                   Evening
                 </button>
               </div>
            </div>
            {formData.schedule && selectedDays.length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 italic">Current preset: {formData.schedule}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic">Teacher</label>
            <Input 
              value={formData.teacher} 
              onChange={e => setFormData({...formData, teacher: e.target.value})} 
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic">Default Batch Fees (₹)</label>
            <Input 
              type="number"
              value={formData.defaultFees} 
              onChange={e => setFormData({...formData, defaultFees: Number(e.target.value)})} 
              placeholder="e.g. 500"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="italic font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 italic font-black text-white shadow-lg shadow-primary/20">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'Save Changes' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

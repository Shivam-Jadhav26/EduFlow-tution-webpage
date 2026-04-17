import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Filter, Plus, Clock, User, ArrowRight, Layers, MoreVertical, Search, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await api.get('/batches', {
          params: { search: searchTerm }
        });
        setBatches(response.data.data.batches);
      } catch (err: any) {
        console.error('Failed to fetch batches:', err);
        setError('Failed to load batches.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchBatches, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const stats = [
    { icon: Users, label: 'Total Active Batches', value: batches.length.toString(), color: 'text-primary', bg: 'bg-primary/5' },
    { icon: Layers, label: 'Classes Covered', value: [...new Set(batches.map(b => b.class))].sort().join(', ') || 'N/A', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: User, label: 'Current Enrollments', value: batches.reduce((acc, b) => acc + (b.students?.length || 0), 0).toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Clock, label: 'Daily Slots', value: '08:00 AM+', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const getStatusColor = (batch: any) => {
    const count = batch.students?.length || 0;
    if (count >= 60) return 'bg-red-500';
    if (count >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Batches Management</h1>
          <p className="text-slate-500 font-medium italic">Monitor batch strength, timings, and enrollment status.</p>
        </div>
        <Button className="gap-2 font-black italic rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
          <Plus size={18} /> Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Total Active Batches', value: '12', color: 'text-primary', bg: 'bg-primary/5' },
          { icon: Layers, label: 'Classes Covered', value: '6-10th', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: User, label: 'Avg Strength', value: '35', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Clock, label: 'Peak Slot', value: '04:00 PM', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="text-center p-6 border-none shadow-slate-200/50">
            <div className={cn("inline-flex p-3 rounded-2xl mb-4", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search batches by name or class..."
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold italic focus:border-primary outline-none transition-all"
          />
        </div>
        <Button variant="outline" className="gap-2 italic font-bold rounded-xl h-12 h-12">
          <Filter size={18} /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {batches.map((batch) => (
          <motion.div
            key={batch.id}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-3xl border border-slate-100 p-1 flex flex-col shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <Badge variant="outline" className="italic">{batch.class}</Badge>
                  <h3 className="text-xl font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors">{batch.name}</h3>
                </div>
                <button className="p-2 h-fit text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold italic">
                  <span className="text-slate-400">ENROLLMENT</span>
                  <span className="text-slate-900">{batch.students?.length || 0}/60 Students</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((batch.students?.length || 0) / 60) * 100}%` }}
                    className={cn("h-full rounded-full transition-all", getStatusColor(batch))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase italic">
                    <Clock size={12} className="text-slate-400" />
                    <span>{batch.timing ? batch.timing.split(' - ')[0] : '10:00 AM'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase italic">
                    <Users size={12} className="text-slate-400" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-slate-50 p-4 bg-slate-50/50 group-hover:bg-primary transition-colors cursor-pointer flex items-center justify-between overflow-hidden">
              <span className="text-xs font-black italic tracking-tight text-slate-600 group-hover:text-white transition-colors">Manage Roster & Attendance</span>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

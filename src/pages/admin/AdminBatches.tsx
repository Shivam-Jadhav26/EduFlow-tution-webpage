import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Search, Filter, MoreVertical,
  Users, Clock, Layers, GraduationCap,
  ArrowRight, Edit2, User, UserPlus
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { BatchModal } from '../../components/admin/BatchModal';
import { QuickAddStudentModal } from '../../components/admin/QuickAddStudentModal';

export const AdminBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const [quickAddBatch, setQuickAddBatch] = useState<any | null>(null);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/batches');
      setBatches(response.data.data.batches);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch batches:', err);
      setError('Failed to load batches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateEdit = async (data: any) => {
    try {
      if (editingBatch) {
        await api.put(`/batches/${editingBatch._id}`, data);
      } else {
        await api.post('/batches', data);
      }
      fetchBatches();
      setIsModalOpen(false);
      setEditingBatch(null);
    } catch (err) {
      console.error('Failed to save batch:', err);
      alert('Failed to save batch.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this batch?')) return;
    try {
      await api.delete(`/batches/${id}`);
      fetchBatches();
      setShowMenu(null);
    } catch (err) {
      console.error('Failed to delete batch:', err);
      alert('Failed to archive batch.');
    }
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || batch.class === filterClass;
    const matchesStatus = !filterStatus || batch.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const statsData = {
    totalActive: batches.filter(b => b.status === 'ACTIVE').length,
    classesCovered: [...new Set(batches.map(b => b.class))].length > 0
      ? `${Math.min(...batches.map(b => parseInt(b.class) || 0))}-${Math.max(...batches.map(b => parseInt(b.class) || 0))}th`
      : 'N/A',
    peakSlot: '04:00 PM'
  };

  const availableClasses = [...new Set(batches.map(b => b.class))].sort();

  const getStatusColor = (batch: any) => {
    const strength = batch.students?.length || 0;
    if (strength >= 50) return 'bg-red-500';
    if (strength >= 30) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" onClick={() => setShowMenu(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Batches Management</h1>
          <p className="text-slate-500 font-medium italic">Monitor batch strength, timings, and enrollment status.</p>
        </div>
        <Button
          onClick={() => { setEditingBatch(null); setIsModalOpen(true); }}
          className="gap-2 font-black italic rounded-xl h-12 px-6 shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Create New Batch
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold italic">
          {error}
        </div>
      )}

      {!loading && !error && batches.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold italic">No batches found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Total Active', value: statsData.totalActive.toString(), color: 'text-primary', bg: 'bg-primary/5' },
          { icon: Layers, label: 'Classes', value: statsData.classesCovered, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: User, label: 'Enrollments', value: batches.reduce((acc, b) => acc + (b.students?.length || 0), 0).toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Clock, label: 'Peak Slot', value: statsData.peakSlot, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="text-center p-6 border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batches by name or class..."
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold italic focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); setShowMenu(null); }}
            className="gap-2 italic font-bold rounded-xl h-12"
          >
            <Filter size={18} /> Filters
          </Button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2" onClick={e => e.stopPropagation()}>
              <div className="p-2 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase italic">Filter by Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold italic focus:border-primary outline-none bg-transparent"
                  >
                    <option value="">All Classes</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls as string}>{cls as string}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase italic">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold italic focus:border-primary outline-none bg-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBatches.map((batch) => (
          <motion.div
            key={batch._id || batch.id}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-3xl border border-slate-100 p-1 flex flex-col shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden"
          >
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <Badge variant="outline" className="italic">{batch.class}</Badge>
                  <h3 className="text-xl font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors line-clamp-1">{batch.name}</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFilters(false);
                      setShowMenu(showMenu === (batch._id || batch.id) ? null : (batch._id || batch.id));
                    }}
                    className="p-2 h-fit text-slate-300 hover:text-slate-900 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showMenu === (batch._id || batch.id) && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditingBatch(batch); setIsModalOpen(true); setShowMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm font-bold italic text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(batch._id || batch.id)}
                        className="w-full text-left px-4 py-2 text-sm font-bold italic text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black italic">
                    <span className="text-slate-400 uppercase tracking-widest">Enrollment</span>
                    <span className="text-slate-900">{batch.students?.length || 0}/60 Students</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((batch.students?.length || 0) / 60) * 100, 100)}%` }}
                      className={cn("h-full rounded-full transition-all", getStatusColor(batch))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 italic">
                    <Clock size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{batch.timing || batch.schedule?.split(' | ')[1] || 'No Time'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full",
                      batch.status === 'ACTIVE' || batch.isActive
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        batch.status === 'ACTIVE' || batch.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                      )} />
                      {batch.status === 'ACTIVE' || batch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {batch.teacher && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 italic pt-1 border-t border-slate-50">
                    <GraduationCap size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{batch.teacher}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto flex border-t border-slate-50 divide-x divide-slate-100 overflow-hidden rounded-b-3xl">
              <button
                onClick={(e) => { e.stopPropagation(); setQuickAddBatch(batch); }}
                className="flex-1 p-4 bg-slate-50/80 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group/add text-slate-600"
              >
                <UserPlus size={16} className="text-emerald-500 group-hover/add:text-white transition-colors" />
                <span className="text-xs font-black italic tracking-tight uppercase">Add Student</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setEditingBatch(batch); setIsModalOpen(true); }}
                className="flex-1 p-4 bg-slate-50/80 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group/edit text-slate-600"
              >
                <Edit2 size={16} className="text-primary group-hover/edit:text-white transition-colors" />
                <span className="text-xs font-black italic tracking-tight uppercase">Settings</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <BatchModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBatch(null); }}
        onSubmit={handleCreateEdit}
        initialData={editingBatch}
      />

      <QuickAddStudentModal
        isOpen={!!quickAddBatch}
        onClose={() => setQuickAddBatch(null)}
        targetId={quickAddBatch?._id || quickAddBatch?.id}
        targetName={quickAddBatch?.name}
        targetClass={quickAddBatch?.class}
        targetDefaultFees={quickAddBatch?.defaultFees}
        targetType="batch"
        onSuccess={() => {
          fetchBatches(); // Refresh batch strength and enrollments after adding
        }}
      />
    </div>
  );
};


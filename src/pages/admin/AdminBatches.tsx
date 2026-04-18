import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Filter, Plus, Clock, User, ArrowRight, Layers, MoreVertical, Search, Loader2, GraduationCap, Edit2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { BatchModal } from '../../components/admin/BatchModal';

export const AdminBatches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>({
    totalActive: 0,
    classesCovered: 'N/A',
    peakSlot: 'N/A'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/batches');
      setBatches(response.data.data.batches || []);
      if (response.data.data.stats) {
        setStatsData(response.data.data.stats);
      }
    } catch (err: any) {
      console.error('Failed to fetch batches:', err);
      setError('Failed to load batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateEdit = async (data: any) => {
    if (editingBatch) {
      await api.put(`/batches/${editingBatch._id || editingBatch.id}`, data);
    } else {
      await api.post('/batches', data);
    }
    fetchBatches();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this batch?')) {
      try {
        await api.delete(`/batches/${id}`);
        fetchBatches();
      } catch (err) {
        console.error('Failed to delete batch:', err);
        alert('Failed to delete batch.');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(null);
      setShowFilters(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredBatches = batches.filter(b => {
    const safeName = b.name || '';
    const safeClass = b.class || '';
    const matchesSearch = safeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          safeClass.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass ? b.class === filterClass : true;
    const matchesStatus = filterStatus ? (b.status === filterStatus || (b.isActive && filterStatus === 'ACTIVE') || (!b.isActive && filterStatus === 'INACTIVE')) : true;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const availableClasses = [...new Set(batches.map(b => b.class))].filter(Boolean).sort();

  if (loading && batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-bold italic">Loading batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Users, label: 'Total Active Batches', value: statsData.totalActive.toString(), color: 'text-primary', bg: 'bg-primary/5' },
          { icon: Layers, label: 'Classes Covered', value: statsData.classesCovered, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: Clock, label: 'Peak Slot', value: statsData.peakSlot, color: 'text-amber-600', bg: 'bg-amber-50' },
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
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 p-2" onClick={e => e.stopPropagation()}>
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
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <Badge variant="outline" className="italic">{batch.class}</Badge>
                  <h3 className="text-xl font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors">{batch.name}</h3>
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
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 italic">
                    <Clock size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{batch.timing || 'Schedule not set'}</span>
                  </div>
                  {batch.teacher && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 italic">
                      <GraduationCap size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{batch.teacher}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full",
                      batch.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        batch.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                      )} />
                      {batch.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={(e) => {
                e.stopPropagation();
                setEditingBatch(batch);
                setIsModalOpen(true);
              }}
              className="mt-auto border-t border-slate-50 p-4 bg-slate-50/50 group-hover:bg-primary transition-colors cursor-pointer flex items-center justify-between overflow-hidden"
            >
              <span className="text-xs font-black italic tracking-tight text-slate-600 group-hover:text-white transition-colors uppercase">Edit Batch Settings</span>
              <div className="flex items-center gap-2">
                 <Edit2 size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                 <ArrowRight size={16} className="text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>
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
    </div>
  );
};

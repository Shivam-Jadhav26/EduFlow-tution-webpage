import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, DollarSign, Download, Search, 
  AlertTriangle, Plus, LayoutGrid, Calendar,
  Edit2, Trash2, Loader2, X, Clock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { FeeModal } from '../../components/admin/FeeModal';

export const AdminFees = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCollection: 0,
    pendingDues: 0,
    overdueAmount: 0,
    overdueCount: 0,
    pendingCount: 0
  });
  const [loading, setLoading] = useState(true);
  
  // New State structure
  const [batches, setBatches] = useState<any[]>([]);
  const [studentsInBatch, setStudentsInBatch] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchText, setStudentSearchText] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: today, end: today });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any | null>(null);

  // Fetch batches on mount
  useEffect(() => {
    api.get('/batches').then(res => setBatches(res.data.data.batches || [])).catch(console.error);
  }, []);

  // Update students when batch changes
  useEffect(() => {
    if (selectedBatchId) {
      const b = batches.find(x => x._id === selectedBatchId);
      setStudentsInBatch(b?.students || []);
    } else {
      setStudentsInBatch([]);
    }
  }, [selectedBatchId, batches]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStudentId) params.studentId = selectedStudentId;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const [feesRes, statsRes] = await Promise.all([
        api.get('/fees', { params }),
        api.get('/fees/stats')
      ]);
      setTransactions(feesRes.data.data.fees);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch fee data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, dateRange]);

  useEffect(() => {
    const debounce = setTimeout(fetchData, 400);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  const handleCreateFee = async (data: any) => {
    await api.post('/fees', data);
    fetchData();
    setIsModalOpen(false);
  };

  const handleUpdateFee = async (data: any) => {
    if (!selectedFee?._id) return;
    await api.put(`/fees/${selectedFee._id}`, data);
    fetchData();
    setIsModalOpen(false);
  };

  const handleDeleteFee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await api.delete(`/fees/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete fee record:', err);
      alert('Failed to delete record.');
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) return;
    const headers = ['Student', 'Class', 'Month', 'Amount Received', 'Method', 'Pending Balance', 'Next Due Date', 'Date'];
    const rows = transactions.map(tx => [
      tx.studentId?.name || 'N/A',
      tx.studentId?.class || 'N/A',
      tx.month,
      tx.amount,
      tx.method || 'N/A',
      tx.currentPendingBalance !== undefined ? tx.currentPendingBalance : 'N/A',
      tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : 'N/A',
      new Date(tx.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fees_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    { label: 'Total Collection', value: `₹${(stats.totalCollection / 100000).toFixed(2)} L`, grow: '+12%', up: true, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Pending Dues', value: `₹${stats.pendingDues.toLocaleString()}`, grow: '-5%', up: false, icon: Clock, color: 'text-amber-500' },
    { label: 'Outstanding Late', value: `₹${stats.overdueAmount.toLocaleString()}`, sub: `${stats.overdueCount} Students`, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Active Reminders', value: `${stats.pendingCount} Items`, sub: 'Automated Reminders', icon: CreditCard, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Fee Management Bureau</h1>
          <p className="text-slate-500 font-medium italic">Monitor collections, manage pending dues, and issue automated reminders.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            type="button"
            onClick={handleExport}
            variant="outline" 
            className="gap-2 font-black italic rounded-xl h-12 px-6 hover:bg-slate-50 border-slate-200"
          >
            <Download size={18} /> Export Ledger
          </Button>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedFee(null);
              setIsModalOpen(true);
            }}
            className="gap-2 font-black italic rounded-xl h-12 px-6 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="flex flex-col justify-center border-none shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow">
             <div className={cn("p-4 rounded-2xl bg-slate-50 w-fit mb-4", stat.color)}>
                <stat.icon size={24} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{stat.label}</p>
             <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
                {stat.grow && (
                   <span className={cn("text-[8px] font-black uppercase tracking-tighter", stat.up ? "text-emerald-500" : "text-slate-400")}>{stat.grow}</span>
                )}
             </div>
             {stat.sub && (
               <p className="text-[10px] font-medium text-slate-500 italic">{stat.sub}</p>
             )}
          </Card>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-slate-50 p-5 rounded-2xl flex flex-wrap gap-4 items-center border border-slate-100">
         <select
           value={selectedBatchId}
           onChange={(e) => { setSelectedBatchId(e.target.value); setSelectedStudentId(''); setStudentSearchText(''); }}
           className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold italic focus:border-primary outline-none transition-all shadow-sm appearance-none min-w-[200px]"
         >
           <option value="">All Batches...</option>
           {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
         </select>
         
         <div className="relative min-w-[200px] flex-1">
           <input 
             type="text"
             value={studentSearchText}
             onChange={(e) => {
                setStudentSearchText(e.target.value);
                setIsStudentDropdownOpen(true);
                if (selectedStudentId) setSelectedStudentId('');
             }}
             onFocus={() => setIsStudentDropdownOpen(true)}
             onBlur={() => setTimeout(() => setIsStudentDropdownOpen(false), 200)}
             placeholder="Search Student..."
             disabled={!selectedBatchId}
             className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold italic focus:border-primary outline-none transition-all shadow-sm disabled:opacity-50"
           />
           {isStudentDropdownOpen && studentsInBatch.length > 0 && (
             <div className="absolute top-[110%] left-0 w-full bg-white border border-slate-200 shadow-2xl rounded-xl z-30 max-h-48 overflow-y-auto">
                {studentsInBatch.filter(s => s.name.toLowerCase().includes(studentSearchText.toLowerCase())).map(s => (
                   <button
                     key={s._id}
                     type="button"
                     onMouseDown={(e) => e.preventDefault()} // Prevent blur before click fires
                     onClick={() => {
                        setStudentSearchText(s.name);
                        setSelectedStudentId(s._id);
                        setIsStudentDropdownOpen(false);
                     }}
                     className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-primary/5 hover:text-primary border-b border-slate-50 last:border-0 transition-colors"
                   >
                      {s.name}
                   </button>
                ))}
                {studentsInBatch.filter(s => s.name.toLowerCase().includes(studentSearchText.toLowerCase())).length === 0 && (
                   <div className="px-5 py-3 text-sm font-bold text-slate-400 italic">No matches...</div>
                )}
             </div>
           )}
         </div>

         <div className="flex items-center gap-2 ml-auto">
           <span className="text-xs font-bold text-slate-500 uppercase italic">From:</span>
           <input 
             type="date" 
             className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold italic outline-none focus:border-primary shadow-sm"
             value={dateRange.start}
             onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
           />
         </div>
         <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-slate-500 uppercase italic">To:</span>
           <input 
             type="date" 
             className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold italic outline-none focus:border-primary shadow-sm"
             value={dateRange.end}
             onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
           />
         </div>
         
         <button 
           onClick={() => { setDateRange({ start: '', end: '' }); setSelectedBatchId(''); setSelectedStudentId(''); setStudentSearchText(''); }}
           className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
         >
           <X size={14} /> Clear
         </button>
      </div>

      <Card title="Ledger & Transactions" description="Comprehensive list of recent student fee status and histories">
         {loading ? (
            <div className="py-20 text-center">
               <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
               <p className="text-slate-400 font-bold italic">Loading ledger...</p>
            </div>
         ) : (
            <div className="overflow-x-auto mt-6">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-100">
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Student</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Month</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Amount Received</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Method</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Pending Balance</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Next Due Date</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {transactions.map((tx) => (
                        <tr key={tx._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                           <td className="py-4 px-4">
                              <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">{tx.studentId?.name || 'Unknown Student'}</h4>
                              <p className="text-[10px] font-bold text-slate-400 italic">Class: {tx.studentId?.class || 'N/A'}</p>
                           </td>
                           <td className="py-4 px-4 text-xs font-bold text-slate-500 italic">{tx.month}</td>
                           <td className="py-4 px-4 text-sm font-black text-slate-900 italic">₹{tx.amount.toLocaleString()}</td>
                           <td className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.method || 'N/A'}</td>
                           <td className="py-4 px-4 text-sm font-black italic text-red-500">
                             {tx.currentPendingBalance !== undefined ? `₹${tx.currentPendingBalance.toLocaleString()}` : '—'}
                           </td>
                           <td className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : 'N/A'}
                           </td>
                           <td className="py-4 px-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                    type="button"
                                    onClick={(e) => {
                                       e.preventDefault();
                                       e.stopPropagation();
                                       setSelectedFee(tx);
                                       setIsModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                 >
                                    <Edit2 size={16} />
                                 </button>
                                 <button 
                                    type="button"
                                    onClick={(e) => {
                                       e.preventDefault();
                                       e.stopPropagation();
                                       handleDeleteFee(tx._id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {transactions.length === 0 && (
                        <tr>
                           <td colSpan={7} className="py-20 text-center text-slate-400 font-bold italic">No transactions found for the selected dates.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </Card>

      <FeeModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         initialData={selectedFee}
         onSubmit={selectedFee ? handleUpdateFee : handleCreateFee}
      />
    </div>
  );
};

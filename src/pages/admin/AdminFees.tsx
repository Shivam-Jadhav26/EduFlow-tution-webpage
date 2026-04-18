import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, DollarSign, Download, Search, 
  Filter, CheckCircle2, Clock, AlertTriangle, 
  Plus, MoreVertical, LayoutGrid, Calendar,
  ArrowUpRight, Edit2, Trash2, Loader2, X
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;
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
  }, [searchTerm, filterStatus, dateRange]);

  useEffect(() => {
    const debounce = setTimeout(fetchData, 400);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  const handleCreateFee = async (data: any) => {
    await api.post('/fees', data);
    fetchData();
  };

  const handleUpdateFee = async (data: any) => {
    if (!selectedFee?._id) return;
    await api.put(`/fees/${selectedFee._id}`, data);
    fetchData();
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
    const headers = ['Transaction ID', 'Student', 'Class', 'Month', 'Amount', 'Method', 'Status', 'Date'];
    const rows = transactions.map(tx => [
      tx.transactionId || `TXN-${tx._id.slice(-6).toUpperCase()}`,
      tx.studentId?.name || 'N/A',
      tx.studentId?.class || 'N/A',
      tx.month,
      tx.amount,
      tx.method || 'N/A',
      tx.status,
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
    <div className="space-y-8 animate-in fade-in duration-500">
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
          <Card key={i} className="flex flex-col justify-center border-none shadow-sm shadow-slate-200/50">
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

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or transaction ID..." 
              className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold italic focus:border-primary outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-sm font-bold italic focus:border-primary outline-none transition-all h-12 shadow-sm appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <Button 
            type="button" 
            variant={showDateFilters ? "primary" : "outline"}
            className="gap-2 italic font-bold rounded-xl h-12 px-6 border-slate-200"
            onClick={() => setShowDateFilters(!showDateFilters)}
          >
            <Calendar size={18} /> Date Range
          </Button>
        </div>

        {showDateFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase italic">From:</span>
              <input 
                type="date" 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold italic outline-none focus:border-primary"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase italic">To:</span>
              <input 
                type="date" 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold italic outline-none focus:border-primary"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <button 
              onClick={() => setDateRange({ start: '', end: '' })}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors ml-auto"
            >
              <X size={14} /> Clear Range
            </button>
          </motion.div>
        )}
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
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Transaction Details</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Student</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Month</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Amount</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Method</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Status</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {transactions.map((tx) => (
                        <tr key={tx._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                           <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <LayoutGrid size={14} />
                                 </div>
                                 <span className="text-sm font-black text-slate-900 italic">{tx.transactionId || `TXN-${tx._id.slice(-6).toUpperCase()}`}</span>
                              </div>
                           </td>
                           <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                              <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">{tx.studentId?.name || 'Unknown Student'}</h4>
                              <p className="text-[10px] font-bold text-slate-400 italic">Class: {tx.studentId?.class || 'N/A'}</p>
                           </td>
                           <td className="py-4 px-4 text-xs font-bold text-slate-500 italic" onClick={(e) => e.stopPropagation()}>{tx.month}</td>
                           <td className="py-4 px-4 text-sm font-black text-slate-900 italic" onClick={(e) => e.stopPropagation()}>₹{tx.amount.toLocaleString()}</td>
                           <td className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" onClick={(e) => e.stopPropagation()}>{tx.method || 'N/A'}</td>
                           <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                              <Badge variant={tx.status === 'paid' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}>
                                 {tx.status.toUpperCase()}
                              </Badge>
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
                           <td colSpan={7} className="py-20 text-center text-slate-400 font-bold italic">No transactions found.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         )}
         <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
            <Button 
               variant="ghost" 
               type="button"
               className="text-xs font-black italic tracking-tight text-primary uppercase"
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
               View Full Audit Log
            </Button>
         </div>
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

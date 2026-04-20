import React, { useState, useEffect } from 'react';
import { X, Loader2, Search, Wallet, FileText, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { motion } from 'motion/react';

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData: any | null;
}

export const FeeModal: React.FC<FeeModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    method: 'Cash', // Default
  });
  
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  
  // Student dropdown related
  const [studentsInBatch, setStudentsInBatch] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Financial tracking
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [previousPending, setPreviousPending] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);

  // 1. Fetch batches on open
  useEffect(() => {
    if (isOpen) {
      fetchBatches();
      if (!initialData) {
        // Reset state
        setFormData({
          studentId: '',
          amount: '',
          paidDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          method: 'Bank',
        });
        setSelectedBatchId('');
        setStudentSearch('');
        setPreviousPending(null);
      } else {
        // Edit mode (if supported)
        setFormData({
          studentId: initialData.studentId?._id || initialData.studentId || '',
          amount: initialData.amount?.toString() || '',
          paidDate: initialData.paidDate ? new Date(initialData.paidDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
          method: initialData.method || 'Bank',
        });
        setStudentSearch(initialData.studentId?.name || '');
        // For accurate recalculation, we won't fully support editing past financial states in real-time in this exact form,
        // but let's try to fetch if we can.
      }
    }
  }, [isOpen, initialData]);

  const fetchBatches = async () => {
    try {
      setFetchingBatches(true);
      const res = await api.get('/batches');
      setBatches(res.data.data.batches || []);
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setFetchingBatches(false);
    }
  };

  // 2. When batch is selected, prep students
  useEffect(() => {
    if (selectedBatchId) {
      const b = batches.find(x => x._id === selectedBatchId);
      if (b && b.students) {
        setStudentsInBatch(b.students);
      } else {
        setStudentsInBatch([]);
      }
    } else {
      setStudentsInBatch([]);
    }
  }, [selectedBatchId, batches]);

  // Reset student search when batch changes
  useEffect(() => {
    if (!initialData || (initialData && initialData.batch !== selectedBatchId)) {
      setStudentSearch('');
      setFormData(prev => ({ ...prev, studentId: '' }));
      setPreviousPending(null);
    }
  }, [selectedBatchId]);

  // 3. When student is selected, compute financials
  useEffect(() => {
    const fetchFinancials = async () => {
      if (!formData.studentId || !selectedBatchId) return;
      try {
        setLoadingFinancials(true);
        const [studentRes, feesRes] = await Promise.all([
          api.get(`/students/${formData.studentId}`),
          api.get(`/fees`, { params: { studentId: formData.studentId, status: 'paid' } })
        ]);
        
        const student = studentRes.data.data.student;
        const paidFees = feesRes.data.data.fees || [];
        
        const batchDetails = batches.find(b => b._id === selectedBatchId);
        const defaultFeeForBatch = batchDetails?.defaultFees || 0;
        
        const applicableFees = student.fees !== null && student.fees !== undefined 
            ? student.fees 
            : defaultFeeForBatch;
        
        const totalPaid = paidFees.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        
        setPreviousPending(applicableFees - totalPaid);
      } catch (err) {
        console.error('Failed to compute financials', err);
      } finally {
        setLoadingFinancials(false);
      }
    };
    
    fetchFinancials();
  }, [formData.studentId, selectedBatchId, batches]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submissionData = {
        studentId: formData.studentId,
        amount: Number(formData.amount),
        month: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(formData.paidDate)),
        status: 'paid', // Always paid for this form
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0], // Give today if unselected
        paidDate: formData.paidDate,
        method: formData.method === 'Bank' ? 'Bank Transfer' : formData.method,
        transactionId: `TXN-${Date.now().toString().slice(-6)}`, // Add a random tx id if backend allows
        remarks: 'Recorded via Record Payment panel',
      };
      
      await onSubmit(initialData ? { ...submissionData, status: initialData.status } : submissionData);
      onClose();
    } catch (error) {
      console.error('Failed to submit fee:', error);
    } finally {
      setLoading(false);
    }
  };

  const amountNumber = Number(formData.amount) || 0;
  const currentPendingRaw = (previousPending !== null ? previousPending : 0);
  const updatedPending = Math.max(0, currentPendingRaw - amountNumber); // Prevent negative pending in UI logically unless overpaid

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredStudents = studentsInBatch.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl shadow-2xl overflow-y-auto border-none flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b-4 border-indigo-600 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-2 rounded-lg">
                <Wallet className="text-slate-700" size={20} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Record Payment</h2>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1">
           <form id="paymentForm" onSubmit={handleSubmit} className="p-8 space-y-10 bg-white">
             
             {/* Section 1 */}
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <h3 className="text-sm font-black text-indigo-500 tracking-widest uppercase mb-1 whitespace-nowrap">1. Student Identification</h3>
                   <div className="h-px bg-slate-100 flex-1 ml-2"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600">Select Batch</label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full h-[50px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                       <option value="" disabled>Choose Batch...</option>
                       {batches.map(b => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                       ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-600">Search Student</label>
                    <div className="relative">
                       <Input 
                         value={studentSearch}
                         onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setIsDropdownOpen(true);
                            if (formData.studentId) {
                               setFormData(p => ({...p, studentId: ''}));
                               setPreviousPending(null);
                            }
                         }}
                         onFocus={() => setIsDropdownOpen(true)}
                         onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                         placeholder="Type student name..."
                         className="h-[50px] bg-slate-50 border-slate-100 font-bold text-slate-700"
                         disabled={!selectedBatchId}
                       />
                       {isDropdownOpen && studentSearch && filteredStudents.length > 0 && !formData.studentId && (
                         <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 shadow-2xl rounded-xl z-30 max-h-48 overflow-y-auto">
                            {filteredStudents.map(s => (
                               <button
                                 key={s._id}
                                 type="button"
                                 onClick={() => {
                                    setStudentSearch(s.name);
                                    setFormData(p => ({...p, studentId: s._id}));
                                    setIsDropdownOpen(false);
                                 }}
                                 className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-b border-slate-50 last:border-0 transition-colors"
                               >
                                  {s.name}
                               </button>
                            ))}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
             </div>

             {/* Section 2 */}
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <h3 className="text-sm font-black text-indigo-500 tracking-widest uppercase mb-1 whitespace-nowrap">2. Transaction Details</h3>
                   <div className="h-px bg-slate-100 flex-1 ml-2"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-600">Date</label>
                      <Input
                        type="date"
                        value={formData.paidDate}
                        onChange={(e) => setFormData({...formData, paidDate: e.target.value})}
                        className="h-[50px] bg-slate-50 border-slate-100 font-bold"
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-600">Amount Received (₹)</label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="8000"
                        className="h-[50px] bg-slate-50 border-slate-100 font-bold text-lg"
                        required
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-black text-slate-600">Payment Method</label>
                   <div className="flex bg-slate-50 rounded-xl p-1 gap-1 border border-slate-100">
                      {['Cash', 'UPI', 'Bank'].map(method => (
                         <button
                           key={method}
                           type="button"
                           onClick={() => setFormData({...formData, method})}
                           className={cn(
                              "flex-1 py-3 text-sm font-black rounded-lg transition-all",
                              formData.method === method 
                                ? "bg-indigo-600 text-white shadow-md" 
                                : "text-slate-500 hover:bg-slate-200"
                           )}
                         >
                            {method}
                         </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* Section 3 */}
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <h3 className="text-sm font-black text-indigo-500 tracking-widest uppercase mb-1 whitespace-nowrap">3. Financial Summary</h3>
                   <div className="h-px bg-slate-100 flex-1 ml-2"></div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500">Previous Pending:</span>
                      <span className="text-lg font-black text-slate-900">
                         {loadingFinancials ? <Loader2 size={18} className="animate-spin text-slate-300" /> : (previousPending !== null ? formatCurrency(previousPending) : '—')}
                      </span>
                   </div>
                   
                   <div className="h-px w-full border-t border-dashed border-slate-300"></div>

                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700 italic">updated pending balance</span>
                      <span className="text-xl font-black text-red-500">
                         {previousPending !== null ? formatCurrency(updatedPending) : '—'}
                      </span>
                   </div>
                </div>

                {updatedPending > 0 && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mt-4">
                      <label className="text-xs font-black text-slate-600">Next Due Date (For Remaining Balance)</label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="h-[50px] bg-slate-50 border-slate-100 font-bold"
                      />
                   </motion.div>
                )}
             </div>

           </form>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-4 shrink-0">
          <Button 
             type="button" 
             variant="outline" 
             onClick={onClose} 
             disabled={loading} 
             className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-12 px-6"
          >
             Cancel
          </Button>
          <Button 
             type="submit" 
             form="paymentForm"
             disabled={loading || !formData.studentId || !formData.amount} 
             className="gap-2 font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 rounded-xl h-12 px-8"
          >
             {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Record'} {!loading && <Check size={18} />}
          </Button>
        </div>
      </Card>
    </div>
  );
};

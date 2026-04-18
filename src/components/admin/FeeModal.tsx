import React, { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
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
    month: '',
    status: 'pending',
    dueDate: '',
    paidDate: '',
    method: '',
    transactionId: '',
    remarks: ''
  });
  
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.studentId?._id || initialData.studentId || '',
        amount: initialData.amount?.toString() || '',
        month: initialData.month || '',
        status: initialData.status || 'pending',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        paidDate: initialData.paidDate ? new Date(initialData.paidDate).toISOString().split('T')[0] : '',
        method: initialData.method || '',
        transactionId: initialData.transactionId || '',
        remarks: initialData.remarks || ''
      });
      // If editing, we might want to show the student name in search
      if (initialData.studentId?.name) {
        setStudentSearch(initialData.studentId.name);
      }
    } else {
      setFormData({
        studentId: '',
        amount: '',
        month: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0],
        paidDate: '',
        method: '',
        transactionId: '',
        remarks: ''
      });
      setStudentSearch('');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (studentSearch.length < 2) {
         setStudents([]);
         return;
      }
      try {
        setFetchingStudents(true);
        const response = await api.get('/students', { params: { search: studentSearch, limit: 10 } });
        setStudents(response.data.data.students);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setFetchingStudents(false);
      }
    };

    const debounce = setTimeout(fetchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit fee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black italic text-slate-900">
            {initialData ? 'Edit Fee Record' : 'Record New Payment'}
          </h2>
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Student Search */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Select Student</label>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <Input 
                value={studentSearch} 
                onChange={e => setStudentSearch(e.target.value)} 
                placeholder="Search by name or email..."
                className="pl-10 rounded-xl"
                disabled={!!initialData}
               />
            </div>
            {fetchingStudents && <div className="absolute right-3 top-9"><Loader2 size={16} className="animate-spin text-primary" /></div>}
            
            {students.length > 0 && !formData.studentId && (
               <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {students.map(s => (
                <button
                  key={s._id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFormData({...formData, studentId: s._id});
                    setStudentSearch(s.name);
                    setStudents([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col transition-colors border-b border-slate-50 last:border-0"
                >
                        <span className="text-sm font-black italic text-slate-900">{s.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.class} | {s.email}</span>
                     </button>
                  ))}
               </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Amount (₹)</label>
              <Input 
                type="number"
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                placeholder="5000"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Month</label>
              <Input 
                value={formData.month} 
                onChange={e => setFormData({...formData, month: e.target.value})} 
                placeholder="May 2024"
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Due Date</label>
              <Input 
                type="date"
                value={formData.dueDate} 
                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Status</label>
              <select
                value={formData.status}
                onChange={e => {
                  e.stopPropagation();
                  setFormData({...formData, status: e.target.value});
                }}
                onClick={e => e.stopPropagation()}
                required
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all italic"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {formData.status === 'paid' && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Payment Method</label>
                    <select
                      value={formData.method}
                      onChange={e => setFormData({...formData, method: e.target.value})}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all italic"
                    >
                      <option value="">Select Method...</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Payment Date</label>
                    <Input 
                      type="date"
                      value={formData.paidDate} 
                      onChange={e => setFormData({...formData, paidDate: e.target.value})} 
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Transaction ID / Reference</label>
                  <Input 
                    value={formData.transactionId} 
                    onChange={e => setFormData({...formData, transactionId: e.target.value})} 
                    placeholder="TXN-123456"
                    className="rounded-xl"
                  />
                </div>
             </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
              placeholder="Any additional notes..."
              className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none italic"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white z-10">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="italic font-bold rounded-xl h-11 px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.studentId} className="gap-2 italic font-black text-white shadow-lg shadow-primary/20 rounded-xl h-11 px-8">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'Update Record' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

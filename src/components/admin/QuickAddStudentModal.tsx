import React, { useState } from 'react';
import { X, Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import api from '../../services/api';

interface QuickAddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string | null;
  targetName: string;
  targetClass: string;
  targetDefaultFees?: number;
  targetType: 'batch';
  onSuccess: () => void;
}

export const QuickAddStudentModal: React.FC<QuickAddStudentModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetClass,
  targetDefaultFees,
  targetType,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [fees, setFees] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFees(targetDefaultFees !== undefined ? targetDefaultFees : '');
    }
  }, [isOpen, targetDefaultFees]);

  if (!isOpen || !targetId) return null;

  const handleClose = () => {
    setEmail('');
    setFees('');
    setError(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      // 1. Search if student exists by email
      const searchRes = await api.get(`/students?search=${encodeURIComponent(email)}`);
      const existingStudents = searchRes.data.data.students || [];
      const exactMatch = existingStudents.find((s: any) => s.email.toLowerCase() === email.toLowerCase());

      if (exactMatch) {
        // Enrolling existing student
        const updatedData = {
          ...exactMatch,
          class: targetClass,
          fees: fees === '' ? null : fees
        };
        
        // Only link batch if we are in batch allocation mode
        if (targetType === 'batch') {
          updatedData.batch = targetId;
        }

        await api.put(`/students/${exactMatch._id}`, updatedData);
        setSuccessMsg(`Student ${exactMatch.name} successfully allotted to ${targetName}!`);
        
        onSuccess();

        // Auto-close after short delay to show success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        // ERROR: Student doesn't exist
        setError('Student account not found. Please register the student first.');
        setLoading(false);
      }

    } catch (err: any) {
      console.error('Failed to quick add student:', err);
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl p-0 overflow-hidden border-none text-center relative">
        <div className="absolute top-4 right-4">
          <button onClick={handleClose} disabled={loading && !successMsg} className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full shadow-sm hover:shadow z-10 relative cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="bg-primary/5 px-6 py-6 border-b border-primary/10 flex flex-col items-center justify-center gap-3">
          <div className="bg-white p-3 rounded-full shadow-md text-primary mt-4">
            <UserPlus size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic text-slate-900 leading-tight">Student Allocate</h2>
            <p className="text-sm font-bold text-slate-500 italic mt-1">Enroll student directly to <span className="text-primary">{targetName}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white flex flex-col items-center">
          {error && (
            <div className="w-full p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold italic text-left">
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="w-full py-8 text-center animate-in zoom-in duration-300">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="font-black italic text-emerald-600 text-lg">{successMsg}</p>
              <p className="text-xs font-bold text-slate-400 mt-2">Closing automatically...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 w-full text-left">
                <label className="text-xs font-black text-slate-500 uppercase italic tracking-widest pl-1">Student Gmail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full text-lg py-5 px-4 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2 w-full text-left">
                <label className="text-xs font-black text-slate-500 uppercase italic tracking-widest pl-1">Agreed Fees (₹)</label>
                <Input
                  type="number"
                  value={fees}
                  onChange={e => setFees(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full text-lg py-5 px-4 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <p className="text-[10px] font-bold text-slate-400 italic pl-1">Pre-filled with batch default.</p>
              </div>

              <div className="w-full pt-4">
                <Button type="submit" disabled={loading} className="w-full py-4 text-base gap-2 italic font-black shadow-lg shadow-primary/20 rounded-xl">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Allocate to Batch'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
};

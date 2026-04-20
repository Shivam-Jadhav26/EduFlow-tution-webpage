import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, Download, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentFees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await api.get('/fees/me');
        setFeeRecords(res.data.data.fees || []);
      } catch (err: any) {
        console.error('Failed to fetch fees:', err);
        setError('Could not retrieve your fee ledger.');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-500 font-black italic animate-pulse">Accessing Vault Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center border-dashed border-2 border-slate-200">
        <div className="bg-red-50 text-red-500 p-4 rounded-2xl w-fit mx-auto mb-6">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-xl font-black italic text-slate-900 mb-2">Ledger Unavailable</h2>
        <p className="text-slate-500 font-medium mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="font-bold italic">Retry Access</Button>
      </Card>
    );
  }

  const hasDues = feeRecords.some(f => f.status === 'pending' || f.status === 'overdue');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Fee Management</h1>
          <p className="text-slate-500 font-medium italic">Securely pay and track your tuition history.</p>
        </div>
        <Button className="gap-2 font-bold rounded-xl italic px-6 shadow-lg shadow-primary/20">
          <CreditCard size={18} /> Pay Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Account Status">
          <Badge variant={hasDues ? "warning" : "success"} className="w-fit mb-2">
            {hasDues ? "OUTSTANDING" : "CLEAR"}
          </Badge>
          <p className="text-xs text-slate-500 italic font-medium">
            {hasDues ? "Pending payments require attention." : "No pending dues for current cycle."}
          </p>
        </Card>
        <Card title="Monthly Installment">
          <p className="text-2xl font-black text-slate-900 mb-1 leading-none">₹5,000</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusive of GST</p>
        </Card>
        <Card title="Next Due Date">
          <p className="text-2xl font-black text-amber-600 mb-1 leading-none">05 Jun</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Registration Cycle</p>
        </Card>
        <Card title="Scholarship">
          <p className="text-2xl font-black text-primary mb-1 leading-none">15% OFF</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Academic Merit</p>
        </Card>
      </div>

      <Card title="Transaction History" description="List of your last few tuition payments">
        <div className="space-y-4 mt-6">
          {feeRecords.length > 0 ? feeRecords.map((record) => (
            <div key={record._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-full shrink-0",
                  record.status === 'paid' ? "bg-emerald-50 text-emerald-600" : record.status === 'overdue' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                )}>
                  {record.status === 'paid' ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 italic leading-tight">{record.month} Tuition</h4>
                  <p className="text-xs text-slate-500 font-medium italic">Payment ID: {record.transactionId || `#REF-${record._id.slice(-6).toUpperCase()}`}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-black text-slate-900 leading-none mb-1">₹{record.amount.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-2">
                  <Badge variant={record.status === 'paid' ? 'success' : record.status === 'overdue' ? 'error' : 'warning'}>
                    {record.status.toUpperCase()}
                  </Badge>
                  {record.status === 'paid' && (
                    <button className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                      <Download size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <p className="text-slate-400 font-black italic">No transaction records found on this account.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

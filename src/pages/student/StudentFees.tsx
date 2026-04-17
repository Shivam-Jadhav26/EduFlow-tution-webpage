import { CreditCard, CheckCircle, Clock, Download } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { fees } from '../../data/mockData';
import { cn } from '../../utils/cn';

export const StudentFees = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Fee Management</h1>
          <p className="text-slate-500 font-medium italic">Securely pay and track your tuition history.</p>
        </div>
        <Button className="gap-2 font-bold rounded-xl italic px-6">
          <CreditCard size={18} /> Pay Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Account Status">
          <Badge variant="success" className="w-fit mb-2">CLEAR</Badge>
          <p className="text-xs text-slate-500 italic font-medium">No pending dues for current cycle.</p>
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
          {fees.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-full shrink-0",
                  record.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {record.status === 'paid' ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 italic leading-tight">{record.month} Tuition</h4>
                  <p className="text-xs text-slate-500 font-medium italic">Payment ID: #PAY{record.id}009</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-black text-slate-900 leading-none mb-1">₹{record.amount.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-2">
                  <Badge variant={record.status === 'paid' ? 'success' : 'warning'}>
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
          ))}
        </div>
      </Card>
    </div>
  );
};

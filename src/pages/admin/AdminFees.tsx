import { motion } from 'motion/react';
import { 
  CreditCard, DollarSign, Download, Search, 
  Filter, CheckCircle2, Clock, AlertTriangle, 
  Plus, MoreVertical, LayoutGrid, Calendar,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const mockTransactions = [
  { id: '1', student: 'Rahul Sharma', class: '10th', amount: 5000, date: '16 May, 2024', status: 'Paid', method: 'UPI' },
  { id: '2', student: 'Ishita Roy', class: '9th', amount: 4500, date: '15 May, 2024', status: 'Pending', method: 'Bank Transfer' },
  { id: '3', student: 'Kabir Vats', class: '10th', amount: 5000, date: '14 May, 2024', status: 'Paid', method: 'Cash' },
  { id: '4', student: 'Aditi Khanna', class: '10th', amount: 5000, date: '14 May, 2024', status: 'Paid', method: 'UPI' },
  { id: '5', student: 'Sanya Gupta', class: '8th', amount: 4000, date: '12 May, 2024', status: 'Overdue', method: 'UPI' },
];

export const AdminFees = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Fee Management Bureau</h1>
          <p className="text-slate-500 font-medium italic">Monitor collections, manage pending dues, and issue automated reminders.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Download size={18} /> Export Ledger
          </Button>
          <Button className="gap-2 font-black italic rounded-xl h-12 px-6">
            <Plus size={18} /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Collection', value: '₹4.85 L', grow: '+12%', up: true, icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Pending Dues', value: '₹12,400', grow: '-5%', up: false, icon: Clock, color: 'text-amber-500' },
          { label: 'Outstanding Late', value: '₹4,500', sub: '8 Students', icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Active Discounts', value: '32 Items', sub: 'Academic Merits', icon: CreditCard, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col justify-center">
             <div className={cn("p-4 rounded-full bg-slate-50 w-fit mb-4", stat.color)}>
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or transaction ID..." 
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold italic focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>
        <Button variant="outline" className="gap-2 italic font-bold rounded-xl h-12 px-6 border-slate-200">
          <Calendar size={18} /> Date Range
        </Button>
        <Button variant="outline" className="gap-2 italic font-bold rounded-xl h-12 px-6 border-slate-200">
          <Filter size={18} /> Filters
        </Button>
      </div>

      <Card title="Ledger & Transactions" description="Comprehensive list of recent student fee status and histories">
         <div className="overflow-x-auto mt-6">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Transaction Details</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Student</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Date</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Amount</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Method</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4">Status</th>
                     <th className="py-4 text-[10px] font-black text-slate-400 uppercase italic px-4"></th>
                  </tr>
               </thead>
               <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><LayoutGrid size={14} /></div>
                             <span className="text-sm font-black text-slate-900 italic">TXN-{tx.id}9302</span>
                          </div>
                       </td>
                       <td className="py-4 px-4">
                          <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">{tx.student}</h4>
                          <p className="text-[10px] font-bold text-slate-400 italic">Class: {tx.class}</p>
                       </td>
                       <td className="py-4 px-4 text-xs font-bold text-slate-500 italic">{tx.date}</td>
                       <td className="py-4 px-4 text-sm font-black text-slate-900 italic">₹{tx.amount.toLocaleString()}</td>
                       <td className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">{tx.method}</td>
                       <td className="py-4 px-4">
                          <Badge variant={tx.status === 'Paid' ? 'success' : tx.status === 'Pending' ? 'warning' : 'error'}>
                             {tx.status.toUpperCase()}
                          </Badge>
                       </td>
                       <td className="py-4 px-4">
                          <button className="p-2 h-auto text-slate-300 hover:text-primary transition-all">
                             <MoreVertical size={18} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
            <Button variant="ghost" className="text-xs font-black italic tracking-tight text-primary uppercase">Load Older Transactions</Button>
         </div>
      </Card>
    </div>
  );
};

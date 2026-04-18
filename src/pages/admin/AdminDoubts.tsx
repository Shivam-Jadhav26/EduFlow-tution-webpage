import { motion } from 'motion/react';
import { 
  MessageSquare, Search, Filter, Clock, 
  CheckCircle2, User, Send, SendHorizontal,
  MoreVertical, BookOpen, AlertCircle
} from 'lucide-react';
import { doubts } from '../../data/mockData';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const AdminDoubts = () => {
  const unresolvedDoubts = doubts.filter(d => d.status === 'pending');
  const resolvedDoubts = doubts.filter(d => d.status === 'resolved');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Doubt Resolution Center</h1>
          <p className="text-slate-500 font-medium italic">Monitor and resolve student queries across all subjects.</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="error" className="h-fit py-2 px-4 italic font-black text-xs shadow-lg shadow-red-500/10">
            {unresolvedDoubts.length} UNRESOLVED
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Avg Feedback Time', value: '42 mins', icon: Clock, color: 'text-amber-500' },
           { label: 'Total Resovled', value: '184', icon: CheckCircle2, color: 'text-emerald-600' },
           { label: 'Daily Query Rate', value: '12-15', icon: MessageSquare, color: 'text-primary' },
           { label: 'Escalated Issues', value: '00', icon: AlertCircle, color: 'text-red-500' },
         ].map((stat, i) => (
           <Card key={i} className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}>
                 <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
         {['Active Queue', 'My Subjects', 'Resolved History', 'Escalated'].map((tab, i) => (
           <button key={i} className={cn(
             "px-6 py-2.5 text-xs font-black italic rounded-xl transition-all uppercase tracking-widest",
             i === 0 ? "bg-white shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
           )}>{tab}</button>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h3 className="text-sm font-black text-slate-900 italic uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Responses
           </h3>
           
           <div className="space-y-4">
              {unresolvedDoubts.map((doubt) => (
                <Card key={doubt.id} className="p-0 overflow-hidden group hover:border-amber-200 transition-all border-l-4 border-l-amber-500">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center italic font-black text-slate-400">R</div>
                            <div>
                               <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">Rahul Sharma</h4>
                               <p className="text-[10px] font-bold text-slate-400 italic">Class: 10th | {doubt.createdAt}</p>
                            </div>
                         </div>
                         <Badge variant="outline" className="italic">{doubt.subject}</Badge>
                      </div>
                      <p className="text-sm font-black font-serif text-slate-800 italic leading-relaxed mb-6">
                         "{doubt.question}"
                      </p>
                      <div className="flex gap-3">
                         <input 
                           type="text" 
                           placeholder="Type your explanation here..." 
                           className="flex-1 bg-slate-50 border border-slate-100 focus:border-primary px-4 py-3 rounded-2xl text-xs font-bold italic outline-none transition-all"
                         />
                         <Button className="h-12 w-12 rounded-2xl p-0 shadow-lg shadow-primary/20">
                            <SendHorizontal size={20} />
                         </Button>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-sm font-black text-slate-900 italic uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Resolved History
           </h3>

           <div className="space-y-4 opacity-75">
              {resolvedDoubts.map((doubt) => (
                <Card key={doubt.id} className="p-0 overflow-hidden border-l-4 border-l-emerald-500 bg-slate-50/30">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black italic text-slate-400">R</div>
                            <h4 className="text-xs font-black text-slate-700 italic">Rahul Sharma</h4>
                         </div>
                         <Badge variant="success" className="text-[8px] italic">{doubt.subject}</Badge>
                      </div>
                      <p className="text-xs font-medium italic text-slate-500 mb-4 truncate italic">"{doubt.question}"</p>
                      <div className="p-3 bg-white rounded-xl border border-slate-100 italic space-y-1">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Your Response</p>
                         <p className="text-[10px] font-medium text-slate-600 line-clamp-2 italic">{doubt.replies?.[0].text}</p>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

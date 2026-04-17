import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, Search, Filter, Clock, 
  CheckCircle2, User, Send, SendHorizontal,
  MoreVertical, BookOpen, AlertCircle, Loader2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminDoubts = () => {
  const [activeTab, setActiveTab] = useState('Active Queue');
  const [doubts, setDoubts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalResolved: 0, totalPending: 0, avgResponseMins: 0, dailyRate: '0' });
  const [loading, setLoading] = useState(true);
  
  // Track inputs for each specific doubt reply box
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const [doubtsRes, statsRes] = await Promise.all([
        api.get('/doubts'),
        api.get('/doubts/admin-stats')
      ]);
      setDoubts(doubtsRes.data.data.doubts || []);
      setStats(statsRes.data.data.stats || stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleReplyChange = (id: string, val: string) => {
    setReplyInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleSendReply = async (id: string) => {
    const text = replyInputs[id];
    if (!text || !text.trim()) return;
    setSendingId(id);
    try {
      await api.post(`/doubts/${id}/reply`, { text });
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
      fetchDoubts(); // Refresh queues seamlessly mapping it over to resolved history
    } catch (err) {
      alert("Failed to submit reply");
    } finally {
      setSendingId(null);
    }
  };

  const handleForceResolve = async (id: string) => {
    try {
      setSendingId(id);
      await api.patch(`/doubts/${id}`);
      fetchDoubts();
    } catch (err) {
      alert("Failed to mark as resolved");
      setSendingId(null);
    }
  };

  const unresolvedDoubts = doubts.filter(d => d.status === 'pending');
  const resolvedDoubts = doubts.filter(d => d.status === 'resolved');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Doubt Resolution Center</h1>
          <p className="text-slate-500 font-medium italic">Monitor and resolve student queries across all subjects.</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="error" className="h-fit py-2 px-4 italic font-black text-xs shadow-lg shadow-red-500/10 transition-all">
            {stats.totalPending} UNRESOLVED
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Avg Feedback Time', value: `${stats.avgResponseMins || '--'} mins`, icon: Clock, color: 'text-amber-500' },
           { label: 'Total Resolved', value: stats.totalResolved.toString(), icon: CheckCircle2, color: 'text-emerald-600' },
           { label: 'Daily Query Rate', value: stats.dailyRate || '--', icon: MessageSquare, color: 'text-primary' },
           { label: 'Pending Active', value: stats.totalPending.toString(), icon: AlertCircle, color: 'text-red-500' },
         ].map((stat, i) => (
           <Card key={i} className="flex items-center gap-4 border-none shadow-sm shadow-slate-200/50">
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



      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h3 className="text-sm font-black text-slate-900 italic uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Responses
           </h3>
           
           <div className="space-y-4">
              {loading ? (
                 <div className="py-10 text-center text-slate-400"><Loader2 size={24} className="animate-spin mx-auto text-primary" /></div>
              ) : unresolvedDoubts.length === 0 ? (
                 <div className="py-10 text-center text-slate-400 border border-dashed rounded-3xl p-10 font-medium italic text-sm border-slate-200 bg-slate-50 flex flex-col items-center">
                    <CheckCircle2 size={32} className="mb-2 text-emerald-400" /> All queries caught up!
                 </div>
              ) : unresolvedDoubts.map((doubt) => (
                <Card key={doubt._id} className="p-0 overflow-hidden group hover:border-amber-200 transition-all border-l-4 border-l-amber-500 shadow-sm relative">
                   {sendingId === doubt._id && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                       <Loader2 size={32} className="animate-spin text-amber-500" />
                     </div>
                   )}
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center italic font-black text-slate-400">
                               {doubt.studentId?.name ? doubt.studentId.name[0] : '?'}
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">{doubt.studentId?.name || 'Unknown Student'}</h4>
                               <p className="text-[10px] font-bold text-slate-400 italic">Class: {doubt.studentId?.class || 'N/A'} | {new Date(doubt.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className="italic">{doubt.subject}</Badge>
                            <button onClick={() => handleForceResolve(doubt._id)} className="text-[10px] uppercase font-black tracking-widest text-emerald-500 hover:text-white bg-emerald-50 hover:bg-emerald-500 transition-all px-2 py-1 rounded-md" title="Force Mark Resolved">✓</button>
                         </div>
                      </div>
                      <p className="text-sm font-black font-serif text-slate-800 italic leading-relaxed mb-6">
                         "{doubt.question}"
                      </p>
                      
                      {/* Replies thread logic if there are previous admin replies but still pending */}
                      {doubt.replies && doubt.replies.length > 0 && (
                        <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <p className="text-[10px] font-black tracking-tighter uppercase text-slate-400 mb-2">Ongoing Thread</p>
                           {doubt.replies.map((reply: any, idx: number) => (
                             <div key={idx} className={cn("text-xs font-medium italic p-2 rounded-lg", reply.authorRole === 'admin' ? "bg-amber-100/50 text-amber-900" : "bg-white text-slate-600 border border-slate-100")}>
                                <span className="font-black not-italic text-[10px] block mb-0.5 opacity-50 uppercase tracking-tight">{reply.authorName}</span>
                                {reply.text}
                             </div>
                           ))}
                        </div>
                      )}

                      <div className="flex gap-3">
                         <input 
                           type="text" 
                           placeholder="Type your explanation & auto-resolve..." 
                           className="flex-1 bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 px-4 py-3 rounded-2xl text-xs font-bold italic outline-none transition-all"
                           value={replyInputs[doubt._id] || ''}
                           onChange={(e) => handleReplyChange(doubt._id, e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSendReply(doubt._id)}
                         />
                         <Button onClick={() => handleSendReply(doubt._id)} className="h-12 w-12 rounded-2xl p-0 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600">
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

           <div className="space-y-4 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
              {loading ? (
                <div className="py-4 text-center text-slate-400 text-xs italic">Loading history...</div>
              ) : resolvedDoubts.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs italic">No resolutions traced.</div>
              ) : resolvedDoubts.map((doubt) => (
                <Card key={doubt._id} className="p-0 overflow-hidden border-l-4 border-l-emerald-500 bg-slate-50/50 shadow-sm border border-slate-100">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black italic text-slate-400">
                               {doubt.studentId?.name ? doubt.studentId.name[0] : '?'}
                            </div>
                            <h4 className="text-xs font-black text-slate-700 italic">{doubt.studentId?.name || 'Unknown'}</h4>
                         </div>
                         <Badge variant="success" className="text-[8px] italic">{doubt.subject}</Badge>
                      </div>
                      <p className="text-xs font-medium italic text-slate-500 mb-4 truncate">"{doubt.question}"</p>
                      
                      {doubt.replies && doubt.replies.length > 0 && (
                        <div className="p-3 bg-white rounded-xl border border-slate-100 italic space-y-1 shadow-sm">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                             <CheckCircle2 size={10} /> Final Response
                           </p>
                           <p className="text-[10px] font-medium text-slate-600 line-clamp-3">{doubt.replies[doubt.replies.length - 1]?.text}</p>
                        </div>
                      )}
                      
                   </div>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

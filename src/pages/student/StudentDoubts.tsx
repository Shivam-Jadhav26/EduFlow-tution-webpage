import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Search, Plus, Clock, CheckCircle2, Send, Loader2, XCircle, AlertCircle, CornerDownRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentDoubts = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ subject: '', question: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doubts');
      setDoubts(res.data.data.doubts || []);
    } catch (err) {
      console.error('Failed to fetch doubts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleReply = async (doubtId: string) => {
    if (!replyText.trim()) return;
    try {
      setSendingReplyId(doubtId);
      await api.post(`/doubts/${doubtId}/reply`, { text: replyText });
      setReplyText('');
      await fetchDoubts();
      // Re-select if currently open
      if (selected?._id === doubtId) {
        const updatedRes = await api.get('/doubts');
        const updatedDoubt = (updatedRes.data.data.doubts || []).find((d: any) => d._id === doubtId);
        if (updatedDoubt) setSelected(updatedDoubt);
      }
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleRaiseDoubt = async () => {
    if (!newDoubt.subject || !newDoubt.question) return;
    try {
      setSubmitting(true);
      await api.post('/doubts', newDoubt);
      setShowModal(false);
      setNewDoubt({ subject: '', question: '' });
      setActiveTab('pending'); // Auto-switch to pending to see the new doubt
      fetchDoubts();
    } catch (err) {
      console.error('Failed to raise doubt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredDoubts = doubts.filter(d => d.status === activeTab && (
    d.subject?.toLowerCase().includes(search.toLowerCase()) ||
    d.question?.toLowerCase().includes(search.toLowerCase())
  ));

  const formatDate = (dStr: string) => new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Raise Doubt Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black italic text-slate-900">Raise a New Doubt</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-2 block">Subject</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:border-amber-400 focus:ring-amber-500/10 transition-all bg-slate-50"
                  placeholder="e.g. Mathematics, Physics"
                  value={newDoubt.subject}
                  onChange={e => setNewDoubt({ ...newDoubt, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-2 block">Your Question</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:border-amber-400 focus:ring-amber-500/10 transition-all min-h-[140px] resize-none bg-slate-50"
                  placeholder="Describe your doubt in detail..."
                  value={newDoubt.question}
                  onChange={e => setNewDoubt({ ...newDoubt, question: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" className="flex-1 rounded-xl font-bold italic" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl font-black italic bg-amber-500 shadow-lg shadow-amber-500/20 hover:bg-amber-600" onClick={handleRaiseDoubt} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Doubt'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Ask an Expert</h1>
          <p className="text-slate-500 font-medium italic">Get verified answers from top educators to clarify your concepts.</p>
        </div>
        <Button className="gap-2 font-black italic h-12 px-6 rounded-2xl shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Raise a Doubt
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-200">
        <div className="flex gap-8 px-2">
          {[
            { id: 'pending', label: 'Pending Responses' },
            { id: 'resolved', label: 'Resolved History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as 'pending' | 'resolved'); setSelected(null); }}
              className={cn(
                "pb-4 text-sm font-black transition-all relative italic uppercase tracking-widest",
                activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="studentDoubtTab" className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />}
            </button>
          ))}
        </div>
        <div className="relative md:w-72 bottom-2">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your doubts..."
            className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-slate-50"
          />
        </div>
      </div>

      {/* Doubts Grid */}
      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={40} className="animate-spin mb-4 text-amber-500" />
            <p className="font-bold italic">Syncing doubts database...</p>
          </div>
        ) : filteredDoubts.length > 0 ? filteredDoubts.map((doubt) => (
          <Card
            key={doubt._id}
            className={cn(
              "cursor-pointer transition-all hover:border-amber-200 overflow-hidden relative",
              selected?._id === doubt._id ? "border-amber-300 shadow-xl shadow-amber-500/10 ring-4 ring-amber-50" : "shadow-sm",
              doubt.status === 'resolved' && "border-l-4 border-l-emerald-500",
              doubt.status === 'pending' && "border-l-4 border-l-amber-500"
            )}
            onClick={() => setSelected(selected?._id === doubt._id ? null : doubt)}
          >
            <div className="p-2">
              <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="italic bg-white">{doubt.subject}</Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {formatDate(doubt.createdAt)}
                  </span>
                </div>
                <Badge variant={doubt.status === 'resolved' ? 'success' : 'warning'} className="uppercase italic text-[10px] tracking-widest">
                  {doubt.status}
                </Badge>
              </div>
              <p className="text-base font-bold text-slate-800 italic leading-relaxed mb-4">{doubt.question}</p>
              
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                  <MessageSquare size={12} className={doubt.replies?.length > 0 ? "text-primary" : "text-slate-400"} /> 
                  {doubt.replies?.length || 0} REPLIES
                </span>
                
                {doubt.status === 'resolved' && doubt.replies?.length > 0 && (
                  <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                    <CheckCircle2 size={10} /> RESOLVED BY ADMIN
                  </span>
                )}
              </div>

              {/* Chat Thread Expansion */}
              {selected?._id === doubt._id && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-4 duration-300 relative" onClick={e => e.stopPropagation()}>
                  
                  {sendingReplyId === doubt._id && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                       <Loader2 size={32} className="animate-spin text-amber-500" />
                     </div>
                  )}

                  {doubt.replies?.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {doubt.replies.map((reply: any, i: number) => {
                        const isAdmin = reply.authorRole === 'admin';
                        return (
                          <div key={i} className={cn("flex gap-3", isAdmin ? "justify-start" : "justify-end")}>
                            {isAdmin && <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20"><CheckCircle2 size={16} /></div>}
                            <div className={cn("p-4 rounded-2xl max-w-[85%] text-sm font-medium", isAdmin ? "bg-slate-50 border border-slate-200 rounded-tl-none" : "bg-amber-100/50 border border-amber-200 text-amber-950 rounded-tr-none")}>
                              {isAdmin && <p className="font-black text-slate-900 italic mb-1 uppercase tracking-tighter text-[10px]">{reply.authorName} <span className="text-slate-400 opacity-50 ml-1">ADMIN</span></p>}
                              <p className={cn(isAdmin ? "text-slate-700" : "text-amber-900")}>{reply.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-6 flex flex-col items-center">
                       <MessageSquare size={24} className="text-slate-300 mb-2" />
                       <p className="text-sm font-medium italic text-slate-400">No replies yet. An educator will respond shortly.</p>
                    </div>
                  )}
                  
                  {/* Reply Input */}
                  <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <CornerDownRight size={16} className="text-slate-400 ml-2 shrink-0" />
                    <input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleReply(doubt._id)}
                      placeholder={doubt.status === 'resolved' ? "Add a follow-up to re-open?" : "Type your reply..."}
                      className="flex-1 bg-transparent px-2 py-2 text-sm font-bold italic outline-none text-slate-700"
                    />
                    <Button 
                      className="rounded-xl font-black italic px-4 h-10 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 overflow-hidden" 
                      onClick={() => handleReply(doubt._id)}
                      disabled={!replyText.trim()}
                    >
                      <Send size={16} className={cn(!replyText.trim() && "opacity-50")} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )) : (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
            {activeTab === 'pending' ? <AlertCircle size={48} className="text-amber-200 mb-4" /> : <CheckCircle2 size={48} className="text-emerald-200 mb-4" />}
            <h3 className="text-lg font-black italic text-slate-900 mb-1">
              {activeTab === 'pending' ? 'All Caught Up!' : 'No History Found'}
            </h3>
            <p className="font-medium italic text-slate-400 max-w-xs leading-snug">
              {activeTab === 'pending' 
                ? "You don't have any pending doubts right now. Excellent work!" 
                : "Once your queries are resolved by educators, they'll appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

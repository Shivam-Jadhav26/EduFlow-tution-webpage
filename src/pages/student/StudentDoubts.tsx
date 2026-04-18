import { useState, useEffect } from 'react';
import { MessageSquare, Search, Plus, Clock, CheckCircle2, Send, Loader2, XCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentDoubts = () => {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ subject: '', question: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const filtered = doubts.filter(d =>
    d.subject?.toLowerCase().includes(search.toLowerCase()) ||
    d.question?.toLowerCase().includes(search.toLowerCase())
  );

  const handleReply = async (doubtId: string) => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/doubts/${doubtId}/reply`, { text: replyText });
      setReplyText('');
      fetchDoubts();
    } catch (err) {
      console.error('Reply failed:', err);
    }
  };

  const handleRaiseDoubt = async () => {
    if (!newDoubt.subject || !newDoubt.question) return;
    try {
      setSubmitting(true);
      await api.post('/doubts', newDoubt);
      setShowModal(false);
      setNewDoubt({ subject: '', question: '' });
      fetchDoubts();
    } catch (err) {
      console.error('Failed to raise doubt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Raise Doubt Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black italic text-slate-900">Raise a New Doubt</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Subject</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Mathematics"
                  value={newDoubt.subject}
                  onChange={e => setNewDoubt({ ...newDoubt, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Your Question</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
                  placeholder="Describe your doubt in detail..."
                  value={newDoubt.question}
                  onChange={e => setNewDoubt({ ...newDoubt, question: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl font-bold italic" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl font-black italic shadow-lg shadow-primary/20" onClick={handleRaiseDoubt} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Doubt'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Doubt Resolution</h1>
          <p className="text-slate-500 font-medium italic">Ask questions and get verified answers from our top educators.</p>
        </div>
        <Button className="gap-2 font-black italic h-12 px-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Raise a Doubt
        </Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search doubts by subject or question..."
          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-20 flex justify-center"><Loader2 size={40} className="text-primary animate-spin" /></div>
        ) : filtered.length > 0 ? filtered.map((doubt) => (
          <Card
            key={doubt._id}
            className={cn("cursor-pointer transition-all hover:border-primary/20", selected?._id === doubt._id && "border-primary/30 bg-primary/5")}
            onClick={() => setSelected(selected?._id === doubt._id ? null : doubt)}
          >
            <div className="flex justify-between items-start mb-3">
              <Badge variant="outline" className="italic">{doubt.subject}</Badge>
              <Badge variant={doubt.status === 'resolved' ? 'success' : 'warning'} className="uppercase italic text-[10px]">{doubt.status}</Badge>
            </div>
            <p className="text-sm font-bold text-slate-900 italic leading-relaxed line-clamp-3 mb-4">{doubt.question}</p>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(doubt.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><MessageSquare size={10} /> {doubt.replies?.length || 0} replies</span>
            </div>

            {selected?._id === doubt._id && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4" onClick={e => e.stopPropagation()}>
                {doubt.replies?.length > 0 && (
                  <div className="space-y-3">
                    {doubt.replies.map((reply: any, i: number) => (
                      <div key={i} className={cn("p-3 rounded-xl text-xs font-medium", reply.authorRole === 'admin' ? "bg-primary/5 border border-primary/10" : "bg-slate-50")}>
                        <p className="font-black text-slate-900 italic mb-1">{reply.authorName} <span className="text-[10px] text-slate-400">({reply.authorRole})</span></p>
                        <p className="text-slate-700">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Add a follow-up..."
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button size="sm" className="rounded-xl font-black italic px-4 shadow-lg shadow-primary/20" onClick={() => handleReply(doubt._id)}>
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )) : (
          <div className="col-span-2 py-16 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="font-black italic text-slate-400">No doubts raised yet. Click "Raise a Doubt" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

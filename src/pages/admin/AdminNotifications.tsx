import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, Calendar, Clock, Bell, 
  Search, Plus, MoreVertical, Trash2, 
  MessageSquare, UserCircle, CheckCircle, 
  AlertTriangle, Info, Globe, Loader2, XCircle, Rocket
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminNotifications = () => {
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Top Metrics
  const [alertsSummary, setAlertsSummary] = useState({
    feeOverdue: 0, lowAttendance: 0, testResults: 0
  });

  // Composer Modal State
  const [showModal, setShowModal] = useState(false);
  const [composing, setComposing] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetMode: 'global', // 'global' | 'class' | 'batch'
    targetValue: '' // stores either class number or batch _id
  });

  useEffect(() => {
    const initFetch = async () => {
      try {
        setLoading(true);
        const [notifRes, batchRes, alertsRes] = await Promise.all([
          api.get('/notifications'),
          api.get('/batches'),
          api.get('/notifications/alerts-summary')
        ]);
        
        const allNotifs = notifRes.data.data.notifications || [];
        setActiveNotifications(allNotifs.filter((n: any) => n.status === 'sent'));
        setDrafts(allNotifs.filter((n: any) => n.status === 'draft'));

        setBatches(batchRes.data.data.batches || []);
        if (alertsRes.data.data?.alerts) {
           setAlertsSummary(alertsRes.data.data.alerts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initFetch();
  }, [refetchTrigger]);

  const handleDelete = async (id: string, isDraft: boolean) => {
    if(!window.confirm(`Are you sure you want to permanently delete this ${isDraft ? 'draft' : 'broadcast'}?`)) return;
    try {
      await api.delete(`/notifications/${id}`);
      setRefetchTrigger(p => p+1);
    } catch(err) { alert("Failed to delete notification."); }
  };

  const publishDraft = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/status`, { status: "sent" });
      setRefetchTrigger(p => p+1);
    } catch(err) { alert("Failed to publish draft."); }
  };

  const handleBroadcast = async (statusArg: 'draft' | 'sent') => {
    if (!formData.title || !formData.message) return alert("Title and Message are required");
    setComposing(true);
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        status: statusArg
      };
      
      if (formData.targetMode === 'batch') payload.batchId = formData.targetValue;
      if (formData.targetMode === 'class') payload.targetClass = formData.targetValue;

      await api.post('/notifications', payload);
      setShowModal(false);
      setFormData({ title: '', message: '', type: 'info', targetMode: 'global', targetValue: '' });
      setRefetchTrigger(p => p+1);
    } catch (err: any) {
      alert("Broadcast failed: " + (err.response?.data?.message || err.message));
    } finally {
      setComposing(false);
    }
  };

  const openComposer = () => setShowModal(true);

  const getTargetLabel = (notif: any) => {
    if (notif.userId) return `User: ${notif.userId.name}`;
    if (notif.batchId) return `Batch: ${notif.batchId.name}`;
    if (notif.targetClass) return `Class ${notif.targetClass}`;
    return 'Global Broadcast';
  };

  const filteredNotifications = activeNotifications.filter(ann => 
    ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ann.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      {/* Broadcast Composer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 my-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black italic text-slate-900 flex items-center gap-2">
                   <Send size={20} className="text-primary" /> Composer Setup
                </h2>
                <p className="text-sm text-slate-500 font-medium italic">Define targets and push alerts instantly.</p>
              </div>
              <button disabled={composing} onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-5 flex-1">
              <Input 
                label="Alert Title" 
                placeholder="e.g. Weather Holiday" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 italic">Severity/Type</label>
                  <select 
                    className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="academic">Academic</option>
                    <option value="fee">Fee Reminder</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 italic">Target Network</label>
                  <select 
                    className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.targetMode}
                    onChange={(e) => setFormData({...formData, targetMode: e.target.value, targetValue: ''})}
                  >
                    <option value="global">Global (All Students)</option>
                    <option value="class">Specific Class</option>
                    <option value="batch">Specific Batch</option>
                  </select>
                </div>
              </div>

              {formData.targetMode === 'class' && (
                <div className="space-y-1.5 flex flex-col animate-in fade-in">
                  <label className="text-sm font-semibold text-slate-700 italic">Select Class</label>
                  <select 
                    className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                  >
                    <option value="" disabled>Choose a class...</option>
                    {['6', '7', '8', '9', '10', '11', '12'].map(c => <option key={c} value={c}>Class {c}th</option>)}
                  </select>
                </div>
              )}

              {formData.targetMode === 'batch' && (
                <div className="space-y-1.5 flex flex-col animate-in fade-in">
                  <label className="text-sm font-semibold text-slate-700 italic">Select Batch</label>
                  <select 
                    className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                  >
                    <option value="" disabled>Choose a batch...</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700 italic">Message Body</label>
                <textarea 
                  placeholder="Draft your announcement..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => handleBroadcast('draft')} disabled={composing}>Save as Draft</Button>
              <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => handleBroadcast('sent')} disabled={composing}>
                {composing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Secure Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic uppercase">Communications & Announcements</h1>
          <p className="text-slate-500 font-medium italic">Broadcast updates, schedule alerts, and manage institute notices.</p>
        </div>
        <Button className="gap-2 font-black italic rounded-xl h-12 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={openComposer}>
          <Plus size={18} /> Compose New
        </Button>
      </div>

      {/* Stats/Alerts Cards connected dynamically */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Fee Overdue', count: alertsSummary.feeOverdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Low Attendance', count: alertsSummary.lowAttendance, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Test Results Out', count: alertsSummary.testResults, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((alert, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all border-none group">
            <div className="flex items-center gap-4">
              <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", alert.bg, alert.color)}>
                <alert.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{alert.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-slate-900">{loading ? '-' : alert.count}</p>
                  <p className="text-[10px] text-slate-400 font-bold italic">Pending Alerts</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Announcements List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 italic flex items-center gap-2 uppercase">
              <Bell size={20} className="text-primary" /> Active Announcements
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search notices..." 
                className="bg-slate-100/50 border-none rounded-lg pl-9 pr-4 py-2 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-10"><Loader2 size={32} className="animate-spin text-primary" /></div>
            ) : filteredNotifications.length === 0 ? (
               <div className="bg-slate-50 border border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400 font-medium italic">
                 <Bell size={32} className="mb-4 text-slate-300" />
                 {searchTerm ? 'No broadcasts found matching your search.' : 'No active broadcasts in timeline.'}
               </div>
            ) : filteredNotifications.map((ann, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                key={ann._id}
                className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="success" className="text-[10px] uppercase font-black tracking-widest">
                      Broadcasted
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleString()}</span>
                  </div>
                  <button onClick={() => handleDelete(ann._id, false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2 italic group-hover:text-primary transition-colors underline decoration-slate-100 decoration-2 underline-offset-4">{ann.title}</h3>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed mb-6 whitespace-pre-wrap">{ann.message}</p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase italic">{getTargetLabel(ann)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase italic">{ann.type}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Panel - Drafts */}
        <div className="space-y-8">
          
          <Card title="Saved Drafts" description="Unpublished messages">
            <div className="space-y-3 pt-2">
              {loading ? <div className="text-center italic text-xs py-4">Loading drafts...</div> : drafts.length === 0 ? (
                <div className="text-center italic text-xs py-4 text-slate-400">No pending drafts manually saved.</div>
              ) : drafts.map((draft, i) => (
                <div key={draft._id} className="p-3 rounded-xl border border-dashed border-slate-200 hover:border-primary/20 transition-all cursor-pointer group">
                  <p className="text-xs font-bold text-slate-900 italic mb-1 truncate">{draft.title}</p>
                  <p className="text-[10px] font-medium text-slate-500 line-clamp-1 italic mb-2">"{draft.message}"</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 border-dashed">
                    <span className="text-[9px] font-medium text-slate-400 italic">Saved {new Date(draft.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                       <button onClick={() => handleDelete(draft._id, true)} className="p-1 px-2 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
                         <Trash2 size={12} />
                       </button>
                       <button onClick={() => publishDraft(draft._id)} className="p-1 px-2 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 font-black text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1">
                         <Rocket size={12} /> Publish
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Broadcast Tip */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Send size={80} /></div>
            <h4 className="text-lg font-black italic mb-2">Mass Broadcast</h4>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-4">Send emergency alerts or reminders to all registered parents and students instantly.</p>
            <Button onClick={openComposer} className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black italic rounded-xl px-0 h-10 shadow-lg shadow-black/10">Start Broadcast</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

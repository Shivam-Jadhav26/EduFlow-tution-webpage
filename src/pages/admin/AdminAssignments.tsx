import { useState, useEffect } from 'react';
import { FileText, Plus, XCircle, ExternalLink, Loader2, Trash2, BookOpen } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminAssignments = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'sources'>('assignments');
  const [data, setData] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    dueDate: '',
    batchId: '',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);

  // Separate Effect for Batches to ensure they are always fetched
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/batches');
        setBatches(res.data.data.batches || []);
      } catch (error) {
        console.error('Failed to fetch batches from real database', error);
      }
    };
    fetchBatches();
  }, []);

  // Effect for main Data (Assignments or Sources)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = activeTab === 'assignments' ? '/assignments' : '/sources';
        const res = await api.get(endpoint);
        
        if (activeTab === 'assignments') {
          setData(res.data.data.assignments || []);
        } else {
          setData(res.data.data.sources || []);
        }
      } catch (error: any) {
        console.error(`Failed to fetch ${activeTab}`, error);
        // If 404, the user might see an empty list but the app won't crash
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refetchTrigger, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    try {
      setIsSubmitting(true);
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('subject', formData.subject);
      
      if (activeTab === 'assignments') {
        formDataObj.append('dueDate', formData.dueDate);
        if (formData.batchId) formDataObj.append('batchId', formData.batchId);
        formDataObj.append('pdf', file);
      } else {
        formDataObj.append('description', formData.description);
        if (formData.batchId) formDataObj.append('batch', formData.batchId);
        formDataObj.append('file', file);
      }

      const endpoint = activeTab === 'assignments' ? '/assignments' : '/sources';
      await api.post(endpoint, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowForm(false);
      setFormData({ title: '', subject: '', dueDate: '', batchId: '', description: '' });
      setFile(null);
      setRefetchTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Submit failed', error);
      alert(error.response?.data?.message || 'Failed to upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await api.delete(`/sources/${id}`);
      setRefetchTrigger(prev => prev + 1);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Academic Records</h1>
          <p className="text-slate-500 font-medium italic">Manage homework assignments and study materials.</p>
        </div>
        <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New {activeTab === 'assignments' ? 'Assignment' : 'Material'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('assignments')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-black italic transition-all",
            activeTab === 'assignments' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-black italic transition-all",
            activeTab === 'sources' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Study Materials
        </button>
      </div>

      {showForm && (
        <Card className="p-6 border-primary/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black italic text-slate-900">
              {activeTab === 'assignments' ? 'Create Assignment' : 'Upload Study Material'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900">
              <XCircle size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Title</label>
                <input required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g., Chapter 1 Algebra" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Subject</label>
                <input required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="E.g., Mathematics" />
              </div>
              
              {activeTab === 'assignments' ? (
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Due Date</label>
                  <input required type="date" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Description (Optional)</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief notes on this material" />
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Target Batch (Dropdown from DB)</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})}>
                  <option value="">All Students (Global)</option>
                  {batches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.class})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Document (PDF/PPT/DOC)</label>
                <input required type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="outline" className="font-bold italic" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="font-black italic shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {isSubmitting ? 'Uploading...' : `Upload ${activeTab === 'assignments' ? 'Assignment' : 'Material'}`}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">{activeTab === 'assignments' ? 'Assignment' : 'Material'}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">{activeTab === 'assignments' ? 'Due Date' : 'Uploaded'}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Batch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Actions</th>
              </tr>
            </thead>
            <tbody className="relative min-h-[200px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" /> Loading...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex flex-col justify-center items-center",
                          activeTab === 'assignments' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {activeTab === 'assignments' ? <FileText size={20} /> : <BookOpen size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</p>
                          <p className="text-xs text-slate-500 font-medium italic">{item.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600">
                        {new Date(activeTab === 'assignments' ? item.dueDate : item.createdAt).toLocaleDateString()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 italic">
                      {(activeTab === 'assignments' ? item.batchId?.name : item.batch?.name) || 'All Students'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <a href={activeTab === 'assignments' ? item.pdfUrl : item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 opacity-80 hover:opacity-100">
                          <ExternalLink size={16} /> View
                        </a>
                        {activeTab === 'sources' && (
                          <button onClick={() => handleDeleteSource(item._id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500 font-medium italic">
                    No {activeTab} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

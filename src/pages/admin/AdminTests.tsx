import { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Filter, Plus, 
  MoreVertical, Calendar, Clock, BarChart3,
  CheckCircle2, AlertCircle, Trash2, Edit2, Play,
  Users, Loader2, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminTests = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'draft'>('upcoming');
  const [tests, setTests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTests, setLoadingTests] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Submissions Modal State
  const [showSubModal, setShowSubModal] = useState(false);
  const [activeTestForSub, setActiveTestForSub] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tests/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [refetchTrigger]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoadingTests(true);
        const res = await api.get(`/tests?status=${activeTab}`);
        setTests(res.data.data.tests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, [activeTab, refetchTrigger]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test permanently?')) return;
    try {
      await api.delete(`/tests/${id}`);
      setRefetchTrigger(p => p + 1);
    } catch(err) {
      alert("Failed to delete test");
    }
  };

  const openSubmissions = async (test: any) => {
    setActiveTestForSub(test);
    setShowSubModal(true);
    setLoadingSubs(true);
    try {
      const res = await api.get(`/tests/${test._id}/submissions`);
      setSubmissions(res.data.data.submissions || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load submissions");
    } finally {
      setLoadingSubs(false);
    }
  };

  const formatDate = (dStr: string) => new Date(dStr).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  const formatTime = (dStr: string) => new Date(dStr).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Submissions Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 my-8 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h2 className="text-xl font-black italic text-slate-900">Manage Submissions</h2>
                <p className="text-sm text-slate-500 font-medium italic">Test: {activeTestForSub?.title}</p>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {loadingSubs ? (
                <div className="flex flex-col items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : submissions.length === 0 ? (
                <div className="text-center p-10 text-slate-400 font-medium italic">No students have submitted this test yet.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400 italic">
                      <th className="pb-3 px-2">Student</th>
                      <th className="pb-3 px-2">Score</th>
                      <th className="pb-3 px-2">Submitted On</th>
                      <th className="pb-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <tr key={sub._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2">
                           <div className="font-black italic text-slate-900">{sub.studentId?.name || 'Unknown'}</div>
                           <div className="text-[10px] text-slate-500 uppercase">{sub.studentId?.class}</div>
                        </td>
                        <td className="py-4 px-2">
                           <div className="font-black text-emerald-600">{sub.score} <span className="text-slate-400">/ {sub.totalMarks}</span></div>
                        </td>
                        <td className="py-4 px-2 text-xs font-bold text-slate-600">{formatDate(sub.submittedAt)} at {formatTime(sub.submittedAt)}</td>
                        <td className="py-4 px-2">
                          <Badge variant="primary" className="text-[10px] uppercase">{sub.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Test Management</h1>
          <p className="text-slate-500 font-medium italic">Create, schedule and monitor assessments for all grades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold border-slate-200" onClick={() => setRefetchTrigger(p => p+1)}>
            <BarChart3 size={18} /> Refresh Analytics
          </Button>
          <Link to="/admin/tests/create">
            <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
              <Plus size={18} /> Create New Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary to-teal-700 text-white border-none relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-white/20 p-2 rounded-lg"><ClipboardList size={24} /></div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none italic">Active</Badge>
          </div>
          <h3 className="text-3xl font-black mb-1 relative z-10">
            {loadingStats ? <Loader2 size={24} className="animate-spin" /> : stats?.totalPublished || 0}
          </h3>
          <p className="text-white/70 text-sm font-bold uppercase tracking-tighter italic relative z-10">Total Tests Published</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-white/20 p-2 rounded-lg"><CheckCircle2 size={24} /></div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none italic">Global</Badge>
          </div>
          <h3 className="text-3xl font-black mb-1 relative z-10">
            {loadingStats ? <Loader2 size={24} className="animate-spin" /> : stats?.totalSubmissions || 0}
          </h3>
          <p className="text-white/70 text-sm font-bold uppercase tracking-tighter italic relative z-10">Total Submissions Received</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-white/20 p-2 rounded-lg"><AlertCircle size={24} /></div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none italic">Attention</Badge>
          </div>
          <h3 className="text-3xl font-black mb-1 relative z-10">
            {loadingStats ? <Loader2 size={24} className="animate-spin" /> : stats?.evaluationPending || 0}
          </h3>
          <p className="text-white/70 text-sm font-bold uppercase tracking-tighter italic relative z-10">Drafts Pending</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        {[
          { id: 'upcoming', label: 'Upcoming Tests' },
          { id: 'completed', label: 'Completed' },
          { id: 'draft', label: 'Drafts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative italic uppercase tracking-widest",
              activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="testTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loadingTests ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20 text-slate-400 font-bold italic">
            <Loader2 size={40} className="animate-spin text-primary mb-4" />
            Loading Tests Database...
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20 text-slate-400 font-bold italic bg-slate-50 border border-dashed rounded-3xl">
            <ClipboardList size={40} className="text-slate-300 mb-4" />
            No {activeTab} tests found.
          </div>
        ) : tests.map((test) => (
          <Card key={test._id} className="p-0 overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-[10px] uppercase font-bold">{test.subject}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 border-slate-200 underline">
                      {test.class ? `Class ${test.class}` : test.targetBatches[0]?.name || 'All'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{test.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all text-slate-300" onClick={() => handleDelete(test._id)}><Trash2 size={16} /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <Calendar size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{formatDate(test.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <Clock size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{formatTime(test.date)} ({test.duration}m)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <ClipboardList size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{test.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <BarChart3 size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{test.totalMarks} Marks</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 italic">
                   Status: <span className="uppercase tracking-widest text-primary">{test.status}</span>
                </div>
                {test.status !== 'draft' && (
                  <Button size="sm" variant="outline" className="rounded-full gap-2 border-primary/20 text-primary italic font-bold hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => openSubmissions(test)}>
                    Manage Submissions <Plus size={14} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {/* Create Card placeholder */}
        <Link to="/admin/tests/create" className="group h-full">
          <Card className="h-full flex flex-col items-center justify-center border-dashed border-2 p-12 hover:border-primary/50 hover:bg-primary/5 transition-all text-center min-h-[300px]">
            <div className="bg-primary/10 p-4 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2 italic underline decoration-primary/30">Create New Assessment</h4>
            <p className="text-sm text-slate-500 max-w-xs italic">Schedule a weekly quiz, board-pattern test or a daily practice set.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

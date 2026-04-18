import { useState } from 'react';
import { 
  ClipboardList, Search, Filter, Plus, 
  MoreVertical, Calendar, Clock, BarChart3,
  CheckCircle2, AlertCircle, Trash2, Edit2, Play,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const AdminTests = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'draft'>('upcoming');

  const upcomingTests = [
    { id: 't1', title: 'Algebra Weekly Quiz', subject: 'Mathematics', class: '10th', batch: 'Morning Elite', date: 'May 20, 2024', time: '04:00 PM', duration: '60m', qs: 30 },
    { id: 't2', title: 'Periodic Table Basics', subject: 'Science', class: '9th', batch: 'All Batches', date: 'May 21, 2024', time: '05:30 PM', duration: '45m', qs: 25 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Test Management</h1>
          <p className="text-slate-500 font-medium italic">Create, schedule and monitor assessments for all grades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold border-slate-200">
            <BarChart3 size={18} /> Global Analytics
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
        <Card className="bg-gradient-to-br from-primary to-teal-700 text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg"><ClipboardList size={24} /></div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none italic">Monthly</Badge>
          </div>
          <h3 className="text-3xl font-black mb-1">42</h3>
          <p className="text-white/70 text-sm font-bold uppercase tracking-tighter italic">Total Tests Published</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg"><CheckCircle2 size={24} /></div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none italic">Success</Badge>
          </div>
          <h3 className="text-3xl font-black mb-1">86%</h3>
          <p className="text-white/70 text-sm font-bold uppercase tracking-tighter italic">Avg. Student Attendance</p>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg"><AlertCircle size={24} /></div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none italic">Attention</Badge>
          </div>
          <h3 className="text-3xl font-black mb-1">08</h3>
          <p className="text-white/70 text-sm font-bold uppercase tracking-tighter italic">Evaluation Pending</p>
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
        {upcomingTests.map((test) => (
          <Card key={test.id} className="p-0 overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-[10px] uppercase font-bold">{test.subject}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 border-slate-200 underline">Class {test.class}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{test.title}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100"><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <Calendar size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{test.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <Clock size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{test.time} ({test.duration})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <ClipboardList size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{test.qs} Questions</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <Users size={16} className="shrink-0" />
                  <span className="text-xs font-bold">{test.batch}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">S{i}</div>
                  ))}
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-900 border-none flex items-center justify-center text-[10px] font-bold text-white">+82</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full gap-1 border-primary/20 text-primary italic font-bold hover:bg-primary hover:text-white transition-all">
                  Manage Submissions <BarChart3 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Create Card placeholder */}
        <Link to="/admin/tests/create" className="group">
          <Card className="h-full flex flex-col items-center justify-center border-dashed border-2 p-12 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
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

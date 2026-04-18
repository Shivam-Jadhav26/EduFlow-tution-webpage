import { motion } from 'motion/react';
import { 
  Send, Calendar, Clock, Bell, 
  Search, Plus, MoreVertical, Trash2, 
  MessageSquare, UserCircle, CheckCircle, 
  AlertTriangle, Info, Globe
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const recentAnnouncements = [
  {
    id: 1,
    title: 'Summer Vacation Schedule',
    content: 'The institute will remain closed from May 20th to June 5th for summer holidays. Enjoy your break!',
    target: 'All Students',
    date: '1h ago',
    type: 'Holiday',
    status: 'Sent',
    views: 124,
  },
  {
    id: 2,
    title: 'Mock Test - Mathematics',
    content: 'A comprehensive mock test for Class 10th Geometry will be conducted this Sunday at 10:00 AM.',
    target: 'Class 10',
    date: '4h ago',
    type: 'Academic',
    status: 'Scheduled',
    views: 0,
  },
  {
    id: 3,
    title: 'New Physics Faculty Joinings',
    content: 'We are excited to welcome Dr. H.C. Ray as our new Senior Physics Mentor. Sessions start next Monday.',
    target: 'All Classes',
    date: 'Yesterday',
    type: 'Update',
    status: 'Sent',
    views: 89,
  },
];

const automatedAlerts = [
  { label: 'Fee Overdue', count: 12, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Low Attendance', count: 8, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Test Results Out', count: 1, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export const AdminNotifications = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic uppercase">Communications & Announcements</h1>
          <p className="text-slate-500 font-medium italic">Broadcast updates, schedule alerts, and manage institute notices.</p>
        </div>
        <Button className="gap-2 font-black italic rounded-xl h-12 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Plus size={18} /> Compose New
        </Button>
      </div>

      {/* Stats/Alerts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {automatedAlerts.map((alert, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all border-none group">
            <div className="flex items-center gap-4">
              <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", alert.bg, alert.color)}>
                <alert.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{alert.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-slate-900">{alert.count}</p>
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
              />
            </div>
          </div>

          <div className="space-y-4">
            {recentAnnouncements.map((ann, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={ann.id}
                className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden"
              >
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  ann.status === 'Sent' ? "bg-emerald-500" : "bg-amber-500"
                )} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={ann.status === 'Sent' ? 'success' : 'warning'} className="text-[10px] uppercase font-black tracking-widest">
                      {ann.status}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ann.date}</span>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2 italic group-hover:text-primary transition-colors underline decoration-slate-100 decoration-2 underline-offset-4">{ann.title}</h3>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed mb-6">"{ann.content}"</p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <UserCircle size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase italic">{ann.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase italic">{ann.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-black">{ann.views} Views</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Panel - Quick Settings & Drafts */}
        <div className="space-y-8">
          <Card title="Quick Channels" description="Configure where notices go">
            <div className="space-y-4 pt-2">
              {[
                { name: 'App Notification', status: true },
                { name: 'SMS Alerts', status: true },
                { name: 'WhatsApp Bot', status: false },
                { name: 'Email Newsletter', status: true },
              ].map((channel, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 group cursor-pointer hover:bg-slate-100/50 transition-all">
                  <span className="text-xs font-bold text-slate-700 italic">{channel.name}</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors p-1",
                    channel.status ? "bg-emerald-500" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full transition-transform",
                      channel.status ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Drafts" description="Unpublished messages">
            <div className="space-y-3 pt-2">
              {[
                { title: 'Update on Fees Structure...', time: 'Saved 2d ago' },
                { title: 'Parent Teacher Meeting...', time: 'Saved 5d ago' },
              ].map((draft, i) => (
                <div key={i} className="p-3 rounded-xl border border-dashed border-slate-200 hover:border-primary/20 transition-all cursor-pointer group">
                  <p className="text-xs font-bold text-slate-900 italic mb-1 truncate">{draft.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-medium text-slate-400 italic font-medium">{draft.time}</span>
                    <Trash2 size={12} className="text-slate-300 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs font-bold text-primary mt-2">View All Drafts</Button>
            </div>
          </Card>

          {/* Broadcast Tip */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Send size={80} /></div>
            <h4 className="text-lg font-black italic mb-2">Mass Broadcast</h4>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-4">Send emergency alerts or reminders to all registered parents and students instantly.</p>
            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black italic rounded-xl px-0 h-10">Start Broadcast</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

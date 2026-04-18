import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Info, AlertTriangle, CreditCard, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/me');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      setMarkingId(id);
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      if (unreadIds.length === 0) return;
      
      await Promise.all(unreadIds.map(id => api.patch(`/notifications/${id}/read`)));
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'test': return { icon: ClipboardList, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'fee': return { icon: CreditCard, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'warning': return { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      default: return { icon: Info, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  const formatDate = (dStr: string) => new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Latest Updates</h1>
          <p className="text-slate-500 font-medium italic">Stay informed about your classes, tests, and fees.</p>
        </div>
        <div className="flex gap-2">
          {hasUnread && (
            <Button 
              variant="ghost" 
              className="text-xs font-black italic rounded-xl text-slate-500 hover:text-primary transition-all" 
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
          <Button variant="outline" className="text-xs font-black italic rounded-xl border-slate-200">Settings</Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400">
             <Loader2 size={40} className="animate-spin text-primary mb-4" />
             <p className="font-bold italic">Loading your alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
             <Bell size={40} className="text-slate-300 mb-4" />
             <h3 className="font-black italic text-lg text-slate-900 mb-1">No Updates Logged</h3>
             <p className="font-medium italic">You are currently fully caught up with the network.</p>
          </div>
        ) : (
          notifications.map((notification, index) => {
            const styles = getTypeStyles(notification.type);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={notification._id}
                className={cn(
                  "group relative border p-6 rounded-3xl transition-all hover:shadow-xl hover:shadow-slate-200/50",
                  notification.isRead ? "bg-white border-slate-100" : "bg-white border-primary/20 shadow-lg shadow-primary/5"
                )}
              >
                {!notification.isRead && (
                   <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.8)]" />
                )}

                <div className="flex gap-6">
                  <div className={cn("p-4 rounded-2xl shrink-0 h-fit transition-transform group-hover:scale-105", styles.bg, styles.text)}>
                    <styles.icon size={28} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={cn("text-lg font-black italic transition-colors leading-tight mb-1", notification.isRead ? "text-slate-800" : "text-slate-900 group-hover:text-primary")}>
                          {notification.title}
                        </h4>
                        <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">{formatDate(notification.date || notification.createdAt)}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-600 italic leading-relaxed pt-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                      {!notification.isRead && (
                        <Button 
                          variant="secondary" 
                          className="h-9 text-[10px] font-black italic uppercase tracking-widest px-4 rounded-xl"
                          onClick={() => handleMarkRead(notification._id)}
                          disabled={markingId === notification._id}
                        >
                          {markingId === notification._id ? <Loader2 size={12} className="animate-spin" /> : 'Mark Read'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {!loading && notifications.length > 0 && (
        <div className="text-center py-10 flex flex-col items-center">
          <CheckCircle2 size={24} className="text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-400 italic">No more notifications. You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

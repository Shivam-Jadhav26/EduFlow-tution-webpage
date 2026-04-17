import { motion } from 'motion/react';
import { Bell, Info, AlertTriangle, CreditCard, ClipboardList, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import { notifications } from '../../data/mockData';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const StudentNotifications = () => {
  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'test': return { icon: ClipboardList, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'fee': return { icon: CreditCard, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'warning': return { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      default: return { icon: Info, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Latest Updates</h1>
          <p className="text-slate-500 font-medium italic">Stay informed about your classes, tests, and fees.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-xs font-black italic rounded-xl text-slate-500 hover:text-primary">Mark all as read</Button>
          <Button variant="outline" className="text-xs font-black italic rounded-xl border-slate-200">Settings</Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification, index) => {
          const styles = getTypeStyles(notification.type);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={notification.id}
              className={cn(
                "group relative border p-6 rounded-3xl transition-all hover:shadow-xl hover:shadow-slate-200/50",
                notification.isRead ? "bg-white border-slate-100" : "bg-white border-primary/20 shadow-lg shadow-primary/5"
              )}
            >
              {!notification.isRead && (
                 <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}

              <div className="flex gap-6">
                <div className={cn("p-4 rounded-2xl shrink-0 h-fit", styles.bg, styles.text)}>
                  <styles.icon size={28} />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 italic group-hover:text-primary transition-colors">{notification.title}</h4>
                      <p className="text-xs font-black italic text-slate-400 uppercase tracking-widest">{notification.date}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-600 italic leading-relaxed pt-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-4 pt-4">
                    <Button variant="secondary" className="h-9 text-[10px] font-black italic uppercase tracking-widest px-4 rounded-xl">View Details</Button>
                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center py-10">
        <p className="text-sm font-bold text-slate-400 italic">No more notifications. You're all caught up!</p>
      </div>
    </div>
  );
};

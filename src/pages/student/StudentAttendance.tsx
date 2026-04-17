import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { attendance } from '../../data/mockData';

export const StudentAttendance = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 italic">Attendance Tracking</h1>
        <p className="text-slate-500 font-medium italic">Monitor your consistency and punctuality in classes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Attendance Rate" className="text-center">
            <p className="text-4xl font-black text-primary mb-2">92%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Current Month</p>
        </Card>
        <Card title="Classes Attended" className="text-center">
            <p className="text-4xl font-black text-slate-900 mb-2">24/26</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Class Sessions</p>
        </Card>
        <Card title="Avg. Punctuality" className="text-center">
            <p className="text-4xl font-black text-emerald-600 mb-2">98%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">On-Time Arrival</p>
        </Card>
      </div>

      <Card title="Recent Logs" description="Your attendance history for the past 10 days">
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                        <CalendarDays size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{log.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={log.status === 'present' ? 'success' : log.status === 'late' ? 'warning' : 'error'}>
                      {log.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-slate-500 italic">
                      <Clock size={12} />
                      <span className="text-xs font-medium">{log.status === 'absent' ? '--' : '03:55 PM'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                     <div className="flex items-center gap-2 text-slate-500 italic">
                      <MapPin size={12} />
                      <span className="text-xs font-medium">Room 302</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

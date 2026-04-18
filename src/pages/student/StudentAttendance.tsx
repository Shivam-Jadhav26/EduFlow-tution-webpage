import { useState, useEffect } from 'react';
import { CalendarDays, BookOpen, Clock, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import api from '../../services/api';

interface AttendanceLog {
  _id: string;
  date: string;
  status: string;
  subject?: string;
  batchId?: {
    _id: string;
    name: string;
  };
}

interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  percentage: number;
}

export const StudentAttendance = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        api.get('/attendance/stats/me'),
        api.get('/attendance')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (logsRes.data.success) {
        setLogs(logsRes.data.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const classesAttended = stats ? stats.present + stats.late : 0;
  const totalClasses = stats ? stats.total : 0;
  const punctuality = (stats && classesAttended > 0) 
    ? Math.round((stats.present / classesAttended) * 100) 
    : 0;
  const attendanceRate = stats ? stats.percentage : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 italic">Attendance Tracking</h1>
        <p className="text-slate-500 font-medium italic">Monitor your consistency and punctuality in classes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Attendance Rate" className="text-center">
            <p className="text-4xl font-black text-primary mb-2">{attendanceRate}%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Overall</p>
        </Card>
        <Card title="Classes Attended" className="text-center">
            <p className="text-4xl font-black text-slate-900 mb-2">{classesAttended}/{totalClasses}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Class Sessions</p>
        </Card>
        <Card title="Avg. Punctuality" className="text-center">
            <p className="text-4xl font-black text-emerald-600 mb-2">{punctuality}%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">On-Time Arrival</p>
        </Card>
      </div>

      <Card title="Recent Logs" description="Your detailed attendance history">
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.slice(0, 15).map((log) => (
                  <tr key={log._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                          <CalendarDays size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={log.status === 'present' ? 'success' : log.status === 'late' ? 'warning' : 'error'}>
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-500 italic">
                        <BookOpen size={12} />
                        <span className="text-xs font-medium">{log.subject || '--'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                       <div className="flex items-center gap-2 text-slate-500 italic">
                        <Clock size={12} />
                        <span className="text-xs font-medium">{log.batchId?.name || '--'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-500 font-medium">
                    No attendance logs found.
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

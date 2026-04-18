import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Clock, Search, 
  Filter, Download, Calendar, ArrowUpRight, 
  MoreVertical, ShieldAlert, Loader2, Save
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminAttendance = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{[key: string]: string}>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/attendance/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refetchTrigger]);

  const openMarkAttendance = async (batch: any) => {
    try {
      setSelectedBatch(batch);
      setShowModal(true);
      setModalLoading(true);
      
      // Fetch students
      const stuRes = await api.get('/students');
      const allStudents = stuRes.data.data.students || [];
      const filtered = allStudents.filter((s:any) => s.batch && (s.batch._id === batch._id || s.batch === batch._id));
      setBatchStudents(filtered);
      
      // Fetch today's records for this batch
      const today = new Date().toISOString().split('T')[0];
      const attRes = await api.get(`/attendance?batchId=${batch._id}&date=${today}`);
      const existing = attRes.data.data.attendance || [];
      
      const recordMap: {[key: string]: string} = {};
      filtered.forEach((stu:any) => {
        const found = existing.find((e:any) => e.studentId._id === stu._id);
        recordMap[stu._id] = found ? found.status : 'present'; // Default mapping
      });
      setAttendanceRecords(recordMap);
      
    } catch (err) {
      console.error(err);
      alert("Failed to load batch data");
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      const records = batchStudents.map(stu => ({
        studentId: stu._id,
        batchId: selectedBatch._id,
        date: today,
        status: attendanceRecords[stu._id],
        subject: ''
      }));
      
      await api.post('/attendance', { records });
      setShowModal(false);
      setRefetchTrigger(prev => prev + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
       setSaving(false);
    }
  };

  const updateRecord = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({...prev, [studentId]: status}));
  };

  const markAllPresent = () => {
    const updated: {[key: string]: string} = {};
    batchStudents.forEach(stu => { updated[stu._id] = 'present' });
    setAttendanceRecords(updated);
  };

  const exportCSV = () => {
    if(!data) return;
    const headers = ['Batch', 'Class', 'Present', 'Absent', 'Late'];
    const rows = data.dailySummary.map((b:any) => [b.batch, b.class, b.present, b.absent, b.late]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 bg-red-50/50 rounded-3xl border border-red-100">
        <ShieldAlert size={48} className="text-red-400" />
        <h2 className="text-xl font-black italic text-red-900">Connection Interrupted</h2>
        <p className="text-red-500 font-medium italic text-center max-w-md">Failed to load attendance dashboard data. If you recently updated the backend code, please try restarting your backend terminal!</p>
        <Button className="mt-4 shadow-lg shadow-black/5" onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  const { todayStats, dailySummary, lowAttendanceStudents } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Mark Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 my-8 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex-1">
                <h2 className="text-xl font-black italic text-slate-900">Mark Attendance</h2>
                <div className="flex justify-between items-center mr-4">
                  <p className="text-sm text-slate-500 font-medium italic">Batch: {selectedBatch?.batch}</p>
                  <Button variant="outline" className="h-8 text-[10px] px-3 font-black uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={markAllPresent}>
                    Mark All Present
                  </Button>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 ml-2"><XCircle size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : batchStudents.length === 0 ? (
                <div className="text-center p-10 text-slate-400 font-medium italic">No students assigned to this batch.</div>
              ) : (
                batchStudents.map(stu => (
                  <div key={stu._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-black italic">
                        {stu.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black italic text-slate-900">{stu.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{stu.phone || 'No Phone'}</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {(['present', 'late', 'absent']).map(stat => (
                        <button 
                          key={stat}
                          onClick={() => updateRecord(stu._id, stat)}
                          className={cn(
                            "px-4 py-2 text-xs font-black italic rounded-lg transition-all capitalize",
                            attendanceRecords[stu._id] === stat 
                              ? (stat === 'present' ? 'bg-emerald-500 text-white shadow-sm' : stat === 'absent' ? 'bg-red-500 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm')
                              : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          {stat}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 shrink-0">
              <Button variant="outline" className="flex-1 rounded-xl font-bold italic" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl font-black italic shadow-lg shadow-primary/20 gap-2" onClick={handleSaveAttendance} disabled={saving || modalLoading}>
                {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Attendance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Attendance Audit</h1>
          <p className="text-slate-500 font-medium italic">Monitor real-time student presence and generate compliance reports.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black italic rounded-xl h-12 px-6" onClick={exportCSV}>
            <Download size={18} /> Export CSV
          </Button>
          <Button className="gap-2 font-black italic rounded-xl h-12 px-6" onClick={() => setRefetchTrigger(prev => prev + 1)}>
            <Calendar size={18} /> Refresh Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Today Presence', value: todayStats.presence, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Unexcused Absences', value: todayStats.unexcused, icon: ShieldAlert, color: 'text-red-500' },
          { label: 'Late Joiners', value: todayStats.late, icon: Clock, color: 'text-amber-600' },
          { label: 'Pending Audit', value: todayStats.auditsPending + ' Batches', icon: Filter, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col items-center text-center py-6">
             <div className={cn("p-3 rounded-2xl bg-slate-50 mb-4", stat.color)}>
                <stat.icon size={28} />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{stat.label}</p>
             <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card title="Today's Batch Attendance" description="Overview of student presence across all active sessions">
              <div className="space-y-6 mt-6">
                 {dailySummary.length === 0 && <p className="text-center text-slate-400 italic font-medium p-4">No active batches right now.</p>}
                 {dailySummary.map((batch: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 hover:border-primary/20 transition-all group overflow-hidden">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white italic font-black text-lg shrink-0">
                           {batch.class.substring(0,2)}
                        </div>
                        <div className="min-w-0 pr-4">
                           <h4 className="font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors truncate">{batch.batch}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest truncate">Schedule: Active</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                         <div className="text-center">
                            <p className="text-sm font-black text-emerald-600 italic leading-none mb-1">{batch.present}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Present</p>
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-black text-red-500 italic leading-none mb-1">{batch.absent}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
                         </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-sm font-black text-amber-500 italic leading-none mb-1">{batch.late}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Late</p>
                         </div>
                         <Button variant="ghost" onClick={() => openMarkAttendance(batch)} className="p-2 h-auto text-slate-300 hover:text-primary transition-all bg-slate-50 rounded-xl hover:bg-primary/10">
                            <ArrowUpRight size={20} />
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="space-y-8">
           <Card title="Attendance Alerts" description="Students falling below 75% threshold">
              <div className="space-y-4">
                 {lowAttendanceStudents.length === 0 && <p className="text-center text-slate-400 italic font-medium p-4">All students are attending perfectly!</p>}
                 {lowAttendanceStudents.map((stu: any) => (
                   <div key={stu.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-black italic text-slate-400 text-[10px]">
                          {stu.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 italic leading-tight">{stu.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 italic">Class: {stu.class}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <Badge variant={stu.status === 'Critical' ? 'error' : 'warning'} className="italic mb-1">{stu.rate}</Badge>
                         <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter italic hover:text-primary cursor-pointer transition-colors">Notify Parent</p>
                      </div>
                   </div>
                 ))}
                 <Button className="w-full h-12 rounded-xl font-black italic bg-red-500 text-white hover:bg-red-600 mt-4 shadow-lg shadow-red-500/20">Send Collective Alerts</Button>
              </div>
           </Card>

           <Card title="Monthly Trends" className="bg-slate-900 border-none text-white">
              <div className="space-y-4 italic">
                 <p className="text-sm font-medium text-slate-400 italic">"Average attendance is up by <span className="text-emerald-400 font-black">4.2%</span> compared to last month."</p>
                 <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>Physical</span>
                       <span>84%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[84%]" />
                    </div>
                 </div>
                 <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>Test Days</span>
                       <span>96%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[96%]" />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

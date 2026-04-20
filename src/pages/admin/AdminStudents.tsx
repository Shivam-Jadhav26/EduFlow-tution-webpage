import { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, MoreHorizontal, 
  Trash2, Edit, Eye, Download, Users,
  CheckCircle, XCircle, Clock, Loader2, AlertCircle, FileText
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ active: 0, pending: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [batches, setBatches] = useState<any[]>([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialForm = {
    name: '', email: '', password: '', gender: '', class: '', batch: '', phone: '', parentName: '', parentPhone: '', status: 'active', fees: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    api.get('/batches').then(res => setBatches(res.data.data.batches || [])).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const [studentsRes, statsRes] = await Promise.all([
          api.get('/students', {
            params: {
              page,
              search: searchTerm,
              limit: 10
            }
          }),
          api.get('/students/stats')
        ]);
        
        const { students = [], pagination = { total: 0, pages: 1 } } = studentsRes.data.data || {};
        const statsData = statsRes.data.data || { active: 0, pending: 0, inactive: 0 };
        
        setStudents(students);
        setTotalPages(pagination.pages);
        setTotalCount(pagination.total);
        setStats(statsData);
      } catch (err: any) {
        console.error('Failed to fetch students:', err);
        setError('Could not load student list.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchStudents, searchTerm ? 500 : 0);
    return () => clearTimeout(debounceTimer);
  }, [page, searchTerm, refetchTrigger]);

  const handleExport = () => {
    if (!students || students.length === 0) return;
    const headers = ['Name', 'Email', 'Class', 'Batch', 'Status', 'Phone', 'Parent Name', 'Parent Phone'];
    const csvContent = [
      headers.join(','),
      ...students.map(s => 
        [s.name, s.email, s.class, s.batch?.name || 'Unassigned', s.status, s.phone || '', s.parentName || '', s.parentPhone || ''].map(v => `"${v}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_export_${new Date().getTime()}.csv`;
    link.click();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setRefetchTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Delete failed', err);
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const openForm = (student?: any) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        name: student.name || '',
        email: student.email || '',
        password: '', // Leave blank for edit unless changing
        gender: student.gender || '',
        class: student.class || '',
        batch: student.batch?._id || '',
        phone: student.phone || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        status: student.status || 'active',
        fees: student.fees !== undefined && student.fees !== null ? student.fees : ''
      });
    } else {
      setSelectedStudent(null);
      setFormData(initialForm);
    }
    setShowStudentForm(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const dataToSubmit = {
        ...formData,
        fees: formData.fees === '' ? null : Number(formData.fees)
      };
      if (selectedStudent) {
        await api.put(`/students/${selectedStudent._id}`, dataToSubmit);
      } else {
        await api.post('/students', dataToSubmit);
      }
      setShowStudentForm(false);
      setRefetchTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Save failed', err);
      alert(err.response?.data?.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Active Students', val: stats.active.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Invitations', val: stats.pending.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Inactive/Withdrawn', val: stats.inactive.toString(), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Modals */}
      {showStudentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic text-slate-900">{selectedStudent ? 'Edit Student' : 'Enroll New Student'}</h2>
              <button onClick={() => setShowStudentForm(false)} className="text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Full Name</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Student Name" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Email</label>
                <input type="email" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@example.com" />
              </div>
              {!selectedStudent && (
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Password</label>
                  <input type="password" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Required for new students" />
                </div>
              )}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Phone</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Gender</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Class/Grade</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}>
                  <option value="">Select Class</option>
                  {[6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Batch</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.batch} 
                  onChange={e => {
                    const selectedBatchId = e.target.value;
                    const selectedBatch = batches.find(b => b._id === selectedBatchId);
                    setFormData(prev => ({
                      ...prev, 
                      batch: selectedBatchId,
                      fees: selectedBatch ? selectedBatch.defaultFees : prev.fees
                    }));
                  }}
                >
                  <option value="">Unassigned</option>
                  {batches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.class})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Agreed Fees (₹)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.fees} 
                  onChange={e => setFormData({...formData, fees: e.target.value})} 
                  placeholder="e.g. 500" 
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Parent Name</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="Parent Full Name" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Parent Phone</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} placeholder="Emergency Contact" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 italic mb-1 block">Status</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-xl font-bold italic" onClick={() => setShowStudentForm(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl font-black italic shadow-lg shadow-primary/20" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 -z-10" />
            <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
            <div className="flex items-center gap-4 mt-4">
              <img 
                src={selectedStudent.gender === 'female' 
                  ? `https://avatar.iran.liara.run/public/girl?username=${selectedStudent.name}` 
                  : selectedStudent.gender === 'male'
                  ? `https://avatar.iran.liara.run/public/boy?username=${selectedStudent.name}`
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} 
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-slate-50" 
              />
              <div>
                <h2 className="text-2xl font-black italic text-slate-900">{selectedStudent.name}</h2>
                <p className="text-sm text-slate-500 font-medium">{selectedStudent.email}</p>
                <Badge variant={selectedStudent.status === 'active' ? 'success' : selectedStudent.status === 'pending' ? 'warning' : 'error'} className="mt-2 text-[10px] uppercase italic">{selectedStudent.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 italic">Class</p>
                <p className="text-sm font-bold text-slate-800">{selectedStudent.class || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 italic">Batch</p>
                <p className="text-sm font-bold text-slate-800">{selectedStudent.batch?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 italic">Phone</p>
                <p className="text-sm font-bold text-slate-800">{selectedStudent.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 italic">Joined</p>
                <p className="text-sm font-bold text-slate-800">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 mt-2">
                <p className="text-[10px] font-black uppercase text-slate-400 italic">Parent Info</p>
                <p className="text-sm font-bold text-slate-800">{selectedStudent.parentName || 'N/A'} • {selectedStudent.parentPhone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Student Directory</h1>
          <p className="text-slate-500 font-medium italic">Manage and track student profiles, academic status, and enrollment.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 font-bold border-slate-200" 
            onClick={() => {
              const csvContent = "Name,Email,Password,Class,Batch,Phone,ParentName,ParentPhone,Gender\nJohn Doe,john@example.com,EduFlow@123,10,Morning Elite,+1234567890,Jane Doe,+1234567891,male";
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = "student_import_template.csv";
              link.click();
            }}
          >
            <Download size={18} /> Template
          </Button>
          <div className="relative">
            <input 
              type="file" 
              className="hidden" 
              id="student-import-file" 
              accept=".csv,.xlsx,.xls"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                  setLoading(true);
                  const res = await api.post('/students/import', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  alert(res.data.message);
                  setRefetchTrigger(prev => prev + 1);
                } catch (err: any) {
                  console.error('Import failed', err);
                  alert(err.response?.data?.message || 'Failed to import students');
                } finally {
                  setLoading(false);
                  e.target.value = ''; // Reset input
                }
              }}
            />
            <Button 
              variant="outline" 
              className="gap-2 font-bold border-slate-200" 
              onClick={() => document.getElementById('student-import-file')?.click()}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />} Import 
            </Button>
          </div>
          <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => openForm()}>
            <Plus size={18} /> Enroll New Student
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-4 md:p-4">
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters and Table */}
      <Card className="p-0 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-80 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID or email..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl italic hover:bg-white text-xs font-bold border-slate-200">
              <Filter size={14} className="mr-2" /> Class: All
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl italic hover:bg-white text-xs font-bold border-slate-200">
              <Filter size={14} className="mr-2" /> Batch: All
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Student Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Class/Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Batch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Actions</th>
              </tr>
            </thead>
            <tbody className="relative min-h-[400px]">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">Loading student database...</p>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((std) => (
                  <tr key={std._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={std.gender === 'female' 
                            ? `https://avatar.iran.liara.run/public/girl?username=${std.name}` 
                            : std.gender === 'male'
                            ? `https://avatar.iran.liara.run/public/boy?username=${std.name}`
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.name}`} 
                          className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-slate-100 bg-slate-50" 
                          alt={std.name}
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{std.name}</p>
                          <p className="text-xs text-slate-500 font-medium italic">{std.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600 bg-white">Class {std.class}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 italic">
                      {std.batch?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={std.status === 'active' ? 'success' : std.status === 'pending' ? 'warning' : 'error'}
                        className="text-[10px] uppercase italic"
                      >
                        {std.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-primary" onClick={() => { setSelectedStudent(std); setShowViewModal(true); }}><Eye size={16} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-emerald-600" onClick={() => openForm(std)}><Edit size={16} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-red-600" onClick={() => handleDelete(std._id)}><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 inline-block">
                      <Users className="text-slate-300 w-12 h-12 mx-auto mb-2" />
                      <p className="text-slate-500 font-black italic">No students found matching your search.</p>
                      <Button variant="ghost" className="mt-2 text-primary font-bold" onClick={() => setSearchTerm('')}>Clear Search</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 italic uppercase">
            Showing {students.length} of {totalCount} students
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-8 px-4 font-bold disabled:opacity-30 border-slate-200" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-8 px-4 font-bold disabled:opacity-30 border-slate-200"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

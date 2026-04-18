import { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, MoreHorizontal, 
  Trash2, Edit, Eye, Download, Users,
  CheckCircle, XCircle, Clock, Loader2, AlertCircle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
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
  }, [page, searchTerm]);

  const statCards = [
    { label: 'Active Students', val: stats.active.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Invitations', val: stats.pending.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Inactive/Withdrawn', val: stats.inactive.toString(), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Student Directory</h1>
          <p className="text-slate-500 font-medium italic">Manage and track student profiles, academic status, and enrollment.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold border-slate-200">
            <Download size={18} /> Export List
          </Button>
          <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
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
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${std.name}`} 
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-primary"><Eye size={16} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-emerald-600"><Edit size={16} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-red-600"><Trash2 size={16} /></Button>
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

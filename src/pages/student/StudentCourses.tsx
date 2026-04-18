import { useState, useEffect } from 'react';
import { 
  BookOpen, Play, FileText, ChevronRight, 
  Search, Filter, Clock, Star, Download, Loader2 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentCourses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses', {
        params: { search: searchTerm, class: user?.class }
      });
      setCourses(response.data.data.courses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.class) {
        fetchCourses();
      } else if (user && !user.class) {
        // If somehow the user has no class, still fetch so it's not stuck loading forever
        fetchCourses(); 
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">My Enrolled Courses</h1>
          <p className="text-slate-500 font-medium italic">Access your learning materials and recorded lectures.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 w-64 shadow-sm focus-within:border-primary transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter subjects..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl shrink-0"
            onClick={() => alert("Filter functionality coming soon!")}
          >
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold italic">Loading your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
           <p className="text-slate-500 font-black italic">No courses found.</p>
           {searchTerm && <Button variant="secondary" className="mt-4" onClick={() => setSearchTerm('')}>Clear Search</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course._id} className="p-0 overflow-hidden group flex flex-col">
              <div className="relative aspect-video bg-slate-100">
                <img src={course.thumbnail || `https://api.dicebear.com/7.x/shapes/svg?seed=${course.title}`} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30 italic">
                    Class {course.class}
                  </Badge>
                </div>
                <button 
                  onClick={() => alert(`Starting lecture for ${course.title}...`)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl cursor-pointer"
                >
                  <Play size={24} fill="currentColor" />
                </button>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  {(course.subjects || []).slice(0, 2).map((s: string, idx: number) => (
                    <Badge key={idx} variant="primary" className="text-[10px] uppercase font-bold">{s}</Badge>
                  ))}
                  {(course.subjects || []).length > 2 && <span className="text-[10px] text-slate-400 font-bold">+{(course.subjects || []).length - 2} more</span>}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-slate-500 font-medium italic mb-6 line-clamp-2">"{course.description || 'No description available for this course.'}"</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-slate-700 italic">4.9 (2k Reviews)</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-1 rounded-lg italic"
                    onClick={() => alert(`Opening modules for ${course.title}...`)}
                  >
                    View Modules <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Study Materials & Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <Card title="Quick Resources" description="Download latest notes and assignments">
          <div className="space-y-3 pt-2">
            {[
              { name: 'Physics Chapter 4 - Atomic Structure', size: '2.4 MB', type: 'PDF' },
              { name: 'Weekly Maths Worksheet - Polynomials', size: '1.1 MB', type: 'PDF' },
              { name: 'Grammar Handbook 2024', size: '5.8 MB', type: 'EPUB' },
              { name: 'Periodic Table Chart', size: '800 KB', type: 'JPG' },
            ].map((file, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/20 transition-all cursor-pointer group italic"
                onClick={() => alert(`Starting download for ${file.name}...`)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 dark:text-slate-200">{file.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{file.type} • {file.size}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 group-hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Starting download for ${file.name}...`);
                  }}
                >
                  <Download size={18} />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Video Lectures" description="Continue where you left off">
          <div className="space-y-4 pt-2">
            {[
              { title: 'Algebra Concept Refresher', duration: '45 mins', sub: 'Mathematics', prog: 65, date: 'May 18' },
              { title: 'Force and Laws of Motion', duration: '1.2 hrs', sub: 'Physics', prog: 30, date: 'May 16' },
            ].map((v, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-600/30 transition-all group cursor-pointer italic"
                onClick={() => alert(`Resuming lecture: ${v.title}...`)}
              >
                <div className="flex gap-4">
                  <div className="relative h-20 w-32 shrink-0 rounded-lg bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/vid${i}/300/200`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center group-hover:bg-slate-900/40 transition-colors">
                      <Play size={20} className="text-white fill-white shadow-sm scale-90 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{v.title}</h4>
                      <Badge variant="secondary" className="text-[9px] shrink-0 uppercase">{v.sub}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mb-3">{v.duration} • Uploaded {v.date}</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${v.prog}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

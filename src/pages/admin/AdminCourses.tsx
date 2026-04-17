import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Search, MoreVertical, Edit2, Trash2, Layers, Tag, Bookmark, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/courses', {
          params: { search: searchTerm }
        });
        setCourses(response.data.data.courses);
      } catch (err: any) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCourses, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const stats = [
    { label: 'Active Courses', value: courses.length, icon: Bookmark, color: 'text-primary' },
    { label: 'Total Subjects', value: courses.reduce((acc, c) => acc + (c.subjects?.length || 0), 0), icon: Tag, color: 'text-indigo-600' },
    { label: 'Classes Covered', value: new Set(courses.map(c => c.class)).size, icon: Layers, color: 'text-emerald-600' },
    { label: 'Resources', value: '240+', icon: BookOpen, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Course Catalog Management</h1>
          <p className="text-slate-500 font-medium italic">Define curriculum, set pricing, and manage subject modules.</p>
        </div>
        <Button className="gap-2 font-black italic rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
          <Plus size={18} /> Add New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <Card key={i} className="flex items-center gap-4 border-none shadow-sm shadow-slate-200/50">
              <div className={cn("p-3 rounded-xl bg-slate-50", stat.color)}>
                 <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses by title or description..." 
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold italic focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && courses.length === 0 ? (
        <div className="py-20 text-center">
          <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold italic">Browsing catalog...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 rounded-[2rem] border border-red-100 italic font-bold text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ scale: 1.01 }}
              className="group bg-white rounded-3xl border border-slate-100 p-4 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all"
            >
              <div className="md:w-48 h-48 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100">
                 <img 
                    src={course.thumbnail || `https://api.dicebear.com/7.x/shapes/svg?seed=${course.title}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={course.title} 
                 />
                 <div className="absolute top-3 left-3">
                    <Badge variant="primary" className="shadow-lg shadow-black/20">{course.class} CLASS</Badge>
                 </div>
              </div>

              <div className="flex-1 flex flex-col pt-2">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                   <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <MoreVertical size={20} />
                   </button>
                </div>
                <p className="text-sm font-medium text-slate-500 italic mb-4 line-clamp-2">"{course.description}"</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                   {(course.subjects || []).map((sub: string) => (
                     <span key={sub} className="text-[10px] font-bold italic text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-lg">
                        {sub}
                     </span>
                   ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4">
                   <div className="flex -space-x-2">
                      {[
                        { name: 'Dr. Vivek' },
                        { name: 'Ms. Sonia' },
                      ].map((instructor, i) => (
                        <img 
                          key={i} 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.name}`} 
                          className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 shadow-sm" 
                          alt={instructor.name}
                        />
                      ))}
                      <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-black italic text-slate-500">+1</div>
                   </div>
                   
                   <div className="flex gap-2">
                     <Button variant="outline" className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-colors">
                        <Edit2 size={16} />
                     </Button>
                     <Button variant="outline" className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500/20 transition-colors">
                        <Trash2 size={16} />
                     </Button>
                     <Button variant="secondary" className="h-9 text-[10px] font-black italic uppercase tracking-widest px-6 rounded-xl">Batch Assign</Button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
          {courses.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
               <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-500 font-black italic">No courses found matching your search.</p>
               <Button variant="secondary" className="mt-4" onClick={() => setSearchTerm('')}>Browse All</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { FileText, Calendar, ExternalLink, Loader2, BookOpen, GraduationCap, FileIcon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentAssignments = () => {
  const [activeTab, setActiveTab] = useState<'homework' | 'materials'>('homework');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = activeTab === 'homework' ? '/assignments/my' : '/sources';
        const res = await api.get(endpoint);
        
        if (activeTab === 'homework') {
          setItems(res.data.data.assignments || []);
        } else {
          setItems(res.data.data.sources || []);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'doc': return <FileIcon className="text-blue-500" />;
      case 'ppt': return <GraduationCap className="text-orange-500" />;
      default: return <FileText className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Academic Resources</h1>
          <p className="text-slate-500 font-medium italic">Your hub for homework assignments and study materials.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('homework')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-black italic transition-all",
            activeTab === 'homework' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Homework
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-black italic transition-all",
            activeTab === 'materials' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Study Materials
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-500 font-bold italic">Loading {activeTab}...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item._id} className="p-5 flex flex-col hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 -rotate-12 group-hover:scale-110 group-hover:opacity-10 transition-all pointer-events-none">
                {activeTab === 'homework' ? <FileText size={80} /> : <BookOpen size={80} />}
              </div>
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  activeTab === 'homework' ? "bg-orange-100 text-orange-600 group-hover:bg-orange-200" : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                )}>
                  {activeTab === 'homework' ? <FileText size={24} /> : getFileIcon(item.fileType)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
                  <Badge variant="outline" className="text-[10px] mt-1 bg-white dark:bg-slate-800 truncate max-w-[150px]">{item.subject}</Badge>
                </div>
              </div>
              
              {activeTab === 'homework' ? (
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-600 dark:text-slate-400 font-medium italic relative z-10">
                  <Calendar size={16} className="text-primary" />
                  <span>Due: <strong className="text-slate-900 dark:text-slate-200">{new Date(item.dueDate).toLocaleDateString()}</strong></span>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-6 line-clamp-2 relative z-10 italic">
                  {item.description || 'No description provided.'}
                </p>
              )}
              
              <div className="mt-auto relative z-10">
                <a href={activeTab === 'homework' ? item.pdfUrl : item.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full gap-2 font-bold italic shadow-lg shadow-primary/10">
                    <ExternalLink size={18} /> {activeTab === 'homework' ? 'View PDF' : 'Download Material'}
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white italic mb-2">
            No {activeTab === 'homework' ? 'Assignments' : 'Materials'} Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">Everything up to date! Check back later for new updates.</p>
        </Card>
      )}
    </div>
  );
};

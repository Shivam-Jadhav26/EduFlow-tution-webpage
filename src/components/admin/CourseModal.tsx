import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData: any | null;
}

const getOrdinal = (n: number) => {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
};

export const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subjects: [] as string[],
    thumbnail: ''
  });
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        class: initialData.class || '',
        subjects: initialData.subjects || [],
        thumbnail: initialData.thumbnail || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        class: '',
        subjects: [],
        thumbnail: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black italic text-slate-900">
            {initialData ? 'Edit Course' : 'Create New Course'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Course Title</label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Class 10 - Board Intensive"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief course overview..."
              className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none italic"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Class</label>
              <select
                value={formData.class}
                onChange={e => setFormData({...formData, class: e.target.value})}
                required
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-50 italic"
              >
                <option value="" disabled>Select Class...</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={`${num}`}>{num}{getOrdinal(num).slice(-2)} Grade</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Thumbnail URL (Optional)</label>
              <Input 
                value={formData.thumbnail} 
                onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase italic px-1">Subjects</label>
            <div className="flex gap-2">
              <Input 
                value={newSubject} 
                onChange={e => setNewSubject(e.target.value)} 
                placeholder="Add subject (e.g. Maths)"
                className="rounded-xl"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
              />
              <Button type="button" onClick={handleAddSubject} className="rounded-xl h-11 px-4">
                <Plus size={20} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.subjects.map(subject => (
                <span 
                  key={subject} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold italic"
                >
                  {subject}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {formData.subjects.length === 0 && (
                <p className="text-[10px] text-slate-400 italic font-bold">No subjects added yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white z-10">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="italic font-bold rounded-xl h-11 px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 italic font-black text-white shadow-lg shadow-primary/20 rounded-xl h-11 px-8">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Send, AlertCircle, 
  ChevronLeft, Settings, BrainCircuit,
  PlusCircle, Loader2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const AdminCreateTest = () => {
  const navigate = useNavigate();
  
  const [batches, setBatches] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    totalMarks: 50,
    targetBatches: [] as string[]
  });

  const [questions, setQuestions] = useState([
    { id: Date.now(), text: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/batches');
        setBatches(res.data.data.batches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const handleChange = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));

  const toggleBatch = (id: string) => {
    setFormData(prev => ({
      ...prev,
      targetBatches: prev.targetBatches.includes(id) 
        ? prev.targetBatches.filter(b => b !== id)
        : [...prev.targetBatches, id]
    }));
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };
  
  const updateOption = (qId: number, oIdx: number, val: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOpts = [...q.options];
        newOpts[oIdx] = val;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };
  
  const updateCorrectAnswer = (qId: number, oIdx: number) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctAnswer: oIdx } : q));
  };

  const handleSmartGenerate = () => {
    const newQs = [
      { id: Date.now() + 1, text: "What is the degree of the polynomial 4x^3 + 2x^2 - x + 5?", options: ["1", "2", "3", "4"], correctAnswer: 2 },
      { id: Date.now() + 2, text: "Factorize: x^2 - 5x + 6", options: ["(x-2)(x-3)", "(x+2)(x+3)", "(x-1)(x-6)", "(x+1)(x-6)"], correctAnswer: 0 },
      { id: Date.now() + 3, text: "The roots of the equation x^2 - 4 = 0 are:", options: ["2, -2", "4, -4", "0, 4", "Only 2"], correctAnswer: 0 },
      { id: Date.now() + 4, text: "If the discriminant of a quadratic equation is zero, the roots are:", options: ["Real and distinct", "Real and equal", "Complex and distinct", "None of the above"], correctAnswer: 1 },
      { id: Date.now() + 5, text: "What is the sum of the roots of the equation 2x^2 - 8x + 6 = 0?", options: ["2", "4", "3", "-4"], correctAnswer: 1 },
    ];
    setQuestions(prev => prev[0].text === '' ? newQs : [...prev, ...newQs]);
  };

  const handleSave = async (status: 'draft' | 'upcoming') => {
    try {
      if (!formData.title || !formData.subject) {
         return alert("Please fill title and subject fields.");
      }
      
      const incompleteQ = questions.find(q => !q.text || q.options.some(o => !o));
      if (incompleteQ) {
         if(!window.confirm("Some questions or options are entirely empty. Proceed anyway?")) return;
      }

      setSaving(true);
      const finalDate = new Date(`${formData.date}T${formData.time}`).toISOString();
      const payload = {
        title: formData.title,
        subject: formData.subject,
        date: finalDate,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        targetBatches: formData.targetBatches,
        questions: questions.map(q => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        status
      };
      
      await api.post('/tests', payload);
      navigate('/admin/tests');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/tests">
            <Button variant="ghost" size="icon" className="rounded-xl"><ChevronLeft size={24} /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic">Create Assessment</h1>
            <p className="text-slate-500 font-medium italic">Design a board-pattern or custom MCQ test.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold border-slate-200" onClick={() => handleSave('draft')} disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save as Draft
          </Button>
          <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => handleSave('upcoming')} disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Publish Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Questions */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Test Details" description="Configure basic information and logic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Test Title" 
                placeholder="e.g. Weekly Quiz on Polynomials" 
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700 italic">Subject</label>
                <select 
                  className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Duration (Mins)" 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                />
                <Input 
                  label="Total Marks" 
                  type="number" 
                  value={formData.totalMarks}
                  onChange={(e) => handleChange('totalMarks', e.target.value)}
                />
              </div>

            </div>
          </Card>

          {/* Question Builder */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-lg font-black text-slate-900 italic flex items-center gap-2">
                Questions Builder <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{questions.length}</span>
              </h3>
              <Button variant="secondary" size="sm" className="gap-2 rounded-full font-bold h-8" onClick={addQuestion}>
                <PlusCircle size={16} /> Add Question
              </Button>
            </div>

            {questions.map((q, idx) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-visible group border-slate-200 shadow-sm hover:border-primary/30 transition-all">
                  <div className="absolute -left-3 top-6 bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-xl z-10 rotate-[-4deg]">
                    {idx + 1}
                  </div>
                  <div className="space-y-6 pl-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <textarea 
                          placeholder="Enter question scenario or text here..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium italic focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
                          value={q.text}
                          onChange={(e) => updateQuestionText(q.id, e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-300 hover:text-red-500"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={cn(
                          "flex items-center gap-3 p-2 rounded-lg border transition-all",
                          q.correctAnswer === oIdx ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-slate-300"
                        )}>
                          <input 
                            type="radio" 
                            name={`correct-${q.id}`} 
                            checked={q.correctAnswer === oIdx}
                            onChange={() => updateCorrectAnswer(q.id, oIdx)}
                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 shrink-0"
                            title="Mark as correct answer"
                          />
                          <input 
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 bg-transparent border-none rounded-sm px-2 py-1 text-sm font-semibold focus:ring-0 focus:outline-none"
                            value={opt}
                            onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            <Button 
              variant="outline" 
              className="w-full h-16 border-dashed border-2 rounded-2xl gap-3 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 italic font-bold"
              onClick={addQuestion}
            >
              <PlusCircle size={24} /> New Blank Question
            </Button>
          </div>
        </div>

        {/* Right Column: Settings & Smart Assistant */}
        <div className="space-y-8">
          <Card title="AI Smart Generator" description="Generate high-quality questions instantly">
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2 text-primary font-black text-sm mb-3">
                  <BrainCircuit size={18} /> Smart Assist
                </div>
                <p className="text-xs text-slate-600 font-medium italic mb-4 leading-relaxed">
                  I can auto-populate standard board-pattern questions for 'Polynomials' mapped to medium difficulty arrays.
                </p>
                <Button size="sm" className="w-full gap-2 rounded-xl font-black italic shadow-md" onClick={handleSmartGenerate}>
                  Generate 5 MCQ <Plus size={16} />
                </Button>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 italic">
                <h4 className="text-xs font-black text-indigo-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                  <Settings size={14} /> Difficulty Balance
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant="success" className="justify-center">30% Easy</Badge>
                  <Badge variant="warning" className="justify-center">50% Med</Badge>
                  <Badge variant="error" className="justify-center">20% Hard</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Publish Settings" description="Choose target and timing">
            <div className="space-y-4 pt-2">
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Target Specific Batches</label>
                {loadingBatches ? (
                   <div className="text-xs italic text-slate-400">Loading active batches...</div>
                ) : batches.length === 0 ? (
                   <div className="text-xs italic text-slate-400">No active batches available.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {batches.map(b => (
                      <button 
                        key={b._id} 
                        onClick={() => toggleBatch(b._id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-black transition-all uppercase border",
                          formData.targetBatches.includes(b._id)
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/50"
                        )}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Scheduled Date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
                <Input 
                  label="Start Time" 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-slate-500 font-semibold italic">Students explicitly selected via batches will be evaluated.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

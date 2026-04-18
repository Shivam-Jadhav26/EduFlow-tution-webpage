import { useState } from 'react';
import { 
  Plus, Trash2, Save, Send, AlertCircle, 
  ChevronLeft, Layout, Settings, BrainCircuit,
  PlusCircle, MinusCircle, GripVertical
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const AdminCreateTest = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correct: 0 },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex items-center justify-between">
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
          <Button variant="outline" className="gap-2 font-bold border-slate-200">
            <Save size={18} /> Save as Draft
          </Button>
          <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/admin/tests')}>
            <Send size={18} /> Publish Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Questions */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Test Details" description="Configure basic information and logic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Test Title" placeholder="e.g. Weekly Quiz on Polynomials" />
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700 italic">Subject</label>
                <select className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Duration (Mins)" placeholder="60" type="number" />
                <Input label="Total Marks" placeholder="50" type="number" />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700 italic">Class/Grade</label>
                <div className="flex gap-2">
                  {[8, 9, 10].map(grade => (
                    <button key={grade} className="flex-1 py-1.5 border-2 border-slate-100 rounded-lg text-xs font-black text-slate-500 hover:border-primary hover:text-primary transition-all">
                      CL {grade}
                    </button>
                  ))}
                </div>
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
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="relative overflow-visible group">
                  <div className="absolute -left-3 top-6 bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-xl z-10 rotate-[-4deg]">
                    {idx + 1}
                  </div>
                  <div className="space-y-6 pl-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <textarea 
                          placeholder="Enter question text here..."
                          className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium italic focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3 group/opt">
                          <input 
                            type="radio" 
                            name={`correct-${q.id}`} 
                            className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                          />
                          <input 
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:border-primary focus:outline-none"
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
              <PlusCircle size={24} /> New Question
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
                  I can help you generate board-pattern questions for 'Quadratic Equations' with medium difficulty.
                </p>
                <Button size="sm" className="w-full gap-2 rounded-xl font-black italic shadow-md">
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Target Batches</label>
                <div className="flex flex-wrap gap-2">
                  {['Morning Elite', 'Evening Start', 'Weekend Class'].map(b => (
                    <button key={b} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 hover:bg-primary hover:text-white transition-all uppercase">
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Scheduled Date" type="date" />
              <Input label="Start Time" type="time" />
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-slate-500 font-semibold italic">Students will receive a push notification 15 mins before start time.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

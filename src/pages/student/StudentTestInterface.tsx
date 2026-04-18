import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, HelpCircle, AlertCircle, CheckCircle2, Flag, Save, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import api from '../../services/api';
import { cn } from '../../utils/cn';

export const StudentTestInterface = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${id}`);
        const testData = response.data.data.test;
        const attemptData = response.data.data.attempt;
        
        if (attemptData && attemptData.status === 'submitted') {
          alert('You have already submitted this test.');
          navigate('/student/results');
          return;
        }

        setTest(testData);
        setQuestions(testData.questions || []);
        setTimeLeft((testData.duration || 30) * 60);
      } catch (err) {
        alert('Test not found or unavailable.');
        navigate('/student/tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitted, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !loading && !isSubmitted) handleSubmit();
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
        questionIndex: parseInt(qIdx), selectedOption: optIdx
      }));
      await api.post(`/tests/${id}/submit`, { answers: formattedAnswers });
      setIsSubmitted(true);
      setTimeout(() => navigate('/student/results'), 3000);
    } catch {
      alert('Failed to submit test. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 size={48} className="text-primary animate-spin" />
      <p className="font-black italic text-slate-400">Loading Assessment...</p>
    </div>
  );

  if (isSubmitted) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
      <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-6 border-4 border-emerald-50 shadow-xl">
        <CheckCircle2 size={64} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2 italic">Test Submitted!</h1>
      <p className="text-slate-500 font-medium italic mb-8">Your answers have been recorded. Redirecting to results...</p>
      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }} className="h-full bg-emerald-500" />
      </div>
    </div>
  );

  if (!questions.length) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle size={48} className="text-slate-200 mb-4" />
      <h2 className="text-xl font-black text-slate-900 italic">No Questions Available</h2>
      <Button onClick={() => navigate('/student/tests')} className="mt-4">Go Back</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 lg:rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/student/tests')}>
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h2 className="text-lg font-black text-slate-900 italic leading-tight">{test.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase font-black">{test.subject}</Badge>
              <span className="text-xs text-slate-400 font-bold">• Class {test.class}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border italic shadow-sm", timeLeft < 300 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-900 border-slate-100")}>
            <Clock size={20} />
            <span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span>
          </div>
          <Button disabled={submitting} className="font-bold gap-2 px-8 rounded-full shadow-lg shadow-primary/20 h-12" onClick={handleSubmit}>
            {submitting ? 'Submitting...' : 'Submit'} <Save size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Palette */}
        <div className="lg:col-span-1 space-y-6 lg:order-last">
          <Card title="Question Palette" className="border-slate-100 shadow-lg">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQuestion(i)}
                  className={cn("h-10 w-full rounded-lg font-black text-sm transition-all border-2",
                    currentQuestion === i ? "bg-primary text-white border-primary shadow-lg scale-105"
                      : answers[i] !== undefined ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300"
                  )}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase italic">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" />Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200" />Not Visited</div>
            </div>
          </Card>
          <Card className="bg-amber-50 border-amber-100 shadow-none">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-900 font-bold italic leading-relaxed">Do not close or refresh. Test auto-submits when timer hits zero.</p>
            </div>
          </Card>
        </div>

        {/* Question */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="min-h-[420px] flex flex-col justify-between border-slate-100 shadow-xl overflow-visible relative">
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-slate-900 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl italic rotate-2 z-10">
              Q{currentQuestion + 1} / {questions.length}
            </div>
            <div className="space-y-10 py-6">
              <div className="flex items-start gap-4 pr-10">
                <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0"><HelpCircle size={22} /></div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight italic">{questions[currentQuestion].text}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion].options.map((opt: string, i: number) => (
                  <button key={i} onClick={() => setAnswers({ ...answers, [currentQuestion]: i })}
                    className={cn("flex items-center p-5 rounded-2xl border-2 transition-all text-left relative group/opt",
                      answers[currentQuestion] === i ? "bg-primary/5 border-primary" : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                    )}>
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mr-4 shrink-0 transition-colors",
                      answers[currentQuestion] === i ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover/opt:bg-slate-900 group-hover/opt:text-white"
                    )}>{String.fromCharCode(65 + i)}</div>
                    <span className={cn("text-sm font-bold", answers[currentQuestion] === i ? "text-primary italic" : "text-slate-700")}>{opt}</span>
                    {answers[currentQuestion] === i && <CheckCircle2 size={18} className="absolute right-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0} className="rounded-full gap-2 font-black italic px-6 border-slate-200 h-11">
                <ChevronLeft size={18} /> Previous
              </Button>
              <Button className={cn("rounded-full gap-2 font-black italic px-8 shadow-lg shadow-primary/20 h-11",
                currentQuestion === questions.length - 1 && "bg-slate-900 hover:bg-slate-800")}
                onClick={() => currentQuestion < questions.length - 1 ? setCurrentQuestion(p => p + 1) : handleSubmit()}>
                {currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next'} <ChevronRight size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

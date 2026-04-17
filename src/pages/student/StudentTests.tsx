import { useState, useEffect } from 'react';
import { ClipboardList, Clock, Calendar, CheckCircle2, ChevronRight, Play, Trophy, BrainCircuit, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const StudentTests = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [testsRes, resultsRes] = await Promise.all([
          api.get('/tests'),
          api.get('/results')
        ]);
        setTests(testsRes.data.data.tests || []);
        setResults(resultsRes.data.data.results || []);
      } catch (err: any) {
        console.error('Failed to fetch test data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedTestIds = results.map(r => r.testId?._id || r.testId);
  const upcomingTests = tests.filter(t => !completedTestIds.includes(t._id));
  const totalScore = results.reduce((acc, r) => acc + (r.score / r.totalMarks), 0);
  const avgAccuracy = results.length > 0 ? (totalScore / results.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Tests & Assessments</h1>
          <p className="text-slate-500 font-medium italic">Monitor your practice tests and academic evaluations.</p>
        </div>
        <Card className="p-3 bg-primary/5 border-primary/10 flex items-center gap-4">
          <div className="p-2 bg-primary text-white rounded-lg"><Trophy size={20} /></div>
          <div>
            <p className="text-xs font-black italic text-slate-400 uppercase leading-none mb-1">Avg Accuracy</p>
            <p className="text-lg font-black text-slate-900 leading-none">{avgAccuracy.toFixed(1)}%</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-sm font-black text-slate-900 italic uppercase tracking-widest flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full" /> Upcoming Assessments
            </h2>
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="text-primary animate-spin" size={32} /></div>
            ) : upcomingTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTests.map((test) => (
                  <Card key={test._id} className="group hover:border-primary/20 transition-all border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="italic bg-white">{test.subject}</Badge>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 italic">
                        <Clock size={12} /><span>{test.duration}m</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 italic mb-2 group-hover:text-primary transition-colors">{test.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic mb-6">
                      <Calendar size={14} />
                      <span>{test.questions?.length || 0} Questions • {test.totalMarks} Marks</span>
                    </div>
                    <Link to={`/student/tests/${test._id}`}>
                      <Button className="w-full gap-2 font-black italic rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Play size={16} fill="currentColor" /> Start Test
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic">No pending assessments.</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-black text-slate-900 italic uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-400 rounded-full" /> Completed & Scores
            </h2>
            <div className="space-y-4">
              {results.length > 0 ? results.map((result) => {
                const test = result.testId;
                const percentage = (result.score / result.totalMarks) * 100;
                return (
                  <div key={result._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ClipboardList size={22} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 italic leading-tight group-hover:text-primary transition-colors">{test?.title || 'Practice Test'}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(result.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500" /> Score: {result.score}/{result.totalMarks}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className={cn("text-lg font-black italic", percentage >= 80 ? "text-emerald-600" : percentage >= 60 ? "text-amber-600" : "text-red-600")}>{percentage.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
                      </div>
                      <Button variant="ghost" className="p-2 h-auto rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5">
                        <ChevronRight size={20} />
                      </Button>
                    </div>
                  </div>
                );
              }) : !loading && (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 text-xs font-bold italic">No completed tests yet. Take your first test above!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-8">
          <Card className="bg-slate-950 border-none relative overflow-hidden text-white shadow-2xl" title="Smart Suggestion">
            <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={80} /></div>
            <div className="space-y-4 relative z-10">
              <p className="text-sm font-medium italic text-slate-300">
                {avgAccuracy >= 80 ? "Great job! You're dominating the assessments. Try a harder practice set to keep growing." : "You're making progress. Focusing on subject fundamentals will help boost your accuracy above 80%."}
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 italic">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-tighter mb-1">Action Required</p>
                <p className="text-xs font-bold">Review last result questions to understand where you dropped marks.</p>
              </div>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-black italic rounded-xl h-12">Generate AI Mock Test</Button>
            </div>
          </Card>

          <Card title="Exam Statistics" description="Overview of your testing journey" className="border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="space-y-6">
              {[
                { label: 'Avg Accuracy', value: `${avgAccuracy.toFixed(0)}%`, color: 'text-emerald-600' },
                { label: 'Tests Attempted', value: results.length.toString(), color: 'text-slate-900' },
                { label: 'Best Subject', value: results.length > 0 ? (results[0].testId?.subject || 'N/A') : 'N/A', color: 'text-primary' },
                { label: 'Status', value: loading ? '...' : 'On Track', color: 'text-amber-600' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 italic">
                  <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                  <span className={cn("text-sm font-black", stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

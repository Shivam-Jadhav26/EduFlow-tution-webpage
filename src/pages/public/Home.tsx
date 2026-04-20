import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, BookOpen, Users, Trophy, ArrowRight, Star, 
  GraduationCap, Laptop, PhoneCall, ShieldCheck, ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { HeroSlider } from '../../components/public/HeroSlider';
import { TestimonialSlider } from '../../components/public/TestimonialSlider';
import { PartnerMarquee } from '../../components/public/PartnerMarquee';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const dashboardLink = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await api.get('/dashboard/public');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to fetch public stats', err);
      }
    };
    fetchPublicStats();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const features = [
    { title: 'Personalized Coaching', desc: '1-on-1 attention for every student to clear doubts.', icon: Users },
    { title: 'Quality Material', desc: 'Curated notes and practice sets for Classes 6-10.', icon: BookOpen },
    { title: 'Weekly Assessments', desc: 'Regular tests to track progress and identify weak areas.', icon: ClipboardList },
    { title: 'Result Oriented', desc: 'Proven track record of high scores in board exams.', icon: Trophy }
  ];


  return (
    <div className="pt-20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden px-6 lg:px-12 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/950 px-4 py-2 rounded-full border border-primary/20"
            >
              <span className="text-primary font-bold text-xs uppercase tracking-wider">Top Rated Tuition Center</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white"
            >
              Master Your Subjects with <span className="text-primary">EduFlow</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl"
            >
              The most advanced tuition management platform for Class 6 to 10 students. 
              Modern teaching, real-time tracking, and board-topping results.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <Link to={isAuthenticated ? dashboardLink : "/register"}>
                <Button size="lg" className="rounded-full gap-2 font-bold italic">
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Your Journey'} <ArrowRight size={20} />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-6 pt-4"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${i}`} className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-slate-100" />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">
                <span className="text-slate-900 font-bold">{data?.totalStudents || '500+'}</span> Students Joined
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <HeroSlider />
            
            {/* Float Cards */}
            <div className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 animate-bounce hidden sm:block z-20">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Success Rate</p>
                  <p className="text-xl font-extrabold text-slate-900">{data?.successRate || '98.5%'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PartnerMarquee />

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Classes Covered', val: data?.classesCovered || '6 - 10' },
            { label: 'Subjects', val: data?.subjectsCount || '12+' },
            { label: 'Monthly Tests', val: data?.monthlyTests || '50+' },
            { label: 'Happy Parents', val: '2k+' }
          ].map((stat, i) => (
            <motion.div key={i} {...fadeInUp} className="text-center group">
              <h3 className="text-4xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform">{stat.val}</h3>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>



      {/* Why Choose Us */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeInUp}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 transition-all hover:translate-y-[-4px]">
                  <div className="bg-primary/5 p-3 rounded-xl text-primary w-fit mb-4">
                    <f.icon size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
                  <p className="text-sm text-slate-600 italic">"{f.desc}"</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900">Why thousands of parents trust <span className="text-primary underline">EduFlow</span>?</h2>
            <ul className="space-y-4">
              {[
                'Smart attendance tracking with instant parent alerts.',
                'Interactive dashboard for students to ask doubts anytime.',
                'Full access to recorded classes and digital study notes.',
                'Modern test engine with performance analytics.'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary shrink-0 mt-1" size={18} />
                  <span className="text-slate-700 font-medium">{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/contact">
              <Button size="lg" className="rounded-full">Request a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 {...fadeInUp} className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 italic">
            Trusted by Thousands of Students & Parents
          </motion.h2>
          <motion.p {...fadeInUp} className="text-slate-600 max-w-2xl mx-auto italic font-medium">
            Don't just take our word for it. Hear what our community has to say about their transformation journey.
          </motion.p>
        </div>
        <TestimonialSlider />
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl lg:text-5xl font-black mb-8 relative z-10">Ready to secure your child's future?</h2>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto relative z-10">
            Join the elite circle of high-performers. Admissions open for Session 2024-25.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to={isAuthenticated ? dashboardLink : "/register"}>
              <Button variant="secondary" size="lg" className="rounded-full w-full sm:w-auto h-14 px-10 text-lg font-bold">
                {isAuthenticated ? 'Back to Dashboard' : 'Enroll Now'}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto h-14 px-10 text-lg border-white text-white hover:bg-white hover:text-primary font-bold">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

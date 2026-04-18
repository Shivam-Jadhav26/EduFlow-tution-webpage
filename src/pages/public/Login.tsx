import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { motion } from 'motion/react';
import api from '../../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }

    // Redirect if already logged in
    if (isAuthenticated) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleLogin = async (e: FormEvent, requestedRole?: 'student' | 'admin') => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data.data;

      // If a specific login button was clicked (student vs admin), verify role matches
      if (requestedRole && user.role !== requestedRole) {
        throw new Error(`This account does not have ${requestedRole} privileges.`);
      }

      login(user, token);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 bg-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full mx-auto space-y-8"
        >
          <div className="space-y-2">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 italic">EduFlow</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 font-medium italic">Please enter your details to sign in.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold italic"
            >
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-8">
            <div className="space-y-4">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" />
                <span className="text-slate-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-primary font-bold hover:underline">Forgot password?</a>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 font-bold"
                onClick={(e) => handleLogin(e, 'student')}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in as Student'} <ArrowRight size={20} />
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-tighter">Admin Access Only</span></div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-slate-200 text-slate-700 font-bold"
                onClick={(e) => handleLogin(e, 'admin')}
                disabled={isLoading}
              >
                Sign in as Administrator
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register your student</Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-12 max-w-lg text-center"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 italic">Experience Smart Tuition Management</h2>
            <p className="text-white/70 font-medium">
              "EduFlow has completely transformed how I track my daughter's progress. The instant alerts are a lifesaver."
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-white font-bold border border-white/10">Mrs.K</div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">Mrs. Kapoor</p>
                <p className="text-white/50 text-xs italic">Parent of Class 10th Student</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-12 text-white/40">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-black italic">500+</div>
              <div className="text-[10px] uppercase tracking-widest font-bold">Students</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-black italic">98%</div>
              <div className="text-[10px] uppercase tracking-widest font-bold">Success</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-black italic">12+</div>
              <div className="text-[10px] uppercase tracking-widest font-bold">Classes</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

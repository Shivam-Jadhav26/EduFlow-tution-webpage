import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Phone, GraduationCap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import api from '../../services/api';

export const Register = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    grade: '',
    batch: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        class: formData.grade,
        batch: formData.batch,
      };

      await api.post('/auth/register', payload);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-32 px-6 lg:px-12 bg-slate-50 flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-200">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">EduFlow</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create Student Account</h1>
          <p className="text-slate-500 font-medium">Step {step} of 2: {step === 1 ? 'Personal Information' : 'Academic Details'}</p>
        </div>

        <div className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold italic"
            >
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="First Name" 
                    name="firstName"
                    placeholder="John" 
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <Input 
                    label="Last Name" 
                    name="lastName"
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input 
                  label="Email Address" 
                  name="email"
                  placeholder="john@example.com" 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input 
                  label="Phone Number" 
                  name="phone"
                  placeholder="+91 XXXXX XXXXX" 
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Password" 
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Input 
                    label="Confirm Password" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 rounded-2xl font-bold gap-2">
                  Continue to Academic Details <ArrowRight size={20} />
                </Button>
              </motion.div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 italic">Select Current Grade</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {[6, 7, 8, 9, 10].map((grade) => (
                      <button 
                        key={grade}
                        type="button"
                        onClick={() => setFormData({ ...formData, grade: grade.toString() })}
                        className={`h-12 border-2 rounded-xl font-bold transition-all active:scale-95 ${
                          formData.grade === grade.toString() 
                            ? 'border-primary text-primary bg-primary/5' 
                            : 'border-slate-100 text-slate-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        Class {grade}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 italic">Preferred Batch</label>
                  <select 
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="flex h-12 w-full rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Batch</option>
                    <option value="morning">Morning Elite (7:00 AM - 9:00 AM)</option>
                    <option value="evening">Evening Starters (4:00 PM - 6:00 PM)</option>
                    <option value="weekend">Weekend Intensive</option>
                  </select>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-primary shrink-0" size={20} />
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                      By registering, you agree to our terms of service concerning regular attendance and institute discipline protocols.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="h-14 rounded-2xl flex-1 font-bold" onClick={() => setStep(1)} disabled={isLoading}>Go Back</Button>
                  <Button type="submit" size="lg" className="h-14 rounded-2xl flex-[2] font-bold" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Complete Registration'}
                  </Button>
                </div>
              </motion.div>
            </form>
          )}
        </div>

        <p className="text-center mt-8 text-sm text-slate-600 font-medium italic">
          Already enrolled? <Link to="/login" className="text-primary font-bold hover:underline">Sign in to your dashboard</Link>
        </p>
      </motion.div>
    </div>
  );
};

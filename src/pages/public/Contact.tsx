import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle2, 
  BookOpen, MessageSquare, ArrowRight, Star 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', subject: 'General Inquiry' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate a form submission (no backend endpoint needed for public contact)
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  const contactInfo = [
    { icon: Phone, label: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Sat, 8am – 6pm', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Mail, label: 'Email Us', value: 'info@eduflow.in', sub: 'We reply within 24 hrs', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: MapPin, label: 'Visit Us', value: '14, Shastri Nagar, Pune', sub: 'Maharashtra, India 411005', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Clock, label: 'Center Hours', value: 'Mon – Sat', sub: '8:00 AM – 8:00 PM', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const subjects = ['General Inquiry', 'Admission Enquiry', 'Demo Class Request', 'Fee Structure', 'Technical Support'];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 px-6 lg:px-12 bg-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6"
          >
            <MessageSquare size={14} className="text-primary" />
            <span className="text-primary font-bold text-xs uppercase tracking-wider">Get In Touch</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6"
          >
            We'd Love to <span className="text-primary">Hear From You</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg max-w-2xl mx-auto"
          >
            Have questions about admissions or fees? Our academic counselors are here to help you find the perfect learning path for your child.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-primary/20 hover:-translate-y-1 transition-all">
                <div className={`${info.bg} ${info.color} p-3 rounded-xl w-fit mb-4`}>
                  <info.icon size={22} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
                <p className="text-sm font-bold text-slate-900 mb-1">{info.value}</p>
                <p className="text-xs text-slate-500 italic">{info.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <motion.div {...fadeInUp}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-20 gap-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100">
                <div className="bg-emerald-100 p-6 rounded-full">
                  <CheckCircle2 size={48} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Message Sent! 🎉</h3>
                  <p className="text-slate-600 max-w-sm">
                    Thank you for contacting us, <strong>{form.name}</strong>. Our academic team will get back to you within 24 hours.
                  </p>
                </div>
                <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '', subject: 'General Inquiry' }); }} variant="outline" className="rounded-full font-bold">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Send Us a Message</h2>
                <p className="text-slate-500 mb-8 font-medium">Fill in the form below and we'll get back to you shortly.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Inquiry Type</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Your Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full gap-2 font-bold">
                    {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>

          {/* Right Side - Map + Info */}
          <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-8">
            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg h-72">
              <iframe
                title="EduFlow Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.289946884025!2d73.85673931453846!3d18.51957438739843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c080c9c70b77%3A0x28b5e61fcce560d7!2sShastri%20Nagar%2C%20Pune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>

            {/* Demo Class CTA */}
            <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-slate-400 text-xs font-bold">4.9/5 from 200+ Reviews</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3 italic">Book a Free Demo Class</h3>
                <p className="text-slate-400 text-sm mb-6 font-medium">
                  Experience our teaching methodology firsthand! Schedule a free demo class for your child with one of our expert educators.
                </p>
                <Link to="/register">
                  <Button className="rounded-full gap-2 font-bold w-full">
                    Schedule Demo <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h4 className="font-black text-slate-900 italic mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Student Login', to: '/login' },
                  { label: 'Our Teachers', to: '/team' },
                  { label: 'Our Results', to: '/testimonials' },
                ].map((link, i) => (
                  <Link key={i} to={link.to} className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <ArrowRight size={12} /> {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final Bottom CTA */}
      <section className="py-16 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen size={40} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-4 italic">Still Not Sure? Talk to an Academic Advisor</h2>
          <p className="text-slate-600 mb-8 font-medium">Our counselors are happy to help you select the right batch, understand our fee structure, and guide you step by step through enrollment.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+919876543210">
              <Button size="lg" className="rounded-full gap-2 font-bold">
                <Phone size={18} /> Call Now: +91 98765 43210
              </Button>
            </a>
            <a href="mailto:info@eduflow.in">
              <Button size="lg" variant="outline" className="rounded-full gap-2 font-bold">
                <Mail size={18} /> Email Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

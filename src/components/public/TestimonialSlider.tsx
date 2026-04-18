import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Parent of Class 10 Student',
    text: 'EduFlow transformed my daughter\'s approach to Mathematics. The 1-on-1 focus and smart tracking helped her score 95% in boards.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul'
  },
  {
    name: 'Priya Verma',
    role: 'Student, Grade 9',
    text: 'I love the interactive dashboard. Asking doubts is so easy now, and the recorded sessions help me revise whenever I want.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
  },
  {
    name: 'Dr. Amit Patel',
    role: 'Academic Consultant',
    text: 'The most comprehensive platform for coaching institutes. It balances technology and pedagogy perfectly.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit'
  }
];

export const TestimonialSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center"
        >
          <div className="bg-primary/10 p-4 rounded-full text-primary mb-8">
            <Quote size={40} fill="currentColor" className="opacity-20" />
          </div>
          
          <p className="text-xl lg:text-2xl font-serif italic text-slate-700 leading-relaxed mb-8">
            "{testimonials[current].text}"
          </p>
          
          <div className="flex items-center gap-1 mb-6 text-amber-400">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="currentColor" />)}
          </div>
          
          <div className="flex flex-col items-center">
            <img 
              src={testimonials[current].image} 
              alt={testimonials[current].name}
              className="w-16 h-16 rounded-full border-4 border-primary/10 mb-3"
            />
            <h4 className="font-black text-slate-900 italic tracking-tight">{testimonials[current].name}</h4>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{testimonials[current].role}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-3 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? 'bg-primary scale-125' : 'bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

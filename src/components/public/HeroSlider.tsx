import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1523240715637-9759c8cc6931?auto=format&fit=crop&q=80&w=1200&h=800',
    title: 'Modern Learning Environment',
    description: 'State-of-the-art classrooms equipped with digital learning tools.'
  },
  {
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200&h=800',
    title: 'Expert Faculty',
    description: 'Learn from industry veterans and top-tier subject specialists.'
  },
  {
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1200&h=800',
    title: 'Proven Results',
    description: 'Consistently producing board toppers year after year.'
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200&h=800',
    title: 'Interactive Sessions',
    description: 'Engaging peer-to-peer learning and active doubt clearing.'
  }
];

export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 p-8 lg:p-12 w-full text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl lg:text-3xl font-black italic mb-2 tracking-tight">
                {slides[current].title}
              </h3>
              <p className="text-sm lg:text-base font-medium opacity-90 max-w-md italic font-serif">
                "{slides[current].description}"
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all border border-white/20"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all border border-white/20"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

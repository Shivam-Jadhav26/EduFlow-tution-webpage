import React from 'react';
import { motion } from 'motion/react';

const partners = [
  'Microsoft for Startups',
  'Google Cloud',
  'AWS EdStart',
  'Stripe',
  'Zoom for Education',
  'Notion',
  'Coursera',
  'Unacademy'
];

export const PartnerMarquee = () => {
  return (
    <div className="py-12 bg-white/50 backdrop-blur-sm border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">
        Trusted & Powered By Industry Leaders
      </div>
      <div className="flex overflow-hidden">
        <motion.div 
          className="flex gap-16 items-center whitespace-nowrap"
          animate={{ x: [0, -1035] }} // Adjust based on content width
          transition={{ 
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear"
            }
          }}
        >
          {/* Double the list for seamless loop */}
          {[...partners, ...partners].map((partner, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xl lg:text-2xl font-black text-slate-300 hover:text-primary transition-colors cursor-default grayscale hover:grayscale-0">
                {partner}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

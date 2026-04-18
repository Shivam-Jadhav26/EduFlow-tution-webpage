import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Edu<span className="text-primary">Flow</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            Empowering students from Class 6-10 with quality education and modern learning resources. 
            Join the elite learning community today.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors p-2 bg-slate-800 rounded-lg"><Facebook size={18} /></a>
            <a href="#" className="hover:text-primary transition-colors p-2 bg-slate-800 rounded-lg"><Twitter size={18} /></a>
            <a href="#" className="hover:text-primary transition-colors p-2 bg-slate-800 rounded-lg"><Instagram size={18} /></a>
            <a href="#" className="hover:text-primary transition-colors p-2 bg-slate-800 rounded-lg"><Linkedin size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-4 text-sm">
            <li><Link to="/courses" className="hover:text-primary transition-colors">All Courses</Link></li>
            <li><Link to="/testimonials" className="hover:text-primary transition-colors">Success Stories</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">Our Mission</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Support</h4>
          <ul className="flex flex-col gap-4 text-sm">
            <li><Link to="/login" className="hover:text-primary transition-colors">Student Login</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Enroll Today</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex gap-3 items-start">
              <MapPin size={18} className="text-primary shrink-0" />
              <span>123 Knowledge Lane, Sector 45, EdCity - 1100XX</span>
            </li>
            <li className="flex gap-3 items-center">
              <Phone size={18} className="text-primary shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex gap-3 items-center">
              <Mail size={18} className="text-primary shrink-0" />
              <span>support@eduflow.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
        <p>© 2024 EduFlow Management Platform. All rights reserved.</p>
        <div className="flex gap-8">
          <p>Made with ❤️ for students</p>
        </div>
      </div>
    </footer>
  );
};

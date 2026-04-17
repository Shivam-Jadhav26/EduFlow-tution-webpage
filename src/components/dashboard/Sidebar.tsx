import { ReactNode, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Calendar, Clock, ClipboardList, 
  MessageSquare, Bell, User, LogOut, Menu, X, BarChart3, 
  Users, Layers, GraduationCap, CreditCard, BrainCircuit,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Attendance', path: '/student/attendance', icon: Calendar },
    { name: 'Timetable', path: '/student/timetable', icon: Clock },
    { name: 'Tests', path: '/student/tests', icon: ClipboardList },
    { name: 'Results', path: '/student/results', icon: BarChart3 },
    { name: 'Doubts', path: '/student/doubts', icon: MessageSquare },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Batches', path: '/admin/batches', icon: Layers },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Timetable', path: '/admin/timetable', icon: Clock },
    { name: 'Attendance', path: '/admin/attendance', icon: ClipboardList },
    { name: 'Tests', path: '/admin/tests', icon: BrainCircuit },
    { name: 'Results', path: '/admin/results', icon: BarChart3 },
    { name: 'Fees', path: '/admin/fees', icon: CreditCard },
    { name: 'Analytics', path: '/admin/analytics', icon: GraduationCap },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Doubts', path: '/admin/doubts', icon: MessageSquare },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200 z-50 w-64 flex flex-col transition-transform duration-300 transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">EduFlow</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => { if(window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => cn(
                "sidebar-link group",
                isActive && "sidebar-link-active"
              )}
            >
              <link.icon size={20} className={cn(
                "group-hover:scale-110 transition-transform",
                "text-slate-400 group-hover:text-primary"
              )} />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

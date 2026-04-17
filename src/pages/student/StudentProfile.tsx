import { motion } from 'motion/react';
import { User, Mail, GraduationCap, MapPin, Phone, ShieldCheck, Edit3, Camera, LayoutGrid, Clock, Award } from 'lucide-react';
import { mockUser } from '../../data/mockData';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const StudentProfile = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic">Personal Profile</h1>
          <p className="text-slate-500 font-medium italic">Manage your account information and academic settings.</p>
        </div>
        <Button className="gap-2 font-black italic rounded-xl px-6">
          <Edit3 size={18} /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Main Info */}
        <div className="lg:col-span-1">
          <Card className="text-center p-0 overflow-hidden relative">
            <div className="h-32 bg-slate-900 absolute top-0 left-0 right-0" />
            
            <div className="relative pt-16 pb-8 px-6">
              <div className="relative inline-block group">
                <img 
                  src={mockUser.avatar} 
                  className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 shadow-xl object-cover"
                  alt="profile"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-white text-primary rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100">
                  <Camera size={16} />
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-black text-slate-900 italic leading-none mb-1">{mockUser.name}</h3>
                <p className="text-sm font-bold text-slate-400 italic">Student ID: #STU2024001</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="primary" className="italic">{mockUser.class} Class</Badge>
                  <Badge variant="outline" className="italic">{mockUser.batch}</Badge>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-black text-slate-900">8.4</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global CGPA</p>
                </div>
                <div>
                  <p className="text-xl font-black text-primary">02</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Courses</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-8" title="Achievements">
             <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Award, label: 'Top Scorer', color: 'text-amber-500', bg: 'bg-amber-50' },
                  { icon: ShieldCheck, label: 'Consistent', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Clock, label: 'Early Bird', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map((ach, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className={cn("p-4 rounded-2xl", ach.bg, ach.color)}>
                      <ach.icon size={24} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{ach.label}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Right Content: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Contact & Academic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Mail, label: 'Email Address', value: mockUser.email },
                { icon: Phone, label: 'Phone Number', value: '+91 98765 43210' },
                { icon: GraduationCap, label: 'Current Class', value: `${mockUser.class} Standard` },
                { icon: MapPin, label: 'Residential Address', value: '420, Green Valley, Skyline Heights, New Delhi' },
                { icon: ShieldCheck, label: 'Parent Name', value: 'Mr. Sunil Sharma' },
                { icon: LayoutGrid, label: 'Assigned Batch', value: mockUser.batch },
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50">
                  <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
                    <info.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic leading-none">{info.label}</p>
                    <p className="text-sm font-black text-slate-800 italic leading-tight">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Account Security">
             <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={20} /></div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">Passowrd Updated</h4>
                      <p className="text-xs font-medium text-slate-500 italic">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs font-black italic rounded-xl text-primary">Change</Button>
               </div>
               
               <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><LayoutGrid size={20} /></div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">Two-Factor Auth</h4>
                      <p className="text-xs font-medium text-slate-500 italic">Enabled via mobile number</p>
                    </div>
                  </div>
                  <Badge variant="success">ACTIVE</Badge>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

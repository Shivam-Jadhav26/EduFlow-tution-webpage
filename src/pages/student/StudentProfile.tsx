import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, GraduationCap, MapPin, Phone, ShieldCheck, Edit3, Camera, LayoutGrid, Clock, Award, Loader2, XCircle, Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/api';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ffdfbf',
];

export const StudentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ cgpa: 0, activeCourses: 0 });
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [showEdit, setShowEdit] = useState(false);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', phone: '', address: '', parentName: '', parentPhone: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [authRes, resultsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/results/me').catch(() => ({ data: { data: { attempts: [] } } }))
      ]);
      
      const user = authRes.data.data.user;
      setProfile(user);
      
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        parentName: user.parentName || '',
        parentPhone: user.parentPhone || ''
      });

      const attempts = resultsRes.data.data.attempts || [];
      const totalScore = attempts.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
      const avgScore = attempts.length > 0 ? (totalScore / attempts.length) / 10 : 0; 
      
      setStats({
        cgpa: parseFloat(avgScore.toFixed(1)),
        activeCourses: attempts.length || 2 
      });
      
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await api.patch('/auth/me', editForm);
      await fetchData();
      setShowEdit(false);
    } catch (err) {
      alert("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvatar = async (url: string) => {
    try {
      setSaving(true);
      await api.patch('/auth/me', { avatar: url });
      await fetchData();
      setShowAvatarSelect(false);
    } catch (err) {
      alert("Failed to update avatar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="py-32 flex justify-center"><Loader2 size={40} className="animate-spin text-primary" /></div>;
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Avatar Selection Modal */}
      {showAvatarSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black italic text-slate-900 leading-tight">Choose Avatar</h2>
                <p className="text-xs font-bold text-slate-400">Select a new profile picture</p>
              </div>
              <button disabled={saving} onClick={() => setShowAvatarSelect(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><XCircle size={24} /></button>
            </div>
            
            <div className="p-6">
              {saving ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-4 text-primary" />
                  <p className="font-bold text-sm italic">Updating avatar...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {AVATAR_OPTIONS.map((url, i) => (
                    <button 
                      key={i}
                      onClick={() => handleUpdateAvatar(url)}
                      className={cn(
                        "rounded-2xl border-4 p-1 overflow-hidden transition-all hover:scale-105",
                        profile.avatar === url ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-slate-200"
                      )}
                    >
                      <img src={url} alt={`Avatar ${i+1}`} className="w-full h-auto bg-slate-100 rounded-xl" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
               <p className="text-xs font-medium text-slate-400 italic">Avatars provided securely by DiceBear API.</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black italic text-slate-900 leading-tight">Edit Profile</h2>
                <p className="text-xs font-bold text-slate-400">Update your contact and guardian details</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><XCircle size={24} /></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Full Name</label>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Phone Number</label>
                  <input
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="+91..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Residential Address</label>
                  <input
                    value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Guardian Info</h4>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Guardian Name</label>
                  <input
                    value={editForm.parentName}
                    onChange={e => setEditForm({...editForm, parentName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Guardian Phone</label>
                  <input
                    value={editForm.parentPhone}
                    onChange={e => setEditForm({...editForm, parentPhone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl font-bold italic" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl font-black italic shadow-lg shadow-primary/20 gap-2" onClick={handleUpdate} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">Personal Profile</h1>
          <p className="text-slate-500 font-medium italic">Manage your account information and academic settings.</p>
        </div>
        <Button className="gap-2 font-black italic rounded-2xl px-6 shadow-lg shadow-primary/20" onClick={() => setShowEdit(true)}>
          <Edit3 size={18} /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Main Info */}
        <div className="lg:col-span-1">
          <Card className="text-center p-0 overflow-hidden relative shadow-sm border border-slate-100">
            <div className="h-32 bg-slate-900 absolute top-0 left-0 right-0" />
            
            <div className="relative pt-16 pb-8 px-6">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} className="w-full h-full object-cover" alt="profile" />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                </div>
                <button 
                  onClick={() => setShowAvatarSelect(true)}
                  className="absolute bottom-2 right-2 p-2 bg-white text-primary rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="mt-4 animate-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-black text-slate-900 italic leading-none mb-1">{profile.name}</h3>
                <p className="text-xs font-bold text-slate-400 italic">Student ID: #{profile._id?.slice(-8).toUpperCase()}</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="primary" className="italic">{profile.class || 'Unassigned'} Class</Badge>
                  <Badge variant="outline" className="italic">{profile.batch?.name || 'No Batch'}</Badge>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-2xl font-black text-slate-900">{stats.cgpa || '--'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global CGPA</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-2xl font-black text-primary">{String(stats.activeCourses).padStart(2, '0')}</p>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-1">Tests Taken</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-8 shadow-sm border border-slate-100" title="Profile Badges">
             <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Award, label: 'Verified', color: 'text-amber-500', bg: 'bg-amber-50' },
                  { icon: ShieldCheck, label: 'Active', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Clock, label: 'Enrolled', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map((ach, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className={cn("p-4 rounded-2xl", ach.bg, ach.color)}>
                      <ach.icon size={24} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">{ach.label}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Right Content: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Contact & Academic Information" className="shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Mail, label: 'Email Address', value: profile.email },
                { icon: Phone, label: 'Phone Number', value: profile.phone || 'Not Provided' },
                { icon: GraduationCap, label: 'Current Class', value: profile.class ? `${profile.class} Standard` : 'N/A' },
                { icon: MapPin, label: 'Residential Address', value: profile.address || 'Not Provided' },
                { icon: ShieldCheck, label: 'Guardian Name', value: profile.parentName || 'Not Provided' },
                { icon: LayoutGrid, label: 'Assigned Batch', value: profile.batch?.name || 'Unassigned' },
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50">
                  <div className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm">
                    <info.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{info.label}</p>
                    <p className={cn("text-sm font-bold italic leading-tight", info.value === 'Not Provided' ? "text-slate-400" : "text-slate-700")}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Account Security" className="shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all bg-white">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit"><ShieldCheck size={20} /></div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">Password Status</h4>
                      <p className="text-xs font-medium text-slate-500">Secured with BCrypt hash protocol</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs font-black italic rounded-xl text-primary" onClick={() => alert('Password reset links will be added in v1.1')}>Change</Button>
               </div>
               
               <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all bg-white">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit"><LayoutGrid size={20} /></div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 italic leading-none mb-1">Two-Factor Auth</h4>
                      <p className="text-xs font-medium text-slate-500">Requires Admin validation to alter</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="opacity-50 pointer-events-none">OFFLINE</Badge>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

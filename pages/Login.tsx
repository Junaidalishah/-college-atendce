import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/');
  };

  const setDemoCreds = (r: UserRole) => {
    setRole(r);
    if(r === UserRole.ADMIN) setEmail('admin@gcc.edu');
    if(r === UserRole.TEACHER) setEmail('teacher@gcc.edu');
    if(r === UserRole.STUDENT) setEmail('student@gcc.edu');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">GCC Charsadda</h1>
          <p className="text-brand-100 mt-2">Online Attendance System</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="you@gcc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`text-xs py-2 px-1 rounded-md border font-medium transition-colors uppercase ${
                      role === r 
                      ? 'bg-brand-50 border-brand-500 text-brand-700' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
             <p className="text-xs text-center text-slate-400 mb-3">One-click Demo Login</p>
             <div className="flex justify-center gap-2">
               <button onClick={() => setDemoCreds(UserRole.ADMIN)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Admin</button>
               <button onClick={() => setDemoCreds(UserRole.TEACHER)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Teacher</button>
               <button onClick={() => setDemoCreds(UserRole.STUDENT)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600">Student</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
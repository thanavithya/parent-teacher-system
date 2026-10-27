import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateRegisterParent: () => void;
  onNavigateRegisterTeacher: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegisterParent,
  onNavigateRegisterTeacher,
  onShowToast
}) => {
  const [email, setEmail] = useState('parent@parentteacher.com');
  const [password, setPassword] = useState('parent123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    const res = StorageService.login(email, password);
    if (res.success && res.user) {
      onShowToast('success', 'Signed In', res.message);
      onLoginSuccess(res.user);
    } else {
      setError(res.message);
      onShowToast('error', 'Login Failed', res.message);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = StorageService.login(demoEmail, demoPass);
    if (res.success && res.user) {
      onShowToast('success', 'Quick Sign In', res.message);
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Branding & Demo Credentials Card */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Free Web Development Internship Online Project</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              ParentTeacher <span className="text-pink-600 dark:text-pink-400">Connect</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A unified school collaboration ecosystem connecting parents, educators, and administration for student success, transparent grades, attendance tracking, and seamless communication.
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-pink-100 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Demo Credentials (1-Click Login)
              </span>
              <span className="text-[11px] text-slate-400">Click to auto-sign in</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('parent@parentteacher.com', 'parent123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pink-50/60 dark:bg-slate-700/50 hover:bg-pink-100/80 dark:hover:bg-slate-700 border border-pink-100 dark:border-slate-600 transition-colors text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                    Parent Account
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">parent@parentteacher.com / parent123</p>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@parentteacher.com', 'teacher123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pink-50/60 dark:bg-slate-700/50 hover:bg-pink-100/80 dark:hover:bg-slate-700 border border-pink-100 dark:border-slate-600 transition-colors text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                    Teacher Account (Grade 8-A)
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">teacher@parentteacher.com / teacher123</p>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@parentteacher.com', 'admin123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pink-50/60 dark:bg-slate-700/50 hover:bg-pink-100/80 dark:hover:bg-slate-700 border border-pink-100 dark:border-slate-600 transition-colors text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                    Administrator Account
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">admin@parentteacher.com / admin123</p>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              Note: Demonstration data is persisted in browser localStorage for evaluation.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-pink-100 dark:border-slate-800 shadow-xl shadow-pink-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-600/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portal Sign In</h2>
                <p className="text-xs text-slate-500">Access student and classroom records</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md shadow-pink-600/25 transition-all"
              >
                Sign In to Portal
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">Need a new portal account?</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateRegisterParent}
                  className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Register as Parent
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={onNavigateRegisterTeacher}
                  className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Register as Teacher
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

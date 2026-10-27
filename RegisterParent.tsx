import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Heart, Mail, Phone, Lock, User, ShieldCheck } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User as UserType } from '../../types';

interface RegisterParentProps {
  onRegisterSuccess: (user: UserType) => void;
  onNavigateLogin: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const RegisterParent: React.FC<RegisterParentProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
  onShowToast
}) => {
  const students = StorageService.getStudents();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    linkedStudentId: students[0]?.id || 'stu-101',
    relationship: 'Mother' as 'Mother' | 'Father' | 'Guardian',
    notificationPref: 'portal' as 'email' | 'sms' | 'portal'
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = StorageService.registerUser({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: 'parent',
      phone: formData.phone.trim(),
      linkedStudentId: formData.linkedStudentId,
      relationship: formData.relationship,
      notificationPref: formData.notificationPref
    });

    if (res.success && res.user) {
      onShowToast('success', 'Account Registered', res.message);
      onRegisterSuccess(res.user);
    } else {
      setError(res.message);
      onShowToast('error', 'Registration Failed', res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-pink-100 dark:border-slate-800 shadow-xl">
        
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Parent Portal Registration</h2>
            <p className="text-xs text-slate-500">Connect to your child's academic and attendance records</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="parent@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 014-9981"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Relationship to Child
              </label>
              <select
                value={formData.relationship}
                onChange={e => setFormData({ ...formData, relationship: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Legal Guardian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Child to Link *
              </label>
              <select
                value={formData.linkedStudentId}
                onChange={e => setFormData({ ...formData, linkedStudentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber} - {s.class})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notification Preference
              </label>
              <select
                value={formData.notificationPref}
                onChange={e => setFormData({ ...formData, notificationPref: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
              >
                <option value="portal">In-Portal Notifications</option>
                <option value="email">Email Summaries</option>
                <option value="sms">SMS Text Alerts</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-type password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-pink-50/50 dark:bg-slate-800/50 border border-pink-100 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <span>
              By registering, you will obtain read-only access to your child's academic cards, attendance timeline, fee statements, and direct messaging with assigned class teachers.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-pink-600/25 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Complete Parent Registration</span>
          </button>
        </form>

      </div>
    </div>
  );
};

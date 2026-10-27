import React, { useState } from 'react';
import { ArrowLeft, UserPlus, BookOpen, Mail, Phone, Lock, User, GraduationCap, Clock } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User as UserType } from '../../types';

interface RegisterTeacherProps {
  onRegisterSuccess: (user: UserType) => void;
  onNavigateLogin: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Computer Science',
  'Arts',
  'Physical Education'
];

const AVAILABLE_CLASSES = ['Grade 8-A', 'Grade 8-B', 'Grade 9-A', 'Grade 10-A'];

export const RegisterTeacher: React.FC<RegisterTeacherProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
  onShowToast
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    qualification: '',
    availability: 'Mon-Fri 3:30 PM - 5:00 PM',
    subjects: ['Mathematics', 'Science'],
    assignedClasses: ['Grade 8-A']
  });

  const [error, setError] = useState('');

  const toggleSubject = (subj: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subj)
        ? prev.subjects.filter(s => s !== subj)
        : [...prev.subjects, subj]
    }));
  };

  const toggleClass = (cls: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(cls)
        ? prev.assignedClasses.filter(c => c !== cls)
        : [...prev.assignedClasses, cls]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.qualification.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one teaching subject.');
      return;
    }

    if (formData.assignedClasses.length === 0) {
      setError('Please select at least one assigned class.');
      return;
    }

    const res = StorageService.registerUser({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: 'teacher',
      phone: formData.phone.trim(),
      qualification: formData.qualification.trim(),
      subjects: formData.subjects,
      assignedClasses: formData.assignedClasses,
      availability: formData.availability
    });

    if (res.success && res.user) {
      onShowToast('success', 'Teacher Account Created', res.message);
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
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Portal Registration</h2>
            <p className="text-xs text-slate-500">Manage classrooms, mark attendance, enter grades, and connect with parents</p>
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
                Full Name with Title *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mrs. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teacher Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@school.edu"
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
                  placeholder="+1 (555) 018-4729"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highest Academic Qualification *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. M.Ed. Curriculum, B.S. Mathematics"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subjects Taught *
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SUBJECTS.map(subj => {
                const selected = formData.subjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Classes *
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CLASSES.map(cls => {
                const selected = formData.assignedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Office Hours / Meeting Availability
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.availability}
                onChange={e => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g. Mon-Fri 3:30 PM - 5:00 PM"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
              />
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
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-pink-600/25 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Complete Teacher Registration</span>
          </button>
        </form>

      </div>
    </div>
  );
};

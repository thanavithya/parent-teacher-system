import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  X,
  Check,
  ShieldCheck
} from 'lucide-react';
import { User, BehaviorRecord, Student } from '../../types';
import { StorageService } from '../../services/storage';

interface BehaviorTrackerProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm
}) => {
  const students = StorageService.getStudents();
  const records = StorageService.getBehaviorRecords();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  const [typeFilter, setTypeFilter] = useState<'All' | 'Positive' | 'Area for Growth'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Record Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [category, setCategory] = useState<BehaviorRecord['category']>('Academic Excellence');
  const [recordType, setRecordType] = useState<'Positive' | 'Area for Growth'>('Positive');
  const [remarks, setRemarks] = useState('');

  // Filter records
  let displayedRecords = records;
  if (isParent && linkedChild) {
    displayedRecords = records.filter(r => r.studentId === linkedChild.id);
  } else {
    if (searchQuery.trim()) {
      displayedRecords = displayedRecords.filter(r =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.remarks.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }

  if (typeFilter !== 'All') {
    displayedRecords = displayedRecords.filter(r => r.type === typeFilter);
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === targetStudentId);
    if (!st || !remarks.trim()) {
      onShowToast('error', 'Validation Error', 'Student and remarks are required.');
      return;
    }

    StorageService.addBehaviorRecord({
      studentId: st.id,
      studentName: st.name,
      class: st.class,
      date: new Date().toISOString().split('T')[0],
      category,
      type: recordType,
      remarks: remarks.trim(),
      teacherName: currentUser.name,
      teacherId: currentUser.id
    });

    setIsAddOpen(false);
    setRemarks('');
    onShowToast('success', 'Observation Logged', `Observation recorded for ${st.name}.`);
  };

  const handleDelete = (id: string) => {
    onRequestConfirm('Remove Entry', 'Are you sure you want to delete this observation record?', () => {
      StorageService.deleteBehaviorRecord(id);
      onShowToast('info', 'Entry Removed', 'The record was deleted.');
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-pink-600" />
            <span>Student Conduct &amp; Constructive Growth Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isParent
              ? `Chronological character milestones and teacher encouragement notes for ${linkedChild?.name}`
              : 'Constructive classroom observations, leadership praise, and focal growth suggestions'}
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Log Faculty Observation</span>
          </button>
        )}
      </div>

      {/* Philosophy Banner */}
      <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/60 dark:border-pink-900/40 flex items-start gap-3 text-xs text-pink-950 dark:text-pink-200">
        <ShieldCheck className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Growth-Oriented Assessment Philosophy:</span>
          <p className="mt-0.5 opacity-90 leading-relaxed text-[11px]">
            Observations use respectful, constructive language emphasizing potential, peer collaboration, and actionable encouragement rather than punitive labels.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-pink-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Positive', 'Area for Growth'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                typeFilter === f
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f === 'Positive' ? 'Positive Accolades' : f === 'Area for Growth' ? 'Areas for Growth' : 'All Observations'}
            </button>
          ))}
        </div>

        {!isParent && (
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by student..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
            />
          </div>
        )}
      </div>

      {/* Observation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedRecords.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
            <HeartHandshake className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No behavior observations logged under this category</p>
          </div>
        ) : (
          displayedRecords.map(rec => {
            const isPositive = rec.type === 'Positive';
            return (
              <div
                key={rec.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isPositive
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${
                      isPositive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                    }`}>
                      {isPositive ? <Sparkles className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.category}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{rec.date} · {rec.studentName} ({rec.class})</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isPositive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {rec.type}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans italic bg-white/60 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  "{rec.remarks}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Recorded by: <strong>{rec.teacherName}</strong></span>
                  {(isTeacher || isAdmin) && (
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Observation Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-pink-600" />
                <span>Log Student Behavioral Observation</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student *
                </label>
                <select
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber} - {s.class})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Academic Excellence">Academic Excellence</option>
                    <option value="Constructive Participation">Constructive Participation</option>
                    <option value="Leadership & Teamwork">Leadership &amp; Teamwork</option>
                    <option value="Focus & Engagement">Focus &amp; Engagement</option>
                    <option value="Punctuality & Discipline">Punctuality &amp; Discipline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Observation Type
                  </label>
                  <select
                    value={recordType}
                    onChange={e => setRecordType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Positive">Positive Accolade</option>
                    <option value="Area for Growth">Constructive Area for Growth</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Constructive Remarks / Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Detail specific instances of positive leadership or targeted areas where the student can grow..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

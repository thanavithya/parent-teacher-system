import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  User,
  Filter
} from 'lucide-react';
import { User as UserType, Meeting, MeetingStatus } from '../../types';
import { StorageService } from '../../services/storage';

interface MeetingSchedulerProps {
  currentUser: UserType;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm
}) => {
  const users = StorageService.getUsers();
  const students = StorageService.getStudents();
  const meetings = StorageService.getMeetings();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];
  const teacherList = users.filter(u => u.role === 'teacher');

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState(teacherList[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('16:30');
  const [meetingTitle, setMeetingTitle] = useState('Academic Progress & Elective Review');
  const [purpose, setPurpose] = useState('Review recent mid-term exam scores and discuss elective roadmap.');

  // Filter meetings for user
  let displayedMeetings = meetings;
  if (isParent) {
    displayedMeetings = meetings.filter(m => m.parentId === currentUser.id || m.studentId === linkedChild?.id);
  } else if (isTeacher) {
    displayedMeetings = meetings.filter(m => m.teacherId === currentUser.id);
  }

  if (statusFilter !== 'All') {
    displayedMeetings = displayedMeetings.filter(m => m.status === statusFilter);
  }

  // Sort by date
  displayedMeetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teacherList.find(t => t.id === selectedTeacherId);
    if (!teacher) {
      onShowToast('error', 'Select Teacher', 'Please choose an assigned educator.');
      return;
    }

    if (startTime >= endTime) {
      onShowToast('error', 'Time Error', 'End time must be later than start time.');
      return;
    }

    const res = StorageService.scheduleMeeting({
      title: meetingTitle.trim(),
      parentId: currentUser.id,
      parentName: currentUser.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      studentId: linkedChild ? linkedChild.id : 'stu-101',
      studentName: linkedChild ? linkedChild.name : 'Aarav Sharma',
      date: meetingDate,
      startTime,
      endTime,
      purpose: purpose.trim(),
      location: 'Staff Conference Room / Video Call'
    });

    if (res.success) {
      onShowToast('success', 'Meeting Requested', res.message);
      setIsBookModalOpen(false);
    } else {
      onShowToast('error', 'Schedule Conflict', res.message);
    }
  };

  const handleStatusUpdate = (meetingId: string, status: MeetingStatus, notes?: string) => {
    StorageService.updateMeetingStatus(meetingId, status, notes);
    onShowToast('info', 'Meeting Updated', `Status changed to ${status}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-pink-600" />
            <span>Parent-Teacher Meeting Scheduler</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book one-on-one conferences, prevent conflicting appointments, and review meeting statuses
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Request Teacher Meeting</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Requested', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              statusFilter === st
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Meetings Grid / Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedMeetings.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No meetings match this filter</p>
          </div>
        ) : (
          displayedMeetings.map(m => {
            const isConfirmed = m.status === 'Confirmed';
            const isRequested = m.status === 'Requested';
            const isCompleted = m.status === 'Completed';
            const isCancelled = m.status === 'Cancelled' || m.status === 'Rejected';

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {m.date}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isRequested
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : isCompleted
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{m.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{m.purpose}</p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-pink-600" />
                      <span className="font-mono">{m.startTime} - {m.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-pink-600" />
                      <span>Teacher: <strong>{m.teacherName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Student:</span>
                      <span><strong>{m.studentName}</strong> (Parent: {m.parentName})</span>
                    </div>
                  </div>

                  {m.teacherNotes && (
                    <p className="text-[11px] text-slate-500 italic bg-pink-50/50 dark:bg-pink-950/20 p-2.5 rounded-xl border border-pink-100 dark:border-pink-900/30">
                      Notes: {m.teacherNotes}
                    </p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Teacher actions */}
                  {isTeacher && isRequested && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleStatusUpdate(m.id, 'Confirmed', 'Confirmed by class teacher.')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(m.id, 'Rejected', 'Teacher unavailable at requested hour.')}
                        className="flex-1 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {isTeacher && isConfirmed && (
                    <button
                      onClick={() => handleStatusUpdate(m.id, 'Completed', 'Conference successfully held.')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {/* Parent action: Cancel meeting if requested or confirmed */}
                  {isParent && (isRequested || isConfirmed) && (
                    <button
                      onClick={() => {
                        onRequestConfirm('Cancel Meeting', 'Do you wish to cancel this scheduled appointment?', () => {
                          handleStatusUpdate(m.id, 'Cancelled', 'Cancelled by parent.');
                        });
                      }}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Cancel Meeting
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Meeting Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-pink-600" />
                <span>Request Parent-Teacher Conference</span>
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Educator / Teacher *
                </label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                >
                  {teacherList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({(t.subjects || []).join(', ')}) · Availability: {t.availability || '3:30 - 5:00 PM'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={e => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Science Olympiad preparation review"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Discussion Points / Purpose
                </label>
                <textarea
                  rows={3}
                  required
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="Describe your questions or agenda items..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

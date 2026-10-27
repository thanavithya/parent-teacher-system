import React from 'react';
import {
  Users,
  CalendarCheck2,
  BookOpenCheck,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Megaphone
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';

interface TeacherDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onQuickMarkAttendance: () => void;
  onGradeSubmission: (submissionId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onQuickMarkAttendance,
  onGradeSubmission,
}) => {
  const students = StorageService.getStudents();
  // Filter students in teacher's assigned classes (default Grade 8-A)
  const assignedClasses = currentUser.assignedClasses || ['Grade 8-A'];
  const teacherStudents = students.filter(s => assignedClasses.includes(s.class));

  // Today's attendance
  const today = new Date().toISOString().split('T')[0];
  const allAttendance = StorageService.getAttendance();
  const todayRecords = allAttendance.filter(a => a.date === today && assignedClasses.includes(a.class));
  const presentCount = todayRecords.filter(r => r.status === 'Present').length;
  const lateCount = todayRecords.filter(r => r.status === 'Late').length;
  const absentCount = todayRecords.filter(r => r.status === 'Absent').length;
  const unrecordedCount = Math.max(0, teacherStudents.length - todayRecords.length);

  // Pending assignments to review
  const assignments = StorageService.getAssignments();
  const submissions = StorageService.getSubmissions();
  const pendingReviews = submissions.filter(s => s.status === 'Submitted');

  // Messages addressed to teacher
  const messages = StorageService.getMessages().filter(
    m => m.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()
  );
  const unreadMessages = messages.filter(m => !m.isRead);

  // Upcoming meetings for teacher
  const meetings = StorageService.getMeetings().filter(
    m => m.teacherId === currentUser.id && (m.status === 'Requested' || m.status === 'Confirmed')
  );

  return (
    <div className="space-y-6">
      
      {/* Teacher Hero Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-pink-700 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-600/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-1">
                <span>Faculty Dashboard</span>
                <span>·</span>
                <span>{assignedClasses.join(', ')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-pink-100 mt-0.5">
                {currentUser.qualification} · Subjects: {(currentUser.subjects || ['Mathematics']).join(', ')}
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <button
              onClick={onQuickMarkAttendance}
              className="px-4 py-2 bg-white text-pink-600 hover:bg-pink-50 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </button>
            <button
              onClick={() => onNavigateTab('academics')}
              className="px-4 py-2 bg-pink-800/80 hover:bg-pink-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enter Marks</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Assigned Students */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Students</span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {teacherStudents.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Across {assignedClasses.length} section(s)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Avg class academic standing: 91.8%
          </p>
        </div>

        {/* Today's Attendance Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {presentCount} / {teacherStudents.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {lateCount > 0 ? `(${lateCount} late)` : 'Present'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {unrecordedCount > 0 ? `${unrecordedCount} student(s) roll unrecorded today` : 'All assigned records logged'}
          </p>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Reviews</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <BookOpenCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {pendingReviews.length}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Needs feedback
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {assignments.length} active assignments published
          </p>
        </div>

        {/* Parent Requests & Meetings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Meetings & Inquiries</span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {meetings.length}
            </span>
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
              {unreadMessages.length} unread msg
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Office hours: {currentUser.availability || '3:30 - 5:00 PM'}
          </p>
        </div>

      </div>

      {/* Middle Grid: Pending Homework Grading & Parent Meeting Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pending Submissions Grading */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-pink-600" />
                <span>Student Submissions Awaiting Review</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Assign grades and constructive feedback</p>
            </div>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Assignments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingReviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All student homework submissions have been evaluated!
              </div>
            ) : (
              pendingReviews.map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId);
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{sub.studentName}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold truncate">{asg?.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 italic mt-1">"{sub.submissionText}"</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Submitted: {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => onGradeSubmission(sub.id)}
                      className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-colors"
                    >
                      Grade Now
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Parent Meeting Requests */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-600" />
              <span>Parent Meeting Schedule</span>
            </h2>
            <button
              onClick={() => onNavigateTab('meetings')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              Open Scheduler
            </button>
          </div>

          <div className="space-y-3">
            {meetings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No meeting requests pending.</p>
            ) : (
              meetings.slice(0, 4).map(m => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{m.parentName}</p>
                      <p className="text-[11px] text-slate-500">Parent of {m.studentName}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      m.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{m.purpose}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-pink-600" />
                      {m.date} · {m.startTime}-{m.endTime}
                    </span>
                    <button
                      onClick={() => onNavigateTab('meetings')}
                      className="text-pink-600 dark:text-pink-400 font-semibold hover:underline"
                    >
                      View / Respond
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-600" />
              <span>Assigned Class Roster (Grade 8-A)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick overview of academic status and contact info</p>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
          >
            View Full Student Profiles ({teacherStudents.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3">Roll No.</th>
                <th className="pb-3">Class</th>
                <th className="pb-3">Attendance</th>
                <th className="pb-3">Academics</th>
                <th className="pb-3">Parent Contact</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {teacherStudents.slice(0, 5).map(s => (
                <tr key={s.id} className="hover:bg-pink-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-2 flex items-center gap-2.5">
                    <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                  </td>
                  <td className="py-3 font-mono">{s.rollNumber}</td>
                  <td className="py-3">{s.class}</td>
                  <td className="py-3">
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{s.overallAttendancePct}%</span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold font-mono text-pink-600 dark:text-pink-400">{s.overallAcademicPct}%</span>
                  </td>
                  <td className="py-3">{s.parentName} ({s.parentPhone})</td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => onNavigateTab('students')}
                      className="text-pink-600 dark:text-pink-400 hover:underline font-semibold"
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import {
  GraduationCap,
  CalendarCheck2,
  CreditCard,
  MessageSquare,
  Calendar,
  BookOpenCheck,
  Megaphone,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';

interface ParentDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenReportCard: (academicId: string) => void;
  onOpenFeePayment: (feeId: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onOpenReportCard,
  onOpenFeePayment,
}) => {
  const students = StorageService.getStudents();
  // Find linked student (default to stu-101 Aarav Sharma)
  const child = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  const academics = StorageService.getAcademics().filter(a => a.studentId === child?.id);
  const latestExam = academics[0];

  const fees = StorageService.getFees().filter(f => f.studentId === child?.id);
  const pendingFees = fees.filter(f => f.status !== 'Paid');
  const totalPendingAmount = pendingFees.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0);

  const meetings = StorageService.getMeetings().filter(
    m => (m.parentId === currentUser.id || m.studentId === child?.id) && m.status !== 'Cancelled'
  );
  const upcomingMeetings = meetings.filter(m => m.status === 'Confirmed' || m.status === 'Requested');

  const assignments = StorageService.getAssignments().filter(a => a.class === child?.class);
  const submissions = StorageService.getSubmissions().filter(s => s.studentId === child?.id);

  const messages = StorageService.getMessages().filter(
    m => m.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()
  );
  const unreadMessages = messages.filter(m => !m.isRead);

  const announcements = StorageService.getAnnouncements().slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Top Child Identity Card */}
      <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={child?.avatar}
              alt={child?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-1">
                <span>{child?.class}</span>
                <span>·</span>
                <span>Roll: {child?.rollNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {child?.name}
              </h1>
              <p className="text-xs sm:text-sm text-pink-100 mt-0.5">
                Class Teacher: <span className="font-semibold text-white">{child?.classTeacherName}</span> ({child?.classTeacherEmail})
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <button
              onClick={() => onNavigateTab('messaging')}
              className="px-4 py-2 bg-white text-pink-600 hover:bg-pink-50 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Teacher</span>
            </button>
            <button
              onClick={() => onNavigateTab('meetings')}
              className="px-4 py-2 bg-pink-700/80 hover:bg-pink-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Academic Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Academic Standing</span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {child?.overallAcademicPct}%
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Grade A+
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {latestExam ? `${latestExam.examName}: ${latestExam.totalObtained}/${latestExam.totalMax}` : 'Current term aggregate'}
          </p>
        </div>

        {/* Attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {child?.overallAttendancePct}%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Regular
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Excellent presence record this academic semester
          </p>
        </div>

        {/* Pending Fee */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Fees</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              ${totalPendingAmount}
            </span>
            {totalPendingAmount > 0 ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {pendingFees.length} Pending
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                All Paid
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pendingFees[0] ? `Due: ${pendingFees[0].dueDate} (${pendingFees[0].category})` : 'No dues pending'}
          </p>
        </div>

        {/* Unread Communications */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Messages & Alerts</span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {unreadMessages.length}
            </span>
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
              Unread
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {upcomingMeetings.length} upcoming teacher meetings
          </p>
        </div>

      </div>

      {/* Middle Split: Academic Snapshot & Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Academic Subject Performance Snapshot */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-pink-600" />
                <span>Subject Scores &amp; Report Card</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {latestExam?.examName || 'Term Evaluation'} · Evaluated by Faculty
              </p>
            </div>
            {latestExam && (
              <button
                onClick={() => onOpenReportCard(latestExam.id)}
                className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Report Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {latestExam ? (
            <div className="space-y-3 pt-2">
              {latestExam.scores.map(s => {
                const pct = Math.round((s.obtainedMarks / s.maxMarks) * 100);
                return (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{s.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400 font-mono">{s.obtainedMarks}/{s.maxMarks}</span>
                        <span className="font-bold text-pink-600 dark:text-pink-400">{pct}% ({s.grade})</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 p-3.5 rounded-2xl bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Teacher Remarks:</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-0.5">
                  "{latestExam.teacherFeedback}"
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No examination records yet.</p>
          )}
        </div>

        {/* Upcoming Meetings & Pending Fees */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upcoming Parent-Teacher Meetings */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span>Upcoming Meetings</span>
              </h2>
              <button
                onClick={() => onNavigateTab('meetings')}
                className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
              >
                Schedule New
              </button>
            </div>

            <div className="space-y-3">
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">No scheduled meetings at this time.</p>
                  <button
                    onClick={() => onNavigateTab('meetings')}
                    className="mt-2 text-xs font-semibold text-pink-600 hover:underline"
                  >
                    Request a conference with Mrs. Jenkins
                  </button>
                </div>
              ) : (
                upcomingMeetings.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{m.title}</p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                        m.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-600" />
                        {m.date} · {m.startTime} - {m.endTime}
                      </span>
                      <span>·</span>
                      <span>{m.teacherName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Fee Reminder */}
          {pendingFees.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl p-5 border border-amber-200/70 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Outstanding School Fees</h3>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                You have {pendingFees.length} pending installment(s) totaling <strong>${totalPendingAmount}</strong> due soon.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {pendingFees[0].category}: ${pendingFees[0].totalAmount - pendingFees[0].paidAmount} balance
                </span>
                <button
                  onClick={() => onOpenFeePayment(pendingFees[0].id)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Pay Now (Demo)
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Bottom Section: Homework Assignments & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Assignments */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-pink-600" />
              <span>Homework &amp; Assignments</span>
            </h2>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              View All ({assignments.length})
            </button>
          </div>

          <div className="space-y-3">
            {assignments.slice(0, 3).map(asg => {
              const sub = submissions.find(s => s.assignmentId === asg.id);
              return (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400">{asg.subject}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{asg.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Due: {asg.dueDate} · Max Score: {asg.maxScore}</p>
                  </div>

                  <div>
                    {sub ? (
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        sub.status === 'Reviewed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {sub.status === 'Reviewed' ? `Graded: ${sub.score}/${asg.maxScore}` : 'Submitted'}
                      </span>
                    ) : (
                      <button
                        onClick={() => onNavigateTab('assignments')}
                        className="px-3 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-slate-800 dark:text-pink-400 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-pink-600" />
              <span>School Circulars</span>
            </h2>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              All Events
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className="p-3 rounded-2xl bg-pink-50/40 dark:bg-slate-800/40 border border-pink-100/60 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    {ann.category} · {ann.date}
                  </span>
                  <span className="text-[10px] text-slate-400">{ann.targetAudience}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                  {ann.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {ann.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

import React from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  MessageSquare,
  CalendarCheck2,
  Calendar,
  FileSpreadsheet,
  RotateCcw,
  PlusCircle,
  Megaphone,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenAddAnnouncement: () => void;
  onResetData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onOpenAddStudent,
  onOpenAddAnnouncement,
  onResetData,
}) => {
  const users = StorageService.getUsers();
  const students = StorageService.getStudents();
  const fees = StorageService.getFees();
  const attendance = StorageService.getAttendance();
  const messages = StorageService.getMessages();
  const meetings = StorageService.getMeetings();

  const parentsCount = users.filter(u => u.role === 'parent').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;

  // Fee metrics
  const totalAssessedFees = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalCollectedFees = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPendingFees = totalAssessedFees - totalCollectedFees;
  const collectionPct = totalAssessedFees > 0 ? Math.round((totalCollectedFees / totalAssessedFees) * 100) : 0;

  // Attendance metrics
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(a => a.date === today);
  const todayPresent = todayRecords.filter(a => a.status === 'Present').length;
  const todayLate = todayRecords.filter(a => a.status === 'Late').length;
  const todayAbsent = todayRecords.filter(a => a.status === 'Absent').length;

  // School average academic score
  const avgAcademic = Math.round(
    students.reduce((acc, s) => acc + s.overallAcademicPct, 0) / (students.length || 1) * 10
  ) / 10;

  return (
    <div className="space-y-6">
      
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950 to-pink-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-pink-500/30 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold backdrop-blur-xs mb-1">
                <span>Principal &amp; Institutional Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-pink-200 mt-0.5">
                Riverdale Comprehensive High School · Academic Year 2026-2027
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate School Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enrolled</span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {students.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Students
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {parentsCount} registered parents · {teachersCount} faculty members
          </p>
        </div>

        {/* Academic Standing */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mean Academic GPA</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {avgAcademic}%
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Distinction
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across 4 active grade levels (8-A, 8-B, 9-A, 10-A)
          </p>
        </div>

        {/* Fee Collection Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fee Collection</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              ${totalCollectedFees.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              {collectionPct}% Paid
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ${totalPendingFees.toLocaleString()} remaining balance
          </p>
        </div>

        {/* Total Communication & Meetings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Portal Engagement</span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {messages.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Messages
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {meetings.length} conferences scheduled / completed
          </p>
        </div>

      </div>

      {/* Middle Grid: Today's Roll Call & Fee Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Attendance Breakdown */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-pink-600" />
              <span>Today's Daily Attendance Pulse</span>
            </h2>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              Full Roll Register
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
              <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{todayPresent}</span>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mt-0.5">Present</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
              <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">{todayLate}</span>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mt-0.5">Late Arrival</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-center">
              <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">{todayAbsent}</span>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-200 mt-0.5">Absent</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            Automated notifications are sent to parents upon teacher morning roll call submission. 
            Overall school attendance retention rate currently stands at <strong>94.6%</strong>.
          </p>
        </div>

        {/* Fee Collection Progress Bar */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-600" />
              <span>Institutional Fee Status</span>
            </h2>
            <button
              onClick={() => onNavigateTab('fees')}
              className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
            >
              Fee Ledger
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Revenue Realization ({collectionPct}%)</span>
              <span className="font-mono text-slate-900 dark:text-white">
                ${totalCollectedFees.toLocaleString()} / ${totalAssessedFees.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-pink-600 rounded-full"
                style={{ width: `${collectionPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-medium">Fully Paid Accounts</span>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {fees.filter(f => f.status === 'Paid').length} records
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-medium">Pending Dues</span>
              <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {fees.filter(f => f.status !== 'Paid').length} records
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Quick Action Cards & Demo Tools */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Institutional Management &amp; Evaluation Tools
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onOpenAddAnnouncement}
            className="p-4 rounded-2xl bg-pink-50/50 dark:bg-slate-800/60 hover:bg-pink-100/70 dark:hover:bg-slate-700/60 border border-pink-100 dark:border-slate-700 text-left transition-colors group"
          >
            <Megaphone className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform mb-2" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Publish Notice</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Broadcast circular to parents &amp; teachers</p>
          </button>

          <button
            onClick={() => onNavigateTab('academics')}
            className="p-4 rounded-2xl bg-pink-50/50 dark:bg-slate-800/60 hover:bg-pink-100/70 dark:hover:bg-slate-700/60 border border-pink-100 dark:border-slate-700 text-left transition-colors group"
          >
            <GraduationCap className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform mb-2" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Examination Center</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Audit marks cards and generate report cards</p>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="p-4 rounded-2xl bg-pink-50/50 dark:bg-slate-800/60 hover:bg-pink-100/70 dark:hover:bg-slate-700/60 border border-pink-100 dark:border-slate-700 text-left transition-colors group"
          >
            <FileSpreadsheet className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform mb-2" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Export to PDF / CSV</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Download full attendance &amp; fee ledgers</p>
          </button>

          <button
            onClick={onResetData}
            className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-900/50 text-left transition-colors group"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 group-hover:-rotate-45 transition-transform mb-2" />
            <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">Reset Demo Data</h3>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400 mt-0.5">Restore all demo records to initial state</p>
          </button>
        </div>
      </div>

    </div>
  );
};

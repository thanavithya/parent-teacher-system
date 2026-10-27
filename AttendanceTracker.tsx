import React, { useState } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Check,
  Clock,
  XCircle,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, Student, AttendanceStatus, AttendanceRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { exportAttendancePDF, exportToCSV } from '../../utils/pdfExport';

interface AttendanceTrackerProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  currentUser,
  onShowToast
}) => {
  const students = StorageService.getStudents();
  const allRecords = StorageService.getAttendance();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('Grade 8-A');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // For parent view
  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  // For teacher attendance taking form state
  const classStudents = students.filter(s => s.class === selectedClass);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    classStudents.forEach(s => {
      const existing = allRecords.find(r => r.studentId === s.id && r.date === selectedDate);
      initial[s.id] = {
        status: existing?.status || 'Present',
        remarks: existing?.remarks || ''
      };
    });
    return initial;
  });

  // Re-sync sheet when date or class changes
  const handleDateOrClassChange = (newDate: string, newClass: string) => {
    setSelectedDate(newDate);
    setSelectedClass(newClass);
    const newStudents = students.filter(s => s.class === newClass);
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    newStudents.forEach(s => {
      const existing = allRecords.find(r => r.studentId === s.id && r.date === newDate);
      updated[s.id] = {
        status: existing?.status || 'Present',
        remarks: existing?.remarks || ''
      };
    });
    setAttendanceSheet(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSaveAttendance = () => {
    classStudents.forEach(s => {
      const entry = attendanceSheet[s.id] || { status: 'Present', remarks: '' };
      StorageService.markAttendance({
        studentId: s.id,
        studentName: s.name,
        class: s.class,
        date: selectedDate,
        status: entry.status,
        markedBy: currentUser.name,
        remarks: entry.remarks
      });
    });
    onShowToast('success', 'Attendance Saved', `Roll call for ${selectedClass} on ${selectedDate} logged.`);
  };

  // Records to display in history table
  let displayRecords = allRecords;
  if (isParent && linkedChild) {
    displayRecords = allRecords.filter(r => r.studentId === linkedChild.id);
  } else {
    displayRecords = allRecords.filter(r => r.class === selectedClass);
  }

  // Export handlers
  const handleExportPDF = () => {
    exportAttendancePDF(displayRecords, `Attendance Report - ${isParent ? linkedChild?.name : selectedClass}`);
    onShowToast('success', 'PDF Exported', 'Attendance PDF report downloaded.');
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Student Name', 'Class', 'Status', 'Marked By', 'Remarks'];
    const rows = displayRecords.map(r => [
      r.date,
      r.studentName,
      r.class,
      r.status,
      r.markedBy,
      r.remarks || ''
    ]);
    exportToCSV(`Attendance_${selectedClass}_${selectedDate}`, headers, rows);
    onShowToast('success', 'CSV Exported', 'Attendance CSV dataset downloaded.');
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-pink-600" />
            <span>Attendance Tracking System</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isParent
              ? `Daily presence log and attendance percentage for ${linkedChild?.name}`
              : 'Daily classroom roll call, absence tracking, and CSV/PDF report generation'}
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* PARENT VIEW: Child Attendance Metrics & History */}
      {isParent ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50 text-center">
                <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {linkedChild?.overallAttendancePct}%
                </span>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                  Overall Semester Attendance
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/50 dark:border-pink-900/50 text-center">
                <span className="text-3xl font-bold font-mono text-pink-600 dark:text-pink-400">
                  {displayRecords.filter(r => r.status === 'Present').length} Days
                </span>
                <p className="text-xs font-semibold text-pink-800 dark:text-pink-300 mt-1">
                  Present in School
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 text-center">
                <span className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {displayRecords.filter(r => r.status === 'Late' || r.status === 'Absent').length} Days
                </span>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">
                  Excused / Late Records
                </p>
              </div>
            </div>
          </div>

          {/* Child Attendance History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Attendance History ({linkedChild?.name})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Class</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Marked By</th>
                    <th className="pb-3 pr-2">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pl-2 font-mono font-medium">{r.date}</td>
                      <td className="py-3">{r.class}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.status === 'Late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{r.markedBy}</td>
                      <td className="py-3 pr-2 text-slate-500 italic">{r.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TEACHER & ADMIN VIEW: Marking Roll Call & Class Register */
        <div className="space-y-6">
          
          {/* Controls Bar: Class and Date Picker */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={e => handleDateOrClassChange(selectedDate, e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Grade 8-A">Grade 8-A</option>
                  <option value="Grade 8-B">Grade 8-B</option>
                  <option value="Grade 9-A">Grade 9-A</option>
                  <option value="Grade 10-A">Grade 10-A</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => handleDateOrClassChange(e.target.value, selectedClass)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAttendance}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Update Class Register</span>
            </button>
          </div>

          {/* Roll Call Marking Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Roll Call: {selectedClass} ({classStudents.length} Students)
              </h2>
              <span className="text-xs text-slate-500 font-mono">Date: {selectedDate}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">Roll</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Status Selection</th>
                    <th className="pb-3 pr-2">Daily Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.map(s => {
                    const currentStatus = attendanceSheet[s.id]?.status || 'Present';
                    const currentRemarks = attendanceSheet[s.id]?.remarks || '';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 pl-2 font-mono font-semibold text-slate-500">{s.rollNumber}</td>
                        <td className="py-3 flex items-center gap-2.5">
                          <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                            <p className="text-[10px] text-slate-400">Parent: {s.parentName}</p>
                          </div>
                        </td>

                        {/* Status Selectors */}
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            {(['Present', 'Late', 'Absent'] as AttendanceStatus[]).map(st => {
                              const isChecked = currentStatus === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(s.id, st)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    isChecked
                                      ? st === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : st === 'Late'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  }`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="py-3 pr-2">
                          <input
                            type="text"
                            value={currentRemarks}
                            onChange={e => handleRemarksChange(s.id, e.target.value)}
                            placeholder="Optional remark (e.g. excused doctor visit)"
                            className="w-full max-w-xs px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-pink-500 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

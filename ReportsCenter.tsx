import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  GraduationCap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
import { exportToCSV } from '../../utils/pdfExport';

interface ReportsCenterProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

type ReportType =
  | 'academics'
  | 'attendance'
  | 'fees'
  | 'meetings'
  | 'assignments';

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  currentUser,
  onShowToast
}) => {
  const students = StorageService.getStudents();
  const academics = StorageService.getAcademics();
  const attendance = StorageService.getAttendance();
  const fees = StorageService.getFees();
  const meetings = StorageService.getMeetings();
  const assignments = StorageService.getAssignments();
  const submissions = StorageService.getSubmissions();

  const isParent = currentUser.role === 'parent';
  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  const [reportType, setReportType] = useState<ReportType>('academics');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStudentId, setSelectedStudentId] = useState(isParent ? linkedChild?.id : 'All');

  // Filter students
  let filteredStudents = students;
  if (isParent) {
    filteredStudents = [linkedChild].filter(Boolean) as typeof students;
  } else if (selectedClass !== 'All') {
    filteredStudents = students.filter(s => s.class === selectedClass);
  }

  // Build report datasets based on reportType
  let tableHeaders: string[] = [];
  let tableRows: (string | number)[][] = [];
  let reportTitle = '';

  if (reportType === 'academics') {
    reportTitle = 'Student Academic Progress & Examination Scores';
    tableHeaders = ['Student Name', 'Class', 'Exam Name', 'Date', 'Score', 'Percentage', 'Grade', 'Remarks'];
    let list = academics;
    if (selectedStudentId !== 'All') list = list.filter(a => a.studentId === selectedStudentId);
    else if (selectedClass !== 'All') list = list.filter(a => a.class === selectedClass);

    tableRows = list.map(a => [
      a.studentName,
      a.class,
      a.examName,
      a.examDate,
      `${a.totalObtained}/${a.totalMax}`,
      `${a.percentage}%`,
      a.overallGrade,
      a.teacherFeedback || 'Good performance'
    ]);
  } else if (reportType === 'attendance') {
    reportTitle = 'Classroom Attendance & Roll Register';
    tableHeaders = ['Date', 'Student Name', 'Class', 'Status', 'Marked By', 'Teacher Remarks'];
    let list = attendance;
    if (selectedStudentId !== 'All') list = list.filter(r => r.studentId === selectedStudentId);
    else if (selectedClass !== 'All') list = list.filter(r => r.class === selectedClass);

    tableRows = list.map(r => [
      r.date,
      r.studentName,
      r.class,
      r.status,
      r.markedBy,
      r.remarks || '-'
    ]);
  } else if (reportType === 'fees') {
    reportTitle = 'School Fee Assessment & Collection Ledger';
    tableHeaders = ['Student Name', 'Class', 'Category', 'Total Fee', 'Amount Paid', 'Balance', 'Due Date', 'Status'];
    let list = fees;
    if (selectedStudentId !== 'All') list = list.filter(f => f.studentId === selectedStudentId);
    else if (selectedClass !== 'All') list = list.filter(f => f.class === selectedClass);

    tableRows = list.map(f => [
      f.studentName,
      f.class,
      f.category,
      `$${f.totalAmount}`,
      `$${f.paidAmount}`,
      `$${Math.max(0, f.totalAmount - f.paidAmount)}`,
      f.dueDate,
      f.status
    ]);
  } else if (reportType === 'meetings') {
    reportTitle = 'Parent-Teacher Meeting & Conference Log';
    tableHeaders = ['Date', 'Time', 'Title', 'Parent', 'Teacher', 'Student', 'Status'];
    let list = meetings;
    if (selectedStudentId !== 'All') list = list.filter(m => m.studentId === selectedStudentId);

    tableRows = list.map(m => [
      m.date,
      `${m.startTime} - ${m.endTime}`,
      m.title,
      m.parentName,
      m.teacherName,
      m.studentName,
      m.status
    ]);
  } else if (reportType === 'assignments') {
    reportTitle = 'Assignment Submissions & Homework Completion Report';
    tableHeaders = ['Assignment Title', 'Subject', 'Class', 'Due Date', 'Max Score', 'Submissions'];
    let list = assignments;
    if (selectedClass !== 'All') list = list.filter(a => a.class === selectedClass);

    tableRows = list.map(a => {
      const subCount = submissions.filter(s => s.assignmentId === a.id).length;
      return [
        a.title,
        a.subject,
        a.class,
        a.dueDate,
        a.maxScore,
        `${subCount} student(s)`
      ];
    });
  }

  const handleExportCSV = () => {
    exportToCSV(`Report_${reportType}_${new Date().toISOString().split('T')[0]}`, tableHeaders, tableRows);
    onShowToast('success', 'CSV Generated', `${reportTitle} exported to CSV.`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PARENTTEACHER CONNECT', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(reportTitle, 14, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 155, 25);

    autoTable(doc, {
      startY: 40,
      head: [tableHeaders],
      body: tableRows,
      headStyles: {
        fillColor: [236, 72, 153],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3.5
      },
      alternateRowStyles: {
        fillColor: [255, 247, 251]
      }
    });

    doc.save(`Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    onShowToast('success', 'PDF Generated', `${reportTitle} exported to PDF.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-pink-600" />
            <span>School Reports &amp; Data Export Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable tables and instant PDF / CSV exports for academic scores, attendance, and fee logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'academics', label: 'Academic Progress Reports' },
          { id: 'attendance', label: 'Attendance Records' },
          { id: 'fees', label: 'Fee Collection & Balances' },
          { id: 'meetings', label: 'Parent-Teacher Conferences' },
          { id: 'assignments', label: 'Assignment Completion' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setReportType(item.id as ReportType)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              reportType === item.id
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {!isParent && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="All">All Classes</option>
                <option value="Grade 8-A">Grade 8-A</option>
                <option value="Grade 8-B">Grade 8-B</option>
                <option value="Grade 9-A">Grade 9-A</option>
              </select>
            </div>
          )}

          {!isParent && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter Student</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="All">All Students</option>
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500">Report Status: </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {tableRows.length} record(s) ready for export
          </span>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {reportTitle}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-pink-50/50 dark:bg-slate-800 text-pink-900 dark:text-pink-300 font-bold">
                {tableHeaders.map((h, i) => (
                  <th key={h} className={`py-3 ${i === 0 ? 'pl-3' : ''} ${i === tableHeaders.length - 1 ? 'pr-3' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-8 text-center text-slate-400">
                    No records found matching current criteria.
                  </td>
                </tr>
              ) : (
                tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {row.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 ${cIdx === 0 ? 'pl-3 font-semibold text-slate-900 dark:text-white' : ''} ${
                          cIdx === row.length - 1 ? 'pr-3' : ''
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

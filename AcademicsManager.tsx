import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  FileText,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  X,
  Check,
  Download
} from 'lucide-react';
import { User, Student, AcademicRecord, SubjectScore } from '../../types';
import { StorageService } from '../../services/storage';
import { exportReportCardPDF } from '../../utils/pdfExport';

interface AcademicsManagerProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  initialReportCardId?: string | null;
}

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Computer Science',
  'Arts',
  'Physical Education'
];

export const AcademicsManager: React.FC<AcademicsManagerProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm,
  initialReportCardId
}) => {
  const students = StorageService.getStudents();
  const academics = StorageService.getAcademics();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  const [selectedExamName, setSelectedExamName] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Card Modal
  const [viewingRecord, setViewingRecord] = useState<AcademicRecord | null>(() => {
    if (initialReportCardId) {
      return academics.find(a => a.id === initialReportCardId) || null;
    }
    return null;
  });

  // Enter Marks Modal
  const [isEnterMarksOpen, setIsEnterMarksOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [examTitle, setExamTitle] = useState('Unit Assessment 2');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherFeedback, setTeacherFeedback] = useState('Strong conceptual grasp with room for practice.');
  const [subjectInputs, setSubjectInputs] = useState<Array<{ subject: string; obtainedMarks: number; maxMarks: number; remarks: string }>>(
    DEFAULT_SUBJECTS.map(subj => ({
      subject: subj,
      obtainedMarks: 85,
      maxMarks: 100,
      remarks: 'Good progress'
    }))
  );

  // Filter records
  let displayedAcademics = academics;
  if (isParent) {
    displayedAcademics = academics.filter(a => a.studentId === linkedChild?.id);
  } else {
    if (selectedClass !== 'All') {
      displayedAcademics = displayedAcademics.filter(a => a.class === selectedClass);
    }
    if (selectedExamName !== 'All') {
      displayedAcademics = displayedAcademics.filter(a => a.examName === selectedExamName);
    }
    if (searchQuery.trim()) {
      displayedAcademics = displayedAcademics.filter(a =>
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }

  const computeGrade = (pct: number): string => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const handleScoreChange = (index: number, val: number) => {
    setSubjectInputs(prev => {
      const copy = [...prev];
      copy[index].obtainedMarks = Math.min(copy[index].maxMarks, Math.max(0, val));
      return copy;
    });
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === targetStudentId);
    if (!student) return;

    let totalObt = 0;
    let totalMax = 0;
    const scores: SubjectScore[] = subjectInputs.map(item => {
      totalObt += item.obtainedMarks;
      totalMax += item.maxMarks;
      const pct = (item.obtainedMarks / item.maxMarks) * 100;
      return {
        subject: item.subject,
        obtainedMarks: item.obtainedMarks,
        maxMarks: item.maxMarks,
        grade: computeGrade(pct),
        remarks: item.remarks
      };
    });

    const percentage = Math.round((totalObt / totalMax) * 1000) / 10;
    const overallGrade = computeGrade(percentage);

    const record: AcademicRecord = {
      id: `acad-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      examName: examTitle,
      examDate,
      scores,
      totalObtained: totalObt,
      totalMax,
      percentage,
      overallGrade,
      teacherFeedback,
      status: 'Published'
    };

    StorageService.saveAcademicRecord(record);
    setIsEnterMarksOpen(false);
    onShowToast('success', 'Grades Recorded', `Assessment published for ${student.name}.`);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    onRequestConfirm('Delete Assessment', `Are you sure you want to remove the exam record for ${name}?`, () => {
      StorageService.deleteAcademicRecord(id);
      onShowToast('info', 'Assessment Deleted', 'The record was removed.');
      if (viewingRecord?.id === id) setViewingRecord(null);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Entry Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-pink-600" />
            <span>Academic Progress &amp; Grade Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject-wise assessments, automated GPA grade calculations, and printable official report cards
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => setIsEnterMarksOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Assessment Marks</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar (for Teachers & Admins) */}
      {!isParent && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-pink-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Class:</span>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="All">All Classes</option>
                <option value="Grade 8-A">Grade 8-A</option>
                <option value="Grade 8-B">Grade 8-B</option>
                <option value="Grade 9-A">Grade 9-A</option>
              </select>
            </div>
          </div>

          <span className="text-slate-400 font-mono">{displayedAcademics.length} record(s)</span>
        </div>
      )}

      {/* Records Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAcademics.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No examination records found</p>
          </div>
        ) : (
          displayedAcademics.map(rec => {
            const student = students.find(s => s.id === rec.studentId);
            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={rec.studentName}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-pink-500/20"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rec.studentName}</h3>
                        <p className="text-[11px] text-slate-500 font-mono">{rec.class} · {student?.rollNumber}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                      Grade {rec.overallGrade}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{rec.examName}</span>
                    <p className="text-[10px] text-slate-400">Date: {rec.examDate}</p>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Total Score: {rec.totalObtained}/{rec.totalMax}</span>
                      <span className="font-bold text-pink-600 dark:text-pink-400">{rec.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
                        style={{ width: `${rec.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Subject Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rec.scores.slice(0, 4).map(s => (
                      <span
                        key={s.subject}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
                      >
                        {s.subject}: <strong>{s.obtainedMarks}</strong> ({s.grade})
                      </span>
                    ))}
                    {rec.scores.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">+{rec.scores.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setViewingRecord(rec)}
                    className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Report Card</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        exportReportCardPDF(rec, student);
                        onShowToast('success', 'PDF Ready', 'Report card PDF downloaded.');
                      }}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {(isAdmin || isTeacher) && (
                      <button
                        onClick={() => handleDeleteRecord(rec.id, rec.studentName)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete assessment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Report Card Modal / Print View */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            
            {/* Modal Controls Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Official Student Report Card Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>
                <button
                  onClick={() => {
                    const st = students.find(s => s.id === viewingRecord.studentId);
                    exportReportCardPDF(viewingRecord, st);
                  }}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Document Body */}
            <div className="space-y-6 print-container text-slate-900 dark:text-white">
              
              {/* Institution Header */}
              <div className="bg-pink-600 text-white p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">ParentTeacher Connect</h2>
                  <p className="text-xs text-pink-100 mt-0.5">Riverdale Comprehensive High School</p>
                  <p className="text-[11px] text-pink-200 uppercase tracking-widest mt-1">Official Student Performance Record</p>
                </div>
                <div className="text-right text-xs text-pink-100">
                  <p>Examination: <strong>{viewingRecord.examName}</strong></p>
                  <p>Date: {viewingRecord.examDate}</p>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name</span>
                  <span className="font-bold text-sm">{viewingRecord.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Class &amp; Section</span>
                  <span className="font-semibold">{viewingRecord.class}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Overall Standing</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400 font-mono text-sm">
                    {viewingRecord.percentage}% ({viewingRecord.overallGrade})
                  </span>
                </div>
              </div>

              {/* Marks Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-pink-50/60 dark:bg-slate-800 text-pink-900 dark:text-pink-300 font-bold">
                      <th className="py-2.5 pl-3">Subject</th>
                      <th className="py-2.5">Max Marks</th>
                      <th className="py-2.5">Marks Obtained</th>
                      <th className="py-2.5">Percentage</th>
                      <th className="py-2.5">Grade</th>
                      <th className="py-2.5 pr-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingRecord.scores.map(s => (
                      <tr key={s.subject}>
                        <td className="py-2.5 pl-3 font-semibold text-slate-900 dark:text-white">{s.subject}</td>
                        <td className="py-2.5 font-mono">{s.maxMarks}</td>
                        <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">{s.obtainedMarks}</td>
                        <td className="py-2.5 font-mono">{Math.round((s.obtainedMarks / s.maxMarks) * 100)}%</td>
                        <td className="py-2.5 font-bold text-pink-600 dark:text-pink-400">{s.grade}</td>
                        <td className="py-2.5 pr-3 text-slate-500 italic">{s.remarks || 'Satisfactory'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 dark:border-slate-700 font-bold bg-pink-50/30 dark:bg-slate-800/50">
                      <td className="py-3 pl-3">Total Aggregate</td>
                      <td className="py-3 font-mono">{viewingRecord.totalMax}</td>
                      <td className="py-3 font-mono text-pink-600 dark:text-pink-400">{viewingRecord.totalObtained}</td>
                      <td className="py-3 font-mono">{viewingRecord.percentage}%</td>
                      <td className="py-3 text-pink-600 dark:text-pink-400">{viewingRecord.overallGrade}</td>
                      <td className="py-3 pr-3 text-emerald-600">Passed with Honors</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Remarks Box */}
              <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-slate-800/50 border border-pink-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Faculty Evaluation Summary:</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-0.5">
                  "{viewingRecord.teacherFeedback}"
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Enter Marks Modal for Teachers */}
      {isEnterMarksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-pink-600" />
                <span>Enter Assessment Marks &amp; Grades</span>
              </h3>
              <button
                onClick={() => setIsEnterMarksOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Student *
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={e => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
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
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    placeholder="e.g. Unit Test 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Assessment
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Subject Marks Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject Marks (Max 100 each)</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {subjectInputs.map((item, idx) => (
                    <div
                      key={item.subject}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 grid grid-cols-12 gap-3 items-center text-xs"
                    >
                      <span className="col-span-4 font-bold text-slate-900 dark:text-white truncate">{item.subject}</span>
                      <div className="col-span-3 flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={item.maxMarks}
                          value={item.obtainedMarks}
                          onChange={e => handleScoreChange(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-mono font-bold"
                        />
                        <span className="text-slate-400">/ {item.maxMarks}</span>
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={e => {
                            const val = e.target.value;
                            setSubjectInputs(prev => {
                              const copy = [...prev];
                              copy[idx].remarks = val;
                              return copy;
                            });
                          }}
                          placeholder="Subject remarks"
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Comprehensive Feedback
                </label>
                <textarea
                  rows={2}
                  value={teacherFeedback}
                  onChange={e => setTeacherFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEnterMarksOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

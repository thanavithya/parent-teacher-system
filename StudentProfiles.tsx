import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  GraduationCap,
  CalendarCheck2,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  FileText,
  HeartHandshake,
  X,
  Check
} from 'lucide-react';
import { Student, User } from '../../types';
import { StorageService } from '../../services/storage';
import { exportReportCardPDF } from '../../utils/pdfExport';

interface StudentProfilesProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const StudentProfiles: React.FC<StudentProfilesProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm
}) => {
  const students = StorageService.getStudents();
  const academics = StorageService.getAcademics();
  const behaviorRecords = StorageService.getBehaviorRecords();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  // If parent, select their linked student by default
  const defaultSelectedId = isParent
    ? currentUser.linkedStudentId || students[0]?.id
    : students[0]?.id;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultSelectedId);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Filter students based on role
  let visibleStudents = students;
  if (isParent) {
    visibleStudents = students.filter(s => s.id === currentUser.linkedStudentId);
    if (visibleStudents.length === 0 && students.length > 0) visibleStudents = [students[0]];
  } else if (isTeacher && currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
    visibleStudents = students.filter(s => currentUser.assignedClasses?.includes(s.class));
  }

  // Apply search & class filter
  const filteredStudents = visibleStudents.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId) || filteredStudents[0];
  const studentAcademics = academics.filter(a => a.studentId === selectedStudent?.id);
  const studentBehavior = behaviorRecords.filter(b => b.studentId === selectedStudent?.id);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent({ ...student });
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingStudent({
      id: `stu-${Date.now()}`,
      name: '',
      rollNumber: `8A-${Math.floor(10 + Math.random() * 89)}`,
      class: 'Grade 8-A',
      dateOfBirth: '2012-05-15',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gender: 'Female',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      classTeacherName: 'Mrs. Sarah Jenkins',
      classTeacherEmail: 'teacher@parentteacher.com',
      overallAttendancePct: 95.0,
      overallAcademicPct: 90.0,
      address: 'Riverdale Heights',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 019-9988'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editingStudent.name.trim() || !editingStudent.rollNumber.trim()) {
      onShowToast('error', 'Validation Error', 'Name and Roll Number are required.');
      return;
    }
    StorageService.saveStudent(editingStudent);
    setIsEditModalOpen(false);
    setSelectedStudentId(editingStudent.id);
    onShowToast('success', 'Student Saved', `${editingStudent.name}'s profile has been updated.`);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    onRequestConfirm(
      'Confirm Student Deletion',
      `Are you sure you want to delete ${name}'s student profile? This action will remove all linked records.`,
      () => {
        StorageService.deleteStudent(id);
        onShowToast('info', 'Student Removed', `${name} has been removed from the school registry.`);
        if (selectedStudentId === id) {
          setSelectedStudentId(students[0]?.id || '');
        }
      }
    );
  };

  const handleDownloadReport = (record: typeof studentAcademics[0]) => {
    exportReportCardPDF(record, selectedStudent);
    onShowToast('success', 'PDF Generated', `Report card for ${selectedStudent?.name} downloaded.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isParent ? 'My Child Academic Profile' : 'Student Profiles & Academic Records'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isParent
              ? 'View official performance metrics, attendance, and feedback for your linked child'
              : 'Directory of registered students with academic standing, guardians, and medical notes'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left List (hidden for parents with 1 child) & Right Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Student Directory List (for Teachers / Admins) */}
        {!isParent && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student or roll number..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'Grade 8-A', 'Grade 8-B', 'Grade 9-A', 'Grade 10-A'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setClassFilter(cls)}
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      classFilter === cls
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No students match your search.</p>
              ) : (
                filteredStudents.map(s => {
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`pt-2.5 first:pt-0 p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 shadow-xs'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-pink-500/20"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono">{s.rollNumber}</span>
                            <span>·</span>
                            <span>{s.class}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-pink-600 dark:text-pink-400">
                          {s.overallAcademicPct}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Att: {s.overallAttendancePct}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Column: Selected Student Full Profile View */}
        <div className={`${isParent ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-6`}>
          {selectedStudent ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-pink-500/20 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                        {selectedStudent.class}
                      </span>
                      <span className="text-xs font-mono text-slate-500">Roll #{selectedStudent.rollNumber}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Class Teacher: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStudent.classTeacherName}</span>
                    </p>
                  </div>
                </div>

                {/* Edit / Delete actions for Teachers or Admins */}
                {(isAdmin || isTeacher) && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleOpenEdit(selectedStudent)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5"
                      title="Edit student profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteStudent(selectedStudent.id, selectedStudent.name)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-rose-200 dark:border-rose-900 text-xs flex items-center gap-1.5"
                        title="Delete student profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats overview boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-pink-50/50 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Overall GPA</span>
                  <p className="text-lg font-bold font-mono text-pink-600 dark:text-pink-400 mt-0.5">
                    {selectedStudent.overallAcademicPct}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Attendance</span>
                  <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedStudent.overallAttendancePct}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Blood Group</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedStudent.bloodGroup || 'O+'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Date of Birth</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {selectedStudent.dateOfBirth}
                  </p>
                </div>
              </div>

              {/* Parent & Contact Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Parent / Guardian Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-pink-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">Parent Name &amp; Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {selectedStudent.parentName} ({selectedStudent.parentEmail})
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-pink-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">Emergency &amp; Primary Phone</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {selectedStudent.parentPhone} · {selectedStudent.emergencyContact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Examination History & Report Card Download */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Examination Records &amp; Report Cards
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{studentAcademics.length} exam(s) recorded</span>
                </div>

                <div className="space-y-3">
                  {studentAcademics.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 italic">No exam records published for this student.</p>
                  ) : (
                    studentAcademics.map(exam => (
                      <div
                        key={exam.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{exam.examName}</span>
                            <p className="text-[11px] text-slate-500">Conducted: {exam.examDate}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold font-mono text-pink-600 dark:text-pink-400">
                              {exam.totalObtained} / {exam.totalMax} ({exam.percentage}%) - {exam.overallGrade}
                            </span>
                            <button
                              onClick={() => handleDownloadReport(exam)}
                              className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>PDF Card</span>
                            </button>
                          </div>
                        </div>

                        {/* Subject chips */}
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                          {exam.scores.map(s => (
                            <div
                              key={s.subject}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[11px]"
                            >
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{s.subject}:</span>{' '}
                              <span className="font-bold font-mono text-pink-600 dark:text-pink-400">
                                {s.obtainedMarks}/{s.maxMarks} ({s.grade})
                              </span>
                            </div>
                          ))}
                        </div>

                        {exam.teacherFeedback && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white/70 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            "{exam.teacherFeedback}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Behavior & Conduct History */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Faculty Observations &amp; Behavior Milestones
                </h3>

                <div className="space-y-2">
                  {studentBehavior.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 italic">No behavioral notices recorded.</p>
                  ) : (
                    studentBehavior.map(b => (
                      <div
                        key={b.id}
                        className={`p-3 rounded-2xl border text-xs ${
                          b.type === 'Positive'
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{b.category}</span>
                          <span className="text-[10px] opacity-75">{b.date} · {b.teacherName}</span>
                        </div>
                        <p className="mt-1 leading-relaxed opacity-90">{b.remarks}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-pink-100 dark:border-slate-800">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold">No student selected</p>
            </div>
          )}
        </div>

      </div>

      {/* Edit / Add Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingStudent.name ? `Edit: ${editingStudent.name}` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.rollNumber}
                    onChange={e => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class &amp; Section
                  </label>
                  <select
                    value={editingStudent.class}
                    onChange={e => setEditingStudent({ ...editingStudent, class: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  >
                    <option value="Grade 8-A">Grade 8-A</option>
                    <option value="Grade 8-B">Grade 8-B</option>
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editingStudent.dateOfBirth}
                    onChange={e => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Full Name
                  </label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={e => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    value={editingStudent.parentEmail}
                    onChange={e => setEditingStudent({ ...editingStudent, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    value={editingStudent.parentPhone}
                    onChange={e => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Class Teacher
                  </label>
                  <input
                    type="text"
                    value={editingStudent.classTeacherName}
                    onChange={e => setEditingStudent({ ...editingStudent, classTeacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-xs"
                >
                  Save Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

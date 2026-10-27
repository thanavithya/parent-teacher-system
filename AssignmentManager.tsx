import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  X,
  Check,
  Search,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Assignment, AssignmentSubmission, AssignmentStatus } from '../../types';
import { StorageService } from '../../services/storage';

interface AssignmentManagerProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  currentUser,
  onShowToast,
  onRequestConfirm
}) => {
  const students = StorageService.getStudents();
  const assignments = StorageService.getAssignments();
  const submissions = StorageService.getSubmissions();

  const isParent = currentUser.role === 'parent';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  const [subjectFilter, setSubjectFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Assignment Modal (Teachers/Admins)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newClass, setNewClass] = useState('Grade 8-A');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [newMaxScore, setNewMaxScore] = useState(25);
  const [newDescription, setNewDescription] = useState('');

  // Submit Work Modal (Parents/Students)
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  // Grade Submission Modal (Teachers/Admins)
  const [gradingSubmission, setGradingSubmission] = useState<{ sub: AssignmentSubmission; asg: Assignment } | null>(null);
  const [awardedScore, setAwardedScore] = useState(20);
  const [gradingFeedback, setGradingFeedback] = useState('Well researched and thoroughly explained.');

  // Filter assignments
  let displayedAssignments = assignments;
  if (isParent && linkedChild) {
    displayedAssignments = assignments.filter(a => a.class === linkedChild.class);
  } else {
    if (classFilter !== 'All') {
      displayedAssignments = displayedAssignments.filter(a => a.class === classFilter);
    }
  }

  if (subjectFilter !== 'All') {
    displayedAssignments = displayedAssignments.filter(a => a.subject === subjectFilter);
  }

  if (searchQuery.trim()) {
    displayedAssignments = displayedAssignments.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      onShowToast('error', 'Validation Error', 'Title and description are required.');
      return;
    }

    const created: Assignment = {
      id: `asg-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      description: newDescription.trim(),
      class: newClass,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      teacherName: currentUser.name,
      teacherId: currentUser.id,
      maxScore: Number(newMaxScore)
    };

    StorageService.saveAssignment(created);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
    onShowToast('success', 'Assignment Created', `Published to ${newClass}.`);
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionText.trim()) return;

    StorageService.submitAssignment(
      submittingAssignment.id,
      linkedChild ? linkedChild.id : 'stu-101',
      linkedChild ? linkedChild.name : 'Aarav Sharma',
      submissionText.trim()
    );

    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.6 }
    });

    onShowToast('success', 'Homework Submitted', `Submitted for "${submittingAssignment.title}".`);
    setSubmittingAssignment(null);
    setSubmissionText('');
  };

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    StorageService.gradeSubmission(
      gradingSubmission.sub.id,
      Number(awardedScore),
      gradingFeedback.trim(),
      currentUser.name
    );

    onShowToast('success', 'Grading Saved', `Feedback logged for ${gradingSubmission.sub.studentName}.`);
    setGradingSubmission(null);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    onRequestConfirm('Delete Assignment', `Are you sure you want to remove "${title}"?`, () => {
      StorageService.deleteAssignment(id);
      onShowToast('info', 'Assignment Removed', 'The task was deleted.');
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-pink-600" />
            <span>Homework &amp; Assignment Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isParent
              ? `Track deadlines, submit assignments, and review teacher feedback for ${linkedChild?.name}`
              : 'Create classroom assignments, review student essay submissions, and assign scores'}
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Assignment</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-pink-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assignment title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Social Studies">Social Studies</option>
          </select>

          {!isParent && (
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value="All">All Classes</option>
              <option value="Grade 8-A">Grade 8-A</option>
              <option value="Grade 8-B">Grade 8-B</option>
              <option value="Grade 9-A">Grade 9-A</option>
            </select>
          )}
        </div>

        <span className="text-slate-400 font-mono">{displayedAssignments.length} assignment(s)</span>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedAssignments.map(asg => {
          const childSub = isParent
            ? submissions.find(s => s.assignmentId === asg.id && s.studentId === linkedChild?.id)
            : null;
          const classSubmissions = submissions.filter(s => s.assignmentId === asg.id);

          return (
            <div
              key={asg.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                    {asg.subject} · {asg.class}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-pink-600" />
                    <span>Due: {asg.dueDate}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{asg.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {asg.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Assigned by: <strong>{asg.teacherName}</strong></span>
                  <span className="font-mono font-bold text-pink-600 dark:text-pink-400">Max Score: {asg.maxScore}</span>
                </div>

                {/* Parent / Student status pill */}
                {isParent && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Submission Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        childSub
                          ? childSub.status === 'Reviewed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {childSub ? childSub.status : 'Pending Submission'}
                      </span>
                    </div>

                    {childSub && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <p className="italic">"{childSub.submissionText}"</p>
                        {childSub.score !== undefined && (
                          <div className="mt-1 flex items-center justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                            <span>Score: {childSub.score} / {asg.maxScore}</span>
                            <span className="text-slate-500">Feedback: {childSub.feedback}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher submission list */}
                {(isTeacher || isAdmin) && classSubmissions.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Student Submissions ({classSubmissions.length}):
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {classSubmissions.map(sub => (
                        <div
                          key={sub.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.studentName}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 italic">"{sub.submissionText}"</span>
                          </div>
                          <div>
                            {sub.status === 'Reviewed' ? (
                              <span className="text-emerald-600 font-mono font-bold text-xs">
                                {sub.score}/{asg.maxScore}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setGradingSubmission({ sub, asg });
                                  setAwardedScore(Math.floor(asg.maxScore * 0.9));
                                }}
                                className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[11px] font-semibold"
                              >
                                Grade
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {isParent && (
                  <button
                    onClick={() => {
                      setSubmittingAssignment(asg);
                      setSubmissionText(childSub?.submissionText || '');
                    }}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{childSub ? 'Update Submission' : 'Submit Homework'}</span>
                  </button>
                )}

                {(isTeacher || isAdmin) && (
                  <button
                    onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove Assignment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Homework Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-pink-600" />
                <span>Submit Homework: {submittingAssignment.title}</span>
              </h3>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div className="p-3 rounded-xl bg-pink-50/50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p>Subject: <strong>{submittingAssignment.subject}</strong></p>
                <p className="mt-0.5">Prompt: {submittingAssignment.description}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Answers &amp; Submission Text *
                </label>
                <textarea
                  required
                  rows={6}
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                  placeholder="Enter your completed exercise steps, answers, or essay text here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-pink-600" />
                <span>Grade Student Homework</span>
              </h3>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <p>Student: <strong>{gradingSubmission.sub.studentName}</strong></p>
                <p>Assignment: <strong>{gradingSubmission.asg.title}</strong> (Max: {gradingSubmission.asg.maxScore})</p>
                <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-sans italic text-slate-700 dark:text-slate-300">
                  "{gradingSubmission.sub.submissionText}"
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Awarded Score (out of {gradingSubmission.asg.maxScore}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={gradingSubmission.asg.maxScore}
                  value={awardedScore}
                  onChange={e => setAwardedScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-bold font-mono focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Constructive Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={gradingFeedback}
                  onChange={e => setGradingFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Save Grade &amp; Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-600" />
                <span>Post New Homework Task</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Linear Graphs &amp; Slope Calculation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <select
                    value={newClass}
                    onChange={e => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Grade 8-A">Grade 8-A</option>
                    <option value="Grade 8-B">Grade 8-B</option>
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newMaxScore}
                    onChange={e => setNewMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions &amp; Problem Statements *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Detail the exercises, page numbers, or questions students must solve..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

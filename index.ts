export type UserRole = 'parent' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  // Parent specific
  linkedStudentId?: string;
  relationship?: 'Mother' | 'Father' | 'Guardian';
  notificationPref?: 'email' | 'sms' | 'portal';
  // Teacher specific
  qualification?: string;
  subjects?: string[];
  assignedClasses?: string[];
  availability?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string; // e.g. "Grade 8-A"
  dateOfBirth: string;
  avatar: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  classTeacherName: string;
  classTeacherEmail: string;
  overallAttendancePct: number;
  overallAcademicPct: number;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // Teacher name
  remarks?: string;
}

export interface SubjectScore {
  subject: string;
  obtainedMarks: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examName: string; // "Term 1 Final", "Mid-Term Examination", "Unit Test 1"
  examDate: string;
  scores: SubjectScore[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  teacherFeedback: string;
  status: 'Published' | 'Draft';
}

export type FeeCategory = 'Tuition Fee' | 'Transport Fee' | 'Library Fee' | 'Sports Fee' | 'Examination Fee';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export interface FeeItem {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  category: FeeCategory;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: PaymentStatus;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  feeItemId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit Card';
  paidBy: string;
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  recipientEmail: string;
  subject: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  studentId?: string;
}

export type MeetingStatus = 'Requested' | 'Confirmed' | 'Rejected' | 'Completed' | 'Cancelled';

export interface Meeting {
  id: string;
  title: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  status: MeetingStatus;
  teacherNotes?: string;
  location?: string;
}

export type AssignmentStatus = 'Pending' | 'Submitted' | 'Reviewed' | 'Overdue';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  class: string;
  assignedDate: string;
  dueDate: string;
  teacherName: string;
  teacherId: string;
  maxScore: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionText: string;
  submittedAt: string;
  status: AssignmentStatus;
  score?: number;
  feedback?: string;
  gradedBy?: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  category: 'Academic Excellence' | 'Constructive Participation' | 'Leadership & Teamwork' | 'Focus & Engagement' | 'Punctuality & Discipline';
  type: 'Positive' | 'Area for Growth';
  remarks: string;
  teacherName: string;
  teacherId: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  targetAudience: 'All Parents' | 'All Teachers' | 'All' | 'Grade 8-A' | 'Grade 8-B' | 'Grade 9-A' | 'Grade 10-A';
  category: 'Academic' | 'Sports' | 'Holiday' | 'Event' | 'Administration';
  author: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Sports' | 'Cultural' | 'Science & Tech' | 'Campus Life';
  date: string;
  imageUrl: string;
  caption: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'meeting' | 'academic' | 'fee' | 'announcement';
  date: string;
  isRead: boolean;
  linkModule?: string;
}

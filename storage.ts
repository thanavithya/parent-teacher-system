import {
  User,
  Student,
  AttendanceRecord,
  AcademicRecord,
  FeeItem,
  PaymentTransaction,
  Message,
  Meeting,
  Assignment,
  AssignmentSubmission,
  BehaviorRecord,
  Announcement,
  GalleryPhoto,
  AppNotification
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_ACADEMICS,
  INITIAL_FEES,
  INITIAL_TRANSACTIONS,
  INITIAL_MESSAGES,
  INITIAL_MEETINGS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_BEHAVIOR,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

const KEYS = {
  USERS: 'ptc_users',
  CURRENT_USER: 'ptc_current_user',
  STUDENTS: 'ptc_students',
  ATTENDANCE: 'ptc_attendance',
  ACADEMICS: 'ptc_academics',
  FEES: 'ptc_fees',
  TRANSACTIONS: 'ptc_transactions',
  MESSAGES: 'ptc_messages',
  MEETINGS: 'ptc_meetings',
  ASSIGNMENTS: 'ptc_assignments',
  SUBMISSIONS: 'ptc_submissions',
  BEHAVIOR: 'ptc_behavior',
  ANNOUNCEMENTS: 'ptc_announcements',
  GALLERY: 'ptc_gallery',
  NOTIFICATIONS: 'ptc_notifications',
  THEME: 'ptc_theme'
};

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const subscribeToStorage = (listener: StorageListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  // Initialization
  init: () => {
    if (!localStorage.getItem(KEYS.USERS)) safeSet(KEYS.USERS, INITIAL_USERS);
    if (!localStorage.getItem(KEYS.STUDENTS)) safeSet(KEYS.STUDENTS, INITIAL_STUDENTS);
    if (!localStorage.getItem(KEYS.ATTENDANCE)) safeSet(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    if (!localStorage.getItem(KEYS.ACADEMICS)) safeSet(KEYS.ACADEMICS, INITIAL_ACADEMICS);
    if (!localStorage.getItem(KEYS.FEES)) safeSet(KEYS.FEES, INITIAL_FEES);
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) safeSet(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    if (!localStorage.getItem(KEYS.MESSAGES)) safeSet(KEYS.MESSAGES, INITIAL_MESSAGES);
    if (!localStorage.getItem(KEYS.MEETINGS)) safeSet(KEYS.MEETINGS, INITIAL_MEETINGS);
    if (!localStorage.getItem(KEYS.ASSIGNMENTS)) safeSet(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    if (!localStorage.getItem(KEYS.SUBMISSIONS)) safeSet(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    if (!localStorage.getItem(KEYS.BEHAVIOR)) safeSet(KEYS.BEHAVIOR, INITIAL_BEHAVIOR);
    if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) safeSet(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    if (!localStorage.getItem(KEYS.GALLERY)) safeSet(KEYS.GALLERY, INITIAL_GALLERY);
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) safeSet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

    // Default current user if not set
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      safeSet(KEYS.CURRENT_USER, INITIAL_USERS[0]); // default admin
    }
  },

  // Reset to demo factory defaults
  resetToDemoDefaults: () => {
    safeSet(KEYS.USERS, INITIAL_USERS);
    safeSet(KEYS.STUDENTS, INITIAL_STUDENTS);
    safeSet(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    safeSet(KEYS.ACADEMICS, INITIAL_ACADEMICS);
    safeSet(KEYS.FEES, INITIAL_FEES);
    safeSet(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    safeSet(KEYS.MESSAGES, INITIAL_MESSAGES);
    safeSet(KEYS.MEETINGS, INITIAL_MEETINGS);
    safeSet(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    safeSet(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    safeSet(KEYS.BEHAVIOR, INITIAL_BEHAVIOR);
    safeSet(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    safeSet(KEYS.GALLERY, INITIAL_GALLERY);
    safeSet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSet(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  // Auth & Users
  getCurrentUser: (): User | null => {
    return safeGet<User | null>(KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user: User | null) => {
    safeSet(KEYS.CURRENT_USER, user);
  },

  getUsers: (): User[] => {
    return safeGet<User[]>(KEYS.USERS, INITIAL_USERS);
  },

  registerUser: (newUser: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
    const users = safeGet<User[]>(KEYS.USERS, INITIAL_USERS);
    const existing = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address is already registered.' };
    }
    const createdUser: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
      avatar: newUser.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    };
    users.push(createdUser);
    safeSet(KEYS.USERS, users);
    safeSet(KEYS.CURRENT_USER, createdUser);
    return { success: true, message: 'Registration successful! Welcome to ParentTeacher Connect.', user: createdUser };
  },

  login: (email: string, _password: string): { success: boolean; message: string; user?: User } => {
    const users = safeGet<User[]>(KEYS.USERS, INITIAL_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Invalid email or user not found. Please check credentials or register.' };
    }
    safeSet(KEYS.CURRENT_USER, user);
    return { success: true, message: `Welcome back, ${user.name}!`, user };
  },

  logout: () => {
    safeSet(KEYS.CURRENT_USER, null);
  },

  // Students
  getStudents: (): Student[] => {
    return safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  getStudentById: (id: string): Student | undefined => {
    const students = safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    return students.find(s => s.id === id);
  },

  saveStudent: (student: Student) => {
    const students = safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = students.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    safeSet(KEYS.STUDENTS, students);
  },

  deleteStudent: (id: string) => {
    let students = safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    students = students.filter(s => s.id !== id);
    safeSet(KEYS.STUDENTS, students);
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => {
    return safeGet<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  markAttendance: (record: Omit<AttendanceRecord, 'id'>): { success: boolean; message: string } => {
    const records = safeGet<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const existingIndex = records.findIndex(r => r.studentId === record.studentId && r.date === record.date);

    if (existingIndex >= 0) {
      records[existingIndex] = {
        ...records[existingIndex],
        status: record.status,
        markedBy: record.markedBy,
        remarks: record.remarks || records[existingIndex].remarks
      };
    } else {
      records.push({
        ...record,
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
    }
    safeSet(KEYS.ATTENDANCE, records);

    // Recalculate student overall attendance %
    const studentRecords = records.filter(r => r.studentId === record.studentId);
    if (studentRecords.length > 0) {
      const presentCount = studentRecords.filter(r => r.status === 'Present').length;
      const lateCount = studentRecords.filter(r => r.status === 'Late').length;
      // Count Late as 0.8 weight or present
      const pct = Math.round(((presentCount + (lateCount * 0.8)) / studentRecords.length) * 1000) / 10;
      const students = safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
      const sIdx = students.findIndex(s => s.id === record.studentId);
      if (sIdx >= 0) {
        students[sIdx].overallAttendancePct = pct;
        safeSet(KEYS.STUDENTS, students);
      }
    }

    return { success: true, message: `Attendance updated for ${record.studentName}` };
  },

  // Academics
  getAcademics: (): AcademicRecord[] => {
    return safeGet<AcademicRecord[]>(KEYS.ACADEMICS, INITIAL_ACADEMICS);
  },

  saveAcademicRecord: (record: AcademicRecord) => {
    const list = safeGet<AcademicRecord[]>(KEYS.ACADEMICS, INITIAL_ACADEMICS);
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    safeSet(KEYS.ACADEMICS, list);

    // Update student's overall academic %
    const studentRecords = list.filter(r => r.studentId === record.studentId);
    if (studentRecords.length > 0) {
      const avg = Math.round(studentRecords.reduce((acc, curr) => acc + curr.percentage, 0) / studentRecords.length * 10) / 10;
      const students = safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
      const sIdx = students.findIndex(s => s.id === record.studentId);
      if (sIdx >= 0) {
        students[sIdx].overallAcademicPct = avg;
        safeSet(KEYS.STUDENTS, students);
      }
    }
  },

  deleteAcademicRecord: (id: string) => {
    let list = safeGet<AcademicRecord[]>(KEYS.ACADEMICS, INITIAL_ACADEMICS);
    list = list.filter(r => r.id !== id);
    safeSet(KEYS.ACADEMICS, list);
  },

  // Fees
  getFees: (): FeeItem[] => {
    return safeGet<FeeItem[]>(KEYS.FEES, INITIAL_FEES);
  },

  getTransactions: (): PaymentTransaction[] => {
    return safeGet<PaymentTransaction[]>(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },

  recordPayment: (
    feeItemId: string,
    amount: number,
    paymentMethod: PaymentTransaction['paymentMethod'],
    paidBy: string,
    notes?: string
  ): { success: boolean; message: string; receipt?: PaymentTransaction } => {
    const fees = safeGet<FeeItem[]>(KEYS.FEES, INITIAL_FEES);
    const feeIndex = fees.findIndex(f => f.id === feeItemId);
    if (feeIndex < 0) return { success: false, message: 'Fee record not found' };

    const fee = fees[feeIndex];
    const balance = fee.totalAmount - fee.paidAmount;
    if (amount <= 0) return { success: false, message: 'Payment amount must be greater than zero.' };
    if (amount > balance) return { success: false, message: `Payment exceeds outstanding balance of $${balance}.` };

    fee.paidAmount += amount;
    fee.status = fee.paidAmount >= fee.totalAmount ? 'Paid' : 'Partial';
    fees[feeIndex] = fee;
    safeSet(KEYS.FEES, fees);

    const transaction: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      feeItemId: fee.id,
      studentId: fee.studentId,
      studentName: fee.studentName,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      paidBy,
      notes: notes || `Simulated payment for ${fee.category}`
    };

    const transactions = safeGet<PaymentTransaction[]>(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    transactions.unshift(transaction);
    safeSet(KEYS.TRANSACTIONS, transactions);

    return { success: true, message: `Payment of $${amount} recorded successfully.`, receipt: transaction };
  },

  // Messages
  getMessages: (): Message[] => {
    return safeGet<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  },

  sendMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Message => {
    const messages = safeGet<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
    const newMessage: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    messages.unshift(newMessage);
    safeSet(KEYS.MESSAGES, messages);
    return newMessage;
  },

  markMessageAsRead: (id: string) => {
    const messages = safeGet<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
    const m = messages.find(item => item.id === id);
    if (m) {
      m.isRead = true;
      safeSet(KEYS.MESSAGES, messages);
    }
  },

  deleteMessage: (id: string) => {
    let messages = safeGet<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
    messages = messages.filter(m => m.id !== id);
    safeSet(KEYS.MESSAGES, messages);
  },

  // Meetings
  getMeetings: (): Meeting[] => {
    return safeGet<Meeting[]>(KEYS.MEETINGS, INITIAL_MEETINGS);
  },

  scheduleMeeting: (meeting: Omit<Meeting, 'id' | 'status'>): { success: boolean; message: string; meeting?: Meeting } => {
    const meetings = safeGet<Meeting[]>(KEYS.MEETINGS, INITIAL_MEETINGS);

    // Conflict check for teacher at same date and overlapping time
    const conflict = meetings.find(m =>
      m.teacherId === meeting.teacherId &&
      m.date === meeting.date &&
      m.status !== 'Cancelled' &&
      m.status !== 'Rejected' &&
      ((meeting.startTime >= m.startTime && meeting.startTime < m.endTime) ||
       (meeting.endTime > m.startTime && meeting.endTime <= m.endTime) ||
       (meeting.startTime <= m.startTime && meeting.endTime >= m.endTime))
    );

    if (conflict) {
      return {
        success: false,
        message: `Conflict detected: The assigned teacher already has a meeting scheduled on ${meeting.date} between ${conflict.startTime} and ${conflict.endTime}. Please select another time.`
      };
    }

    const newMeeting: Meeting = {
      ...meeting,
      id: `mtg-${Date.now()}`,
      status: 'Requested'
    };
    meetings.push(newMeeting);
    safeSet(KEYS.MEETINGS, meetings);
    return { success: true, message: 'Meeting requested successfully! Awaiting teacher confirmation.', meeting: newMeeting };
  },

  updateMeetingStatus: (id: string, status: Meeting['status'], notes?: string) => {
    const meetings = safeGet<Meeting[]>(KEYS.MEETINGS, INITIAL_MEETINGS);
    const m = meetings.find(item => item.id === id);
    if (m) {
      m.status = status;
      if (notes) m.teacherNotes = notes;
      safeSet(KEYS.MEETINGS, meetings);
    }
  },

  // Assignments
  getAssignments: (): Assignment[] => {
    return safeGet<Assignment[]>(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },

  getSubmissions: (): AssignmentSubmission[] => {
    return safeGet<AssignmentSubmission[]>(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  saveAssignment: (assignment: Assignment) => {
    const list = safeGet<Assignment[]>(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const idx = list.findIndex(a => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
    } else {
      list.push(assignment);
    }
    safeSet(KEYS.ASSIGNMENTS, list);
  },

  deleteAssignment: (id: string) => {
    let list = safeGet<Assignment[]>(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    list = list.filter(a => a.id !== id);
    safeSet(KEYS.ASSIGNMENTS, list);
  },

  submitAssignment: (
    assignmentId: string,
    studentId: string,
    studentName: string,
    submissionText: string
  ): AssignmentSubmission => {
    const submissions = safeGet<AssignmentSubmission[]>(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const existingIdx = submissions.findIndex(s => s.assignmentId === assignmentId && s.studentId === studentId);

    const submission: AssignmentSubmission = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : `sub-${Date.now()}`,
      assignmentId,
      studentId,
      studentName,
      submissionText,
      submittedAt: new Date().toISOString(),
      status: 'Submitted'
    };

    if (existingIdx >= 0) {
      submissions[existingIdx] = submission;
    } else {
      submissions.push(submission);
    }
    safeSet(KEYS.SUBMISSIONS, submissions);
    return submission;
  },

  gradeSubmission: (submissionId: string, score: number, feedback: string, teacherName: string) => {
    const submissions = safeGet<AssignmentSubmission[]>(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const sub = submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.score = score;
      sub.feedback = feedback;
      sub.gradedBy = teacherName;
      sub.status = 'Reviewed';
      safeSet(KEYS.SUBMISSIONS, submissions);
    }
  },

  // Behavior
  getBehaviorRecords: (): BehaviorRecord[] => {
    return safeGet<BehaviorRecord[]>(KEYS.BEHAVIOR, INITIAL_BEHAVIOR);
  },

  addBehaviorRecord: (record: Omit<BehaviorRecord, 'id'>) => {
    const list = safeGet<BehaviorRecord[]>(KEYS.BEHAVIOR, INITIAL_BEHAVIOR);
    const newRecord: BehaviorRecord = {
      ...record,
      id: `beh-${Date.now()}`
    };
    list.unshift(newRecord);
    safeSet(KEYS.BEHAVIOR, list);
    return newRecord;
  },

  deleteBehaviorRecord: (id: string) => {
    let list = safeGet<BehaviorRecord[]>(KEYS.BEHAVIOR, INITIAL_BEHAVIOR);
    list = list.filter(b => b.id !== id);
    safeSet(KEYS.BEHAVIOR, list);
  },

  // Announcements
  getAnnouncements: (): Announcement[] => {
    return safeGet<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },

  saveAnnouncement: (announcement: Announcement) => {
    const list = safeGet<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const idx = list.findIndex(a => a.id === announcement.id);
    if (idx >= 0) {
      list[idx] = announcement;
    } else {
      list.unshift(announcement);
    }
    safeSet(KEYS.ANNOUNCEMENTS, list);
  },

  deleteAnnouncement: (id: string) => {
    let list = safeGet<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    list = list.filter(a => a.id !== id);
    safeSet(KEYS.ANNOUNCEMENTS, list);
  },

  // Gallery
  getGalleryPhotos: (): GalleryPhoto[] => {
    return safeGet<GalleryPhoto[]>(KEYS.GALLERY, INITIAL_GALLERY);
  },

  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id'>) => {
    const list = safeGet<GalleryPhoto[]>(KEYS.GALLERY, INITIAL_GALLERY);
    const item: GalleryPhoto = {
      ...photo,
      id: `gal-${Date.now()}`
    };
    list.unshift(item);
    safeSet(KEYS.GALLERY, list);
    return item;
  },

  // Notifications
  getNotifications: (): AppNotification[] => {
    return safeGet<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markNotificationAsRead: (id: string) => {
    const list = safeGet<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const n = list.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      safeSet(KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsAsRead: () => {
    const list = safeGet<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list.forEach(n => { n.isRead = true; });
    safeSet(KEYS.NOTIFICATIONS, list);
  },

  // Theme
  getTheme: (): 'light' | 'dark' => {
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  },

  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    notifyListeners();
  }
};

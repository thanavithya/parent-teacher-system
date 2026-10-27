import React, { useState, useEffect } from 'react';
import { StorageService, subscribeToStorage } from './services/storage';
import { User, AppNotification } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

// Auth views
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterParent } from './modules/auth/RegisterParent';
import { RegisterTeacher } from './modules/auth/RegisterTeacher';

// Dashboard views
import { ParentDashboard } from './modules/dashboard/ParentDashboard';
import { TeacherDashboard } from './modules/dashboard/TeacherDashboard';
import { AdminDashboard } from './modules/dashboard/AdminDashboard';

// Module views
import { StudentProfiles } from './modules/students/StudentProfiles';
import { AttendanceTracker } from './modules/attendance/AttendanceTracker';
import { AcademicsManager } from './modules/academics/AcademicsManager';
import { MessagingCenter } from './modules/messaging/MessagingCenter';
import { MeetingScheduler } from './modules/meetings/MeetingScheduler';
import { AssignmentManager } from './modules/assignments/AssignmentManager';
import { FeeManagement } from './modules/fees/FeeManagement';
import { BehaviorTracker } from './modules/behavior/BehaviorTracker';
import { EventsAnnouncements } from './modules/events/EventsAnnouncements';
import { PhotoGallery } from './modules/gallery/PhotoGallery';
import { ReportsCenter } from './modules/reports/ReportsCenter';

export default function App() {
  // Initialize storage once
  useEffect(() => {
    StorageService.init();
    const savedTheme = StorageService.getTheme();
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register-parent' | 'register-teacher'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());

  // Deep linking cross-module helpers
  const [targetReportCardId, setTargetReportCardId] = useState<string | null>(null);
  const [targetFeeId, setTargetFeeId] = useState<string | null>(null);

  // Notifications & Messages counts
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [unreadMsgCount, setUnreadMsgCount] = useState<number>(0);

  // Toast system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation dialog modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Subscribe to storage changes
  useEffect(() => {
    const syncData = () => {
      const user = StorageService.getCurrentUser();
      setCurrentUser(user);
      setNotifications(StorageService.getNotifications());
      if (user) {
        const msgs = StorageService.getMessages().filter(
          m => m.recipientEmail.toLowerCase() === user.email.toLowerCase() && !m.isRead
        );
        setUnreadMsgCount(msgs.length);
      } else {
        setUnreadMsgCount(0);
      }
    };

    syncData();
    const unsubscribe = subscribeToStorage(syncData);
    return () => unsubscribe();
  }, [currentUser?.email]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
    showToast('info', 'Theme Changed', `Switched to ${nextTheme} mode.`);
  };

  const handleSwitchUser = (email: string) => {
    const users = StorageService.getUsers();
    const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      StorageService.setCurrentUser(target);
      setCurrentUser(target);
      setActiveTab('dashboard');
      showToast('success', 'Role Switched', `Now signed in as ${target.name} (${target.role.toUpperCase()}).`);
    }
  };

  const handleResetData = () => {
    requestConfirm(
      'Reset Demo Data to Defaults',
      'This will reset all students, attendance, grades, fee transactions, assignments, and messages back to their clean demo states. Continue?',
      () => {
        StorageService.resetToDemoDefaults();
        setActiveTab('dashboard');
        showToast('info', 'Data Restored', 'All portal demo datasets have been reset to factory defaults.');
      }
    );
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setAuthView('login');
    showToast('info', 'Signed Out', 'You have been logged out of your session.');
  };

  // Cross-module navigations
  const handleOpenReportCard = (academicId: string) => {
    setTargetReportCardId(academicId);
    setActiveTab('academics');
  };

  const handleOpenFeePayment = (feeId: string) => {
    setTargetFeeId(feeId);
    setActiveTab('fees');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7FB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-pink-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Dialog Layer */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        notifications={notifications}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* App Body */}
      {!currentUser ? (
        <main className="flex-1">
          {authView === 'login' && (
            <LoginPage
              onLoginSuccess={user => {
                setCurrentUser(user);
                setActiveTab('dashboard');
              }}
              onNavigateRegisterParent={() => setAuthView('register-parent')}
              onNavigateRegisterTeacher={() => setAuthView('register-teacher')}
              onShowToast={showToast}
            />
          )}

          {authView === 'register-parent' && (
            <RegisterParent
              onRegisterSuccess={user => {
                setCurrentUser(user);
                setActiveTab('dashboard');
              }}
              onNavigateLogin={() => setAuthView('login')}
              onShowToast={showToast}
            />
          )}

          {authView === 'register-teacher' && (
            <RegisterTeacher
              onRegisterSuccess={user => {
                setCurrentUser(user);
                setActiveTab('dashboard');
              }}
              onNavigateLogin={() => setAuthView('login')}
              onShowToast={showToast}
            />
          )}
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Role Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={tab => {
              setActiveTab(tab);
              // Reset deep link flags when clicking tabs
              setTargetReportCardId(null);
              setTargetFeeId(null);
            }}
            userRole={currentUser.role}
            unreadMessagesCount={unreadMsgCount}
            isOpenMobile={isMobileMenuOpen}
            onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          {/* Main Module Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
            
            {/* Dashboard Routing by Role */}
            {activeTab === 'dashboard' && (
              <>
                {currentUser.role === 'parent' && (
                  <ParentDashboard
                    currentUser={currentUser}
                    onNavigateTab={setActiveTab}
                    onOpenReportCard={handleOpenReportCard}
                    onOpenFeePayment={handleOpenFeePayment}
                  />
                )}

                {currentUser.role === 'teacher' && (
                  <TeacherDashboard
                    currentUser={currentUser}
                    onNavigateTab={setActiveTab}
                    onQuickMarkAttendance={() => setActiveTab('attendance')}
                    onGradeSubmission={() => setActiveTab('assignments')}
                  />
                )}

                {currentUser.role === 'admin' && (
                  <AdminDashboard
                    currentUser={currentUser}
                    onNavigateTab={setActiveTab}
                    onOpenAddStudent={() => setActiveTab('students')}
                    onOpenAddAnnouncement={() => setActiveTab('events')}
                    onResetData={handleResetData}
                  />
                )}
              </>
            )}

            {/* Students Module */}
            {activeTab === 'students' && (
              <StudentProfiles
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
              />
            )}

            {/* Attendance Module */}
            {activeTab === 'attendance' && (
              <AttendanceTracker
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {/* Academics Module */}
            {activeTab === 'academics' && (
              <AcademicsManager
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
                initialReportCardId={targetReportCardId}
              />
            )}

            {/* Messaging Module */}
            {activeTab === 'messaging' && (
              <MessagingCenter
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
              />
            )}

            {/* Meetings Module */}
            {activeTab === 'meetings' && (
              <MeetingScheduler
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
              />
            )}

            {/* Assignments Module */}
            {activeTab === 'assignments' && (
              <AssignmentManager
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
              />
            )}

            {/* Fees Module */}
            {activeTab === 'fees' && (
              <FeeManagement
                currentUser={currentUser}
                onShowToast={showToast}
                initialFeeItemId={targetFeeId}
              />
            )}

            {/* Behavior Module */}
            {activeTab === 'behavior' && (
              <BehaviorTracker
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
              />
            )}

            {/* Events & Announcements Module */}
            {activeTab === 'events' && (
              <EventsAnnouncements
                currentUser={currentUser}
                onShowToast={showToast}
                onRequestConfirm={requestConfirm}
              />
            )}

            {/* Photo Gallery Module */}
            {activeTab === 'gallery' && (
              <PhotoGallery
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {/* Reports & Exports Module */}
            {activeTab === 'reports' && (
              <ReportsCenter
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-pink-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ParentTeacher Connect · Built for Free Web Development Internship Online Project
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Local Storage Demo Persistence</span>
            <span>·</span>
            <span>jsPDF &amp; jsPDF-AutoTable Reports</span>
            <span>·</span>
            <span>WCAG Accessible Palette</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  GraduationCap,
  MessageSquare,
  Calendar,
  BookOpenCheck,
  CreditCard,
  HeartHandshake,
  Megaphone,
  Image as ImageIcon,
  FileSpreadsheet,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  unreadMessagesCount: number;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  unreadMessagesCount,
  isOpenMobile,
  onToggleMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: userRole === 'parent' ? 'My Child Profile' : 'Student Directory', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'academics', label: 'Academics & Grades', icon: GraduationCap },
    { id: 'messaging', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'meetings', label: 'Meeting Scheduler', icon: Calendar },
    { id: 'assignments', label: 'Homework & Tasks', icon: BookOpenCheck },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'behavior', label: 'Behavior Tracking', icon: HeartHandshake },
    { id: 'events', label: 'Events & Notices', icon: Megaphone },
    { id: 'gallery', label: 'School Gallery', icon: ImageIcon },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggleMobile}
        className="lg:hidden fixed bottom-5 left-5 z-40 p-3 bg-pink-600 text-white rounded-full shadow-xl hover:bg-pink-700 transition-transform active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          onClick={onToggleMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white/95 dark:bg-slate-900/95 border-r border-pink-100 dark:border-slate-800 flex flex-col justify-between py-4 px-3 overflow-y-auto transition-transform duration-200 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {userRole} Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isOpenMobile) onToggleMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-pink-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Role Card Info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 px-3">
          <div className="bg-gradient-to-br from-pink-50 to-white dark:from-slate-800 dark:to-slate-850 p-3 rounded-xl border border-pink-100/80 dark:border-slate-700/60 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Role Capabilities
            </span>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {userRole === 'parent' && 'Tracking Aarav Sharma (Grade 8-A), attendance, fees & teacher communications.'}
              {userRole === 'teacher' && 'Managing Grade 8-A & 9-A classes, marking attendance, grades & parent meetings.'}
              {userRole === 'admin' && 'School-wide governance across students, faculty, fee reconciliation & reports.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

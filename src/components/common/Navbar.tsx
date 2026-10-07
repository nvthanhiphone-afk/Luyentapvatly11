import React from 'react';
import { Atom, User, ShieldCheck, LogOut, FileSpreadsheet, Home } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'student-login' | 'student-list' | 'exam' | 'result' | 'teacher-login' | 'teacher-dashboard';
  studentName?: string;
  isTeacherLoggedIn?: boolean;
  onNavigateHome: () => void;
  onNavigateStudent: () => void;
  onNavigateTeacher: () => void;
  onLogoutStudent?: () => void;
  onLogoutTeacher?: () => void;
  onOpenSampleTemplate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  studentName,
  isTeacherLoggedIn,
  onNavigateHome,
  onNavigateStudent,
  onNavigateTeacher,
  onLogoutStudent,
  onLogoutTeacher,
  onOpenSampleTemplate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm group-hover:bg-sky-700 transition-colors">
              <Atom className="h-6 w-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                VẬT LÝ CHUYÊN ĐỀ 11
              </span>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Hệ thống luyện tập & kiểm tra trực tuyến
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onNavigateHome}
            className={`flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
              currentView === 'home' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Trang chủ</span>
          </button>
          <button
            onClick={onNavigateStudent}
            className={`flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
              ['student-login', 'student-list', 'exam', 'result'].includes(currentView)
                ? 'text-sky-600 font-semibold'
                : ''
            }`}
          >
            <User className="h-4 w-4" />
            <span>Khu vực Học sinh</span>
          </button>
          <button
            onClick={onNavigateTeacher}
            className={`flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
              ['teacher-login', 'teacher-dashboard'].includes(currentView)
                ? 'text-sky-600 font-semibold'
                : ''
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Khu vực Giáo viên</span>
          </button>
          {onOpenSampleTemplate && (
            <button
              onClick={onOpenSampleTemplate}
              className="flex items-center gap-1.5 transition-colors hover:text-slate-900 text-slate-500"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Tải file Excel mẫu</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Active Status & Action Buttons */}
        <div className="flex items-center gap-3">
          {studentName && ['student-list', 'exam', 'result'].includes(currentView) ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{studentName}</span>
                <span className="text-[10px] text-sky-600">Học sinh đang luyện tập</span>
              </div>
              <button
                onClick={onLogoutStudent}
                title="Đổi học sinh"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </div>
          ) : isTeacherLoggedIn && currentView === 'teacher-dashboard' ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">Giáo viên Vật lý</span>
                <span className="text-[10px] text-emerald-600">Quản trị viên</span>
              </div>
              <button
                onClick={onLogoutTeacher}
                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateStudent}
                className="rounded-lg bg-sky-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors whitespace-nowrap"
              >
                Vào làm bài
              </button>
              <button
                onClick={onNavigateTeacher}
                className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors whitespace-nowrap"
              >
                Giáo viên
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

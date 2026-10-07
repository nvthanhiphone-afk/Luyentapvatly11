import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  School,
  Users,
  ClipboardList,
  BarChart3,
  Download,
  Settings,
  Plus
} from 'lucide-react';
import { Assignment, ExcelImportPreview, Question } from '../../types';
import { StorageService } from '../../services/storage';
import { AssignmentManager } from './AssignmentManager';
import { ResultsTable } from './ResultsTable';
import { AnalyticsView } from './AnalyticsView';
import { ClassManager } from './ClassManager';
import { SettingsModal } from './SettingsModal';
import { ExcelImportModal } from './ExcelImportModal';
import { exportResultsToExcel, downloadExcelBuffer } from '../../services/excel';

type TeacherTab =
  | 'overview'
  | 'assignments'
  | 'classes'
  | 'students'
  | 'results'
  | 'analytics'
  | 'settings';

interface TeacherDashboardProps {
  onPreviewExamAsStudent: (assignment: Assignment) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onPreviewExamAsStudent,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [previewAssignmentModal, setPreviewAssignmentModal] = useState<Assignment | null>(null);

  const assignments = StorageService.getAssignments();
  const students = StorageService.getStudents();
  const attempts = StorageService.getAllAttempts().filter(a => a.is_submitted);
  const classes = StorageService.getClasses();

  const handleImportExcelSuccess = (previewData: ExcelImportPreview) => {
    // Generate new Assignment from previewData
    const newId = `asg-${Date.now()}`;
    const newAssignment: Assignment = {
      id: newId,
      title: previewData.assignment_info?.title || 'Bài kiểm tra Vật lý 11 từ Excel',
      topic: previewData.assignment_info?.topic || 'Chuyên đề 11',
      description:
        previewData.assignment_info?.description ||
        `Đề kiểm tra gồm ${previewData.total_questions} câu hỏi được nhập từ file Excel.`,
      duration_minutes: previewData.assignment_info?.duration_minutes ?? 30,
      max_attempts: previewData.assignment_info?.max_attempts ?? 3,
      shuffle_questions: previewData.assignment_info?.shuffle_questions ?? true,
      shuffle_answers: previewData.assignment_info?.shuffle_answers ?? true,
      status: 'open',
      allowed_class_ids: [],
      show_solution_mode: 'immediate',
      show_leaderboard: true,
      created_at: new Date().toISOString(),
    };

    const newQuestions: Question[] = previewData.questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx + 1}`,
      assignment_id: newId,
    }));

    StorageService.saveAssignment(newAssignment);
    StorageService.saveQuestions(newId, newQuestions);

    alert(`Nhập thành công đề thi "${newAssignment.title}" với ${newQuestions.length} câu hỏi! Bài đã được mở cho học sinh làm.`);
    setActiveTab('assignments');
  };

  const handleDirectExportExcel = () => {
    const targetAssignment = assignments[0];
    const targetTitle = targetAssignment?.title || 'Tổng hợp Vật lý 11';
    const questions = targetAssignment ? StorageService.getQuestions(targetAssignment.id) : [];
    const buffer = exportResultsToExcel(attempts, questions, targetTitle);
    downloadExcelBuffer(buffer, `Bao_Cao_Tong_Hop_Vat_Ly_11_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Teacher Hero Banner with matching educational blue palette */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 p-6 sm:p-7 text-white shadow-xl">
        <svg
          className="absolute inset-0 h-full w-full opacity-15 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 60 Q 60 10, 120 60 T 240 60 T 360 60 T 480 60 T 600 60 T 720 60 T 840 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
        </svg>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm text-sky-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cổng Quản Trị Giảng Dạy & Khảo Thí</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              BÀN LÀM VIỆC GIÁO VIÊN VẬT LÝ 11
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Quản lý đề kiểm tra, tải dữ liệu câu hỏi từ Excel .xlsx, phân tích phổ điểm trực quan và tự động chấm điểm cho học sinh.
            </p>
          </div>

          {/* Quick Metrics Badges in Header */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-center min-w-[90px]">
              <span className="block font-mono text-2xl font-black text-white">{assignments.length}</span>
              <span className="text-[11px] text-sky-100 font-medium">Bài tập</span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-center min-w-[90px]">
              <span className="block font-mono text-2xl font-black text-white">{classes.length}</span>
              <span className="text-[11px] text-sky-100 font-medium">Lớp học</span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-center min-w-[90px]">
              <span className="block font-mono text-2xl font-black text-emerald-300">{attempts.length}</span>
              <span className="text-[11px] text-sky-100 font-medium">Lượt đã nộp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Navigation Tabs */}
      <div className="border border-slate-200/80 bg-white rounded-2xl p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
            { id: 'assignments', label: 'Quản lý bài tập', icon: BookOpen },
            { id: 'results', label: 'Kết quả làm bài', icon: ClipboardList },
            { id: 'analytics', label: 'Thống kê & Biểu đồ', icon: BarChart3 },
            { id: 'classes', label: 'Quản lý lớp học', icon: School },
            { id: 'students', label: 'Danh sách học sinh', icon: Users },
            { id: 'settings', label: 'Cài đặt & Mật khẩu', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TeacherTab)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-1 ring-sky-500'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 pl-2">
            <button
              onClick={() => setShowExcelImport(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>TẢI CÂU HỎI EXCEL</span>
            </button>
            <button
              onClick={handleDirectExportExcel}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Xuất Excel 3 sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Overview Dashboard */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AnalyticsView />

          <div className="pt-4">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600" />
              <span>Đề Thi Đang Mở Cho Học Sinh</span>
            </h3>
            <AssignmentManager
              onOpenExcelImport={() => setShowExcelImport(true)}
              onPreviewAssignment={asg => onPreviewExamAsStudent(asg)}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Assignments */}
      {activeTab === 'assignments' && (
        <AssignmentManager
          onOpenExcelImport={() => setShowExcelImport(true)}
          onPreviewAssignment={asg => onPreviewExamAsStudent(asg)}
        />
      )}

      {/* Tab 3: Results */}
      {activeTab === 'results' && <ResultsTable />}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && <AnalyticsView />}

      {/* Tab 5: Classes */}
      {activeTab === 'classes' && <ClassManager />}

      {/* Tab 6: Students List */}
      {activeTab === 'students' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Danh Sách Học Sinh Trong Hệ Thống</h2>
            <span className="text-xs text-slate-500">{students.length} học sinh</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center">STT</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3 text-right">Số lượt đã làm</th>
                  <th className="px-4 py-3 text-right">Điểm cao nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((std, idx) => {
                  const studentAttempts = StorageService.getStudentAttempts(std.email);
                  const best =
                    studentAttempts.length > 0
                      ? Math.max(...studentAttempts.map(a => a.score_10))
                      : null;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{std.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{std.email}</td>
                      <td className="px-4 py-3 text-slate-700">{std.class_name || 'Tự do'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {studentAttempts.length} lượt
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        {best !== null ? `${best.toFixed(1)}/10` : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && <SettingsModal />}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showExcelImport}
        onClose={() => setShowExcelImport(false)}
        onImportSuccess={handleImportExcelSuccess}
      />
    </div>
  );
};

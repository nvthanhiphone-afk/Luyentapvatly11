import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './components/home/HomePage';
import { StudentLoginModal } from './components/student/StudentLoginModal';
import { AssignmentList } from './components/student/AssignmentList';
import { ExamRunner } from './components/student/ExamRunner';
import { ExamResultView } from './components/student/ExamResultView';
import { TeacherLogin } from './components/teacher/TeacherLogin';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { SystemDocsModal } from './components/common/SystemDocsModal';
import { StorageService } from './services/storage';
import { Assignment, ExamAttempt, Question, StudentUser } from './types';
import { BookOpen, FileSpreadsheet, Info } from 'lucide-react';
import { generateExcelTemplate, downloadExcelBuffer } from './services/excel';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'student-login' | 'student-list' | 'exam' | 'result' | 'teacher-login' | 'teacher-dashboard'
  >('home');

  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(null);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);

  // Active exam state
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  // Docs modal
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Initialize storage on first mount
  useEffect(() => {
    StorageService.init().then(() => {
      const savedStudent = StorageService.getCurrentStudent();
      if (savedStudent) {
        setCurrentStudent(savedStudent);
      }
    });
  }, []);

  // Student flow handlers
  const handleOpenStudentLogin = () => {
    if (currentStudent) {
      setCurrentView('student-list');
    } else {
      setCurrentView('student-login');
    }
  };

  const handleStudentLoginSuccess = (student: StudentUser) => {
    setCurrentStudent(student);
    setCurrentView('student-list');
  };

  const handleStartExam = (assignment: Assignment) => {
    if (!currentStudent) {
      setCurrentView('student-login');
      return;
    }

    const questions = StorageService.getQuestions(assignment.id);
    if (questions.length === 0) {
      alert('Bài tập này hiện chưa có câu hỏi nào.');
      return;
    }

    try {
      const newAttempt = StorageService.startNewAttempt(currentStudent, assignment, questions);
      setActiveAssignment(assignment);
      setActiveQuestions(questions);
      setActiveAttempt(newAttempt);
      setCurrentView('exam');
    } catch (err: any) {
      alert(err?.message || 'Không thể bắt đầu làm bài.');
    }
  };

  const handleExamSubmitSuccess = (submittedAttempt: ExamAttempt) => {
    setActiveAttempt(submittedAttempt);
    setCurrentView('result');
  };

  const handleViewPreviousResult = (previousAttempt: ExamAttempt) => {
    const assignment = StorageService.getAssignment(previousAttempt.assignment_id);
    if (!assignment) return;
    const questions = StorageService.getQuestions(assignment.id);

    setActiveAssignment(assignment);
    setActiveQuestions(questions);
    setActiveAttempt(previousAttempt);
    setCurrentView('result');
  };

  const handleRetryExam = () => {
    if (activeAssignment && currentStudent) {
      handleStartExam(activeAssignment);
    }
  };

  const handleLogoutStudent = () => {
    StorageService.clearCurrentStudent();
    setCurrentStudent(null);
    setCurrentView('home');
  };

  // Teacher flow handlers
  const handleOpenTeacherArea = () => {
    if (isTeacherLoggedIn) {
      setCurrentView('teacher-dashboard');
    } else {
      setCurrentView('teacher-login');
    }
  };

  const handleTeacherLoginSuccess = () => {
    setIsTeacherLoggedIn(true);
    setCurrentView('teacher-dashboard');
  };

  const handleLogoutTeacher = () => {
    setIsTeacherLoggedIn(false);
    setCurrentView('home');
  };

  // Teacher previewing exam as student
  const handlePreviewAsStudent = (assignment: Assignment) => {
    // Temporary test student
    const previewStudent: StudentUser = {
      id: 'std-preview',
      name: 'Giáo viên (Xem trước)',
      email: 'giaovien.preview@vatly11.edu.vn',
      class_name: 'Xem trước',
      created_at: new Date().toISOString(),
    };
    setCurrentStudent(previewStudent);
    const questions = StorageService.getQuestions(assignment.id);
    const attempt = StorageService.startNewAttempt(previewStudent, assignment, questions);
    setActiveAssignment(assignment);
    setActiveQuestions(questions);
    setActiveAttempt(attempt);
    setCurrentView('exam');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Universal Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        studentName={currentStudent?.name}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateStudent={handleOpenStudentLogin}
        onNavigateTeacher={handleOpenTeacherArea}
        onLogoutStudent={handleLogoutStudent}
        onLogoutTeacher={handleLogoutTeacher}
        onOpenSampleTemplate={() => {
          const buffer = generateExcelTemplate();
          downloadExcelBuffer(buffer, 'Mau_Nhap_De_Thi_Vat_Ly_11.xlsx');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <HomePage
            onGoStudent={handleOpenStudentLogin}
            onGoTeacher={handleOpenTeacherArea}
          />
        )}

        {/* VIEW 2: STUDENT LOGIN MODAL */}
        {currentView === 'student-login' && (
          <StudentLoginModal
            onSuccess={handleStudentLoginSuccess}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 3: STUDENT ASSIGNMENT LIST */}
        {currentView === 'student-list' && currentStudent && (
          <AssignmentList
            student={currentStudent}
            onStartAssignment={handleStartExam}
            onViewPreviousResult={handleViewPreviousResult}
          />
        )}

        {/* VIEW 4: ACTIVE EXAM RUNNER */}
        {currentView === 'exam' && currentStudent && activeAssignment && activeAttempt && (
          <ExamRunner
            student={currentStudent}
            assignment={activeAssignment}
            initialAttempt={activeAttempt}
            questions={activeQuestions}
            onSubmitSuccess={handleExamSubmitSuccess}
            onExitWithoutSubmit={() => setCurrentView('student-list')}
          />
        )}

        {/* VIEW 5: EXAM RESULT & EXPLANATION REVIEW */}
        {currentView === 'result' && currentStudent && activeAssignment && activeAttempt && (
          <ExamResultView
            student={currentStudent}
            assignment={activeAssignment}
            attempt={activeAttempt}
            questions={activeQuestions}
            onRetry={handleRetryExam}
            onBackToList={() => setCurrentView('student-list')}
          />
        )}

        {/* VIEW 6: TEACHER LOGIN MODAL */}
        {currentView === 'teacher-login' && (
          <TeacherLogin
            onSuccess={handleTeacherLoginSuccess}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 7: TEACHER DASHBOARD */}
        {currentView === 'teacher-dashboard' && (
          <TeacherDashboard
            onPreviewExamAsStudent={handlePreviewAsStudent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LUYỆN TẬP MÔN VẬT LÝ CHUYÊN ĐỀ 11</span>
            <span>·</span>
            <span>Chương trình Giáo dục Phổ thông THPT</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDocsModal(true)}
              className="flex items-center gap-1 hover:text-slate-800 transition-colors font-medium text-sky-700"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Hướng dẫn & Báo cáo kỹ thuật</span>
            </button>
            <button
              onClick={() => {
                const buffer = generateExcelTemplate();
                downloadExcelBuffer(buffer, 'Mau_Nhap_De_Thi_Vat_Ly_11.xlsx');
              }}
              className="hover:text-slate-800 transition-colors"
            >
              Tải file Excel mẫu
            </button>
            <span>Bản quyền © 2026</span>
          </div>
        </div>
      </footer>

      {/* System Docs Modal */}
      <SystemDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />
    </div>
  );
}

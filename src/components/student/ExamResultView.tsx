import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  ListOrdered,
  Award,
  ChevronLeft,
  Trophy,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Assignment, ExamAttempt, Question, StudentUser } from '../../types';
import { isTextAnswerCorrect } from '../../services/excel';

interface ExamResultViewProps {
  student: StudentUser;
  assignment: Assignment;
  attempt: ExamAttempt;
  questions: Question[];
  onRetry: () => void;
  onBackToList: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  student,
  assignment,
  attempt,
  questions,
  onRetry,
  onBackToList,
}) => {
  // Trigger confetti if high score >= 8.0
  useEffect(() => {
    if (attempt.score_10 >= 8.0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [attempt.score_10]);

  // Determine performance feedback
  const getFeedback = (score: number) => {
    if (score >= 9.0) {
      return {
        badge: 'Xuất sắc',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        message: 'Tuyệt vời! Bạn đã làm chủ hoàn toàn các kiến thức trọng tâm của Chuyên đề Vật lý 11.',
      };
    } else if (score >= 8.0) {
      return {
        badge: 'Rất tốt',
        color: 'text-sky-700 bg-sky-50 border-sky-200',
        message: 'Kết quả rất ấn tượng! Hãy tiếp tục duy trì phong độ và rèn luyện thêm các câu hỏi phân loại cao.',
      };
    } else if (score >= 6.5) {
      return {
        badge: 'Khá',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        message: 'Bạn có nền tảng tốt. Hãy đọc kỹ phần lời giải chi tiết cho các câu sai để tránh mất điểm đáng tiếc nhé!',
      };
    } else if (score >= 5.0) {
      return {
        badge: 'Đạt',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        message: 'Bạn đã đạt yêu cầu cơ bản. Cần dành thêm thời gian ôn lại lý thuyết và công thức Vật lý 11.',
      };
    } else {
      return {
        badge: 'Cần luyện tập thêm',
        color: 'text-red-700 bg-red-50 border-red-200',
        message: 'Đừng nản lòng! Hãy xem thật kỹ lời giải chi tiết bên dưới, ghi chú lại công thức và bấm "Làm lại" để cải thiện điểm số.',
      };
    }
  };

  const feedback = getFeedback(attempt.score_10);
  const canRetry = assignment.max_attempts === 0 || attempt.attempt_number < assignment.max_attempts;

  // Check if solutions should be displayed
  const canViewSolutions = assignment.show_solution_mode === 'immediate';

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner: Score & Stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
              KẾT QUẢ BÀI LÀM (Lần {attempt.attempt_number})
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {assignment.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span>Học sinh: <strong className="text-slate-900">{attempt.student_name}</strong></span>
              <span>·</span>
              <span className="font-mono">{attempt.student_email}</span>
              <span>·</span>
              <span>Lớp: <strong className="text-slate-900">{attempt.class_name || 'Tự do'}</strong></span>
              {attempt.submitted_at && (
                <>
                  <span>·</span>
                  <span>Nộp lúc: {new Date(attempt.submitted_at).toLocaleTimeString('vi-VN')} {new Date(attempt.submitted_at).toLocaleDateString('vi-VN')}</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBackToList}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>DANH SÁCH BÀI TẬP</span>
            </button>

            {canRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>LÀM LẠI BÀI NÀY</span>
              </button>
            )}
          </div>
        </div>

        {/* Score and Metric Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Main Score Box */}
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-white text-center shadow-md flex flex-col justify-center">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">ĐIỂM SỐ</span>
            <div className="mt-1 font-mono text-4xl sm:text-5xl font-black">
              {attempt.score_10.toFixed(1)}
            </div>
            <span className="mt-1 text-xs opacity-90">Thang điểm 10</span>
          </div>

          {/* Correct count */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="flex items-center justify-center text-emerald-600 mb-1">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{attempt.correct_count}</div>
            <div className="text-xs text-slate-600">Số câu đúng</div>
          </div>

          {/* Wrong count */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="flex items-center justify-center text-red-600 mb-1">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{attempt.wrong_count}</div>
            <div className="text-xs text-slate-600">Số câu sai</div>
          </div>

          {/* Unanswered count */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="flex items-center justify-center text-amber-600 mb-1">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{attempt.unanswered_count}</div>
            <div className="text-xs text-slate-600">Chưa trả lời</div>
          </div>

          {/* Total questions */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="flex items-center justify-center text-sky-600 mb-1">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{attempt.total_questions}</div>
            <div className="text-xs text-slate-600">Tổng số câu</div>
          </div>
        </div>

        {/* Feedback Card (Section X) */}
        <div className={`mt-6 rounded-xl border p-4 sm:p-5 ${feedback.color}`}>
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <Award className="h-5 w-5" />
            <span>Đánh giá kết quả: {feedback.badge}</span>
          </div>
          <p className="text-sm leading-relaxed">{feedback.message}</p>
        </div>
      </div>

      {/* Solutions & Explanations (Section XI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600" />
            <span>Chi Tiết Đáp Án & Lời Giải Từng Câu</span>
          </h2>
          <span className="text-xs text-slate-500">
            {canViewSolutions ? 'Hiển thị đầy đủ lời giải cho mọi câu hỏi' : 'Chỉ xem điểm theo thiết lập của giáo viên'}
          </span>
        </div>

        {!canViewSolutions ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <p className="font-semibold text-slate-800">
              Giáo viên đã thiết lập chỉ hiển thị điểm số sau khi nộp.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Lời giải chi tiết sẽ được mở sau khi bài tập đóng hoặc theo thông báo của giáo viên.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const studentAnswer = attempt.answers[q.id];
              const isUnanswered = studentAnswer === undefined || studentAnswer === null || studentAnswer.trim() === '';

              let isCorrect = false;
              if (!isUnanswered) {
                if (q.question_type === 'TEXT') {
                  isCorrect = isTextAnswerCorrect(studentAnswer, q.correct_answer);
                } else if (q.question_type === 'TRUEFALSE') {
                  isCorrect = studentAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                } else {
                  isCorrect = studentAnswer.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();
                }
              }

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border bg-white p-6 sm:p-7 shadow-sm transition-all ${
                    isCorrect
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : isUnanswered
                      ? 'border-amber-200 hover:border-amber-300'
                      : 'border-red-200 hover:border-red-300'
                  }`}
                >
                  {/* Question header status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {q.question_type === 'MCQ'
                          ? 'Trắc nghiệm ABCD'
                          : q.question_type === 'TRUEFALSE'
                          ? 'Đúng / Sai'
                          : 'Điền đáp án ngắn'}
                      </span>
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>✓ ĐÚNG</span>
                        </span>
                      ) : isUnanswered ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>CHƯA TRẢ LỜI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>✗ SAI</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question content */}
                  <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed mb-4">
                    {q.question_text}
                  </p>

                  {/* Student vs Correct answers comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
                    <div
                      className={`rounded-xl p-3 border ${
                        isCorrect
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : isUnanswered
                          ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                          : 'bg-red-50/60 border-red-200 text-red-950'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                        Đáp án bạn đã chọn:
                      </span>
                      <span className="font-bold text-base mt-0.5 block">
                        {isUnanswered ? '(Không trả lời)' : studentAnswer}
                      </span>
                    </div>

                    <div className="rounded-xl p-3 border bg-sky-50/60 border-sky-200 text-sky-950">
                      <span className="block text-[11px] font-semibold text-sky-700 uppercase">
                        Đáp án chính xác:
                      </span>
                      <span className="font-bold text-base mt-0.5 block">
                        {q.correct_answer}
                      </span>
                    </div>
                  </div>

                  {/* If MCQ, show all 4 options for clear reference */}
                  {q.question_type === 'MCQ' && (
                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {q.option_a && (
                        <div
                          className={`p-2 rounded-lg border ${
                            q.correct_answer === 'A'
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <strong>A.</strong> {q.option_a}
                        </div>
                      )}
                      {q.option_b && (
                        <div
                          className={`p-2 rounded-lg border ${
                            q.correct_answer === 'B'
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <strong>B.</strong> {q.option_b}
                        </div>
                      )}
                      {q.option_c && (
                        <div
                          className={`p-2 rounded-lg border ${
                            q.correct_answer === 'C'
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <strong>C.</strong> {q.option_c}
                        </div>
                      )}
                      {q.option_d && (
                        <div
                          className={`p-2 rounded-lg border ${
                            q.correct_answer === 'D'
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <strong>D.</strong> {q.option_d}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation box (Always shown as requested in Section XI) */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      <span>Lời giải chi tiết:</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line text-slate-700">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

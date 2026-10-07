import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  HelpCircle,
  Hash,
  ShieldAlert
} from 'lucide-react';
import { Assignment, ExamAttempt, Question, StudentUser } from '../../types';
import { StorageService } from '../../services/storage';

interface ExamRunnerProps {
  student: StudentUser;
  assignment: Assignment;
  initialAttempt: ExamAttempt;
  questions: Question[];
  onSubmitSuccess: (attempt: ExamAttempt) => void;
  onExitWithoutSubmit: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  student,
  assignment,
  initialAttempt,
  questions,
  onSubmitSuccess,
  onExitWithoutSubmit,
}) => {
  const [attempt, setAttempt] = useState<ExamAttempt>(initialAttempt);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    initialAttempt.time_remaining_seconds ?? (assignment.duration_minutes > 0 ? assignment.duration_minutes * 60 : null)
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map questions by ID for ordered lookup
  const questionMap = useRef<Map<string, Question>>(new Map());
  useEffect(() => {
    const map = new Map<string, Question>();
    questions.forEach(q => map.set(q.id, q));
    questionMap.current = map;
  }, [questions]);

  // Order of questions according to shuffled list or default order
  const orderedQuestionIds = attempt.shuffled_question_order && attempt.shuffled_question_order.length > 0
    ? attempt.shuffled_question_order
    : questions.map(q => q.id);

  const currentQuestionId = orderedQuestionIds[currentIndex];
  const currentQuestion = questionMap.current.get(currentQuestionId) || questions[currentIndex];

  // Auto-save attempt to localStorage
  const saveDraft = (updated: ExamAttempt) => {
    setAttempt(updated);
    StorageService.saveAttemptDraft(updated);
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null;
        const nextTime = prev - 1;
        // Update draft with remaining time periodically
        if (nextTime % 5 === 0) {
          const updated = { ...attempt, time_remaining_seconds: nextTime };
          StorageService.saveAttemptDraft(updated);
        }
        if (nextTime <= 0) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Update answer for current question
  const handleSelectAnswer = (value: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...attempt.answers, [currentQuestion.id]: value };
    const answeredCount = Object.values(newAnswers).filter(v => v !== undefined && v.trim() !== '').length;
    const updated: ExamAttempt = {
      ...attempt,
      answers: newAnswers,
      unanswered_count: orderedQuestionIds.length - answeredCount,
    };
    saveDraft(updated);
  };

  // Toggle mark for review
  const handleToggleReview = () => {
    if (!currentQuestion) return;
    const exists = attempt.marked_reviews.includes(currentQuestion.id);
    const newReviews = exists
      ? attempt.marked_reviews.filter(id => id !== currentQuestion.id)
      : [...attempt.marked_reviews, currentQuestion.id];

    const updated = { ...attempt, marked_reviews: newReviews };
    saveDraft(updated);
  };

  // Final submit handler with protection against double-click
  const handleFinalSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const finalAttempt = StorageService.submitAttempt(attempt.id);
      onSubmitSuccess(finalAttempt);
    } catch (err: any) {
      alert(err?.message || 'Có lỗi khi nộp bài.');
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.values(attempt.answers).filter(v => v !== undefined && v.trim() !== '').length;
  const unansweredCount = orderedQuestionIds.length - answeredCount;
  const currentAnswer = currentQuestion ? attempt.answers[currentQuestion.id] || '' : '';
  const isMarkedReview = currentQuestion ? attempt.marked_reviews.includes(currentQuestion.id) : false;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600">Đang tải câu hỏi...</p>
      </div>
    );
  }

  // Shuffled options if available
  const optionLetters: ('A' | 'B' | 'C' | 'D')[] =
    attempt.shuffled_option_orders && attempt.shuffled_option_orders[currentQuestion.id]
      ? attempt.shuffled_option_orders[currentQuestion.id]
      : ['A', 'B', 'C', 'D'];

  const getOptionText = (letter: 'A' | 'B' | 'C' | 'D') => {
    switch (letter) {
      case 'A': return currentQuestion.option_a;
      case 'B': return currentQuestion.option_b;
      case 'C': return currentQuestion.option_c;
      case 'D': return currentQuestion.option_d;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Top Header Card */}
      <div className="sticky top-20 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 sm:p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-800">{student.name}</span>
              <span>·</span>
              <span className="font-mono text-slate-600">{student.email}</span>
              <span>·</span>
              <span className="text-sky-700 font-medium">{student.class_name || 'Tự do'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {assignment.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Progress indicator */}
            <div className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-medium text-slate-700">
              Câu <strong className="text-sky-700 font-bold">{currentIndex + 1}</strong>/{orderedQuestionIds.length} · Đã làm:{' '}
              <strong className="text-emerald-700">{answeredCount}</strong>/{orderedQuestionIds.length}
            </div>

            {/* Countdown Timer */}
            {timeRemaining !== null && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-sm font-bold shadow-sm transition-colors ${
                  timeRemaining < 120
                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Large Submit Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>NỘP BÀI</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-sky-600 transition-all duration-300"
            style={{ width: `${(answeredCount / orderedQuestionIds.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Examination Grid: 2 Zones (Question Stage & Palette) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card (3 cols on large) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800 text-sm font-bold">
                  {currentIndex + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {currentQuestion.question_type === 'MCQ'
                    ? 'Trắc nghiệm chọn 1 đáp án'
                    : currentQuestion.question_type === 'TRUEFALSE'
                    ? 'Câu hỏi Đúng / Sai'
                    : 'Câu điền đáp án ngắn'}
                </span>
              </div>

              {/* Review toggle button */}
              <button
                type="button"
                onClick={handleToggleReview}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isMarkedReview
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isMarkedReview ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>{isMarkedReview ? 'ĐÃ ĐÁNH DẤU XEM LẠI' : 'ĐÁNH DẤU XEM LẠI'}</span>
              </button>
            </div>

            {/* Question Text (Large 18-20px text) */}
            <div className="py-6">
              <p className="text-lg sm:text-xl font-medium text-slate-900 leading-relaxed">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Answer Interaction Options */}
            <div className="space-y-3 pt-2">
              {/* Type 1: MCQ (A, B, C, D) */}
              {currentQuestion.question_type === 'MCQ' && (
                <div className="space-y-3">
                  {optionLetters.map(letter => {
                    const text = getOptionText(letter);
                    if (!text) return null;
                    const isSelected = currentAnswer.toUpperCase() === letter;

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleSelectAnswer(letter)}
                        className={`w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/80 ring-2 ring-sky-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-base sm:text-lg text-slate-800 pt-0.5 leading-normal">
                          {text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 2: TRUEFALSE */}
              {currentQuestion.question_type === 'TRUEFALSE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Đúng', 'Sai'].map(option => {
                    const isSelected = currentAnswer.toLowerCase() === option.toLowerCase();
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectAnswer(option)}
                        className={`flex items-center justify-center gap-3 rounded-xl border p-5 text-center transition-all ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-400'
                          }`}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span className="text-lg font-bold text-slate-900">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 3: TEXT (Short answer or numeric with comma/dot normalization) */}
              {currentQuestion.question_type === 'TEXT' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Nhập đáp án của bạn (Số nguyên, số thập phân hoặc từ khóa ngắn):
                    </label>
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={e => handleSelectAnswer(e.target.value)}
                      placeholder="Ví dụ: 9.8 hoặc 9,8 hoặc 20..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-base sm:text-lg font-mono text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      💡 Mẹo: Hệ thống tự động chấp nhận cả dấu phẩy (9,8) và dấu chấm (9.8).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Question Controls */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>CÂU TRƯỚC</span>
              </button>

              <button
                type="button"
                disabled={currentIndex === orderedQuestionIds.length - 1}
                onClick={() => setCurrentIndex(prev => Math.min(orderedQuestionIds.length - 1, prev + 1))}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-40 transition-colors"
              >
                <span>CÂU TIẾP THEO</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette / Navigation Matrix (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Bảng Câu Hỏi</span>
              <span className="text-xs font-normal text-slate-500">
                {answeredCount}/{orderedQuestionIds.length}
              </span>
            </h3>

            {/* Question numbers grid */}
            <div className="grid grid-cols-5 gap-2">
              {orderedQuestionIds.map((qid, idx) => {
                const isCurrent = idx === currentIndex;
                const hasAnswer = attempt.answers[qid] !== undefined && attempt.answers[qid].trim() !== '';
                const isFlagged = attempt.marked_reviews.includes(qid);

                let btnClass = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                if (hasAnswer) {
                  btnClass = 'border-sky-500 bg-sky-600 text-white font-bold';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-offset-2 ring-slate-900 font-extrabold';
                }

                return (
                  <button
                    key={qid}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-xl border text-xs transition-all ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-sky-600" />
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md border border-slate-300 bg-white" />
                <span>Chưa trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Đánh dấu xem lại</span>
              </div>
            </div>

            {/* Direct Submit from sidebar */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>NỘP BÀI THI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal when Submitting */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="text-center">
              {unansweredCount > 0 ? (
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              ) : (
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900">
                Xác nhận nộp bài kiểm tra
              </h3>

              {unansweredCount > 0 ? (
                <p className="mt-2 text-sm text-slate-600">
                  Bạn còn <strong className="text-red-600 font-bold">{unansweredCount} câu chưa trả lời</strong>.
                  Bạn có chắc chắn muốn nộp bài ngay bây giờ không?
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Bạn đã hoàn thành đủ {orderedQuestionIds.length}/{orderedQuestionIds.length} câu hỏi.
                  Bạn có chắc chắn muốn nộp bài và chấm điểm tự động?
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                QUAY LẠI LÀM TIẾP
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'ĐANG CHẤM ĐIỂM...' : 'VẪN NỘP BÀI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

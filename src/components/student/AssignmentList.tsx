import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  RotateCcw,
  Trophy,
  CheckCircle,
  AlertCircle,
  Play,
  ArrowRight,
  ListOrdered,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Assignment, ExamAttempt, StudentUser } from '../../types';

interface AssignmentListProps {
  student: StudentUser;
  onStartAssignment: (assignment: Assignment) => void;
  onViewPreviousResult: (attempt: ExamAttempt) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  student,
  onStartAssignment,
  onViewPreviousResult,
}) => {
  const [selectedAssignmentForLeaderboard, setSelectedAssignmentForLeaderboard] = useState<string | null>(null);

  const assignments = StorageService.getAssignments();
  const allAttempts = StorageService.getStudentAttempts(student.email);

  return (
    <div className="space-y-8 py-6">
      {/* Student Welcome Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
              Cổng luyện tập học sinh
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Chào bạn, {student.name}!
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Email: <span className="font-mono text-slate-800">{student.email}</span> · Lớp:{' '}
              <span className="font-medium text-slate-800">{student.class_name || 'Tự do'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 text-center">
              <span className="block text-2xl font-bold text-sky-700">
                {allAttempts.length}
              </span>
              <span className="text-[11px] font-medium text-slate-600">Lượt đã nộp</span>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-center">
              <span className="block text-2xl font-bold text-emerald-700">
                {allAttempts.length > 0
                  ? Math.max(...allAttempts.map(a => a.score_10)).toFixed(1)
                  : '--'}
              </span>
              <span className="text-[11px] font-medium text-slate-600">Điểm cao nhất</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600" />
            <span>Danh Sách Bài Luyện Tập Đang Mở</span>
          </h2>
          <span className="text-xs text-slate-500">
            {assignments.filter(a => a.status === 'open').length} bài tập khả dụng
          </span>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-base font-semibold text-slate-900">Chưa có bài tập nào được giao</h3>
            <p className="mt-1 text-sm text-slate-500">
              Giáo viên hiện chưa tạo hoặc mở bài luyện tập. Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {assignments.map(assignment => {
              const questions = StorageService.getQuestions(assignment.id);
              const attempts = StorageService.getStudentAttempts(student.email, assignment.id);
              const attemptCount = attempts.length;
              const maxAttempts = assignment.max_attempts;
              const highestScore = attemptCount > 0 ? Math.max(...attempts.map(a => a.score_10)) : null;
              const canAttempt = assignment.status === 'open' && (maxAttempts === 0 || attemptCount < maxAttempts);
              const latestAttempt = attempts[0];

              const isOpen = assignment.status === 'open';

              return (
                <div
                  key={assignment.id}
                  className={`rounded-2xl border bg-white p-6 sm:p-7 shadow-sm transition-all hover:shadow-md ${
                    isOpen ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`font-semibold ${
                            isOpen ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : 'text-slate-500 bg-slate-100 px-2 py-0.5 rounded'
                          }`}
                        >
                          {isOpen ? '● Đang mở' : '○ Đã đóng / Bản nháp'}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {assignment.topic || 'Chuyên đề 11'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900">{assignment.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{assignment.description}</p>

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <ListOrdered className="h-4 w-4 text-slate-400" />
                          <span>{questions.length} câu hỏi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>
                            {assignment.duration_minutes > 0
                              ? `${assignment.duration_minutes} phút`
                              : 'Không giới hạn thời gian'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RotateCcw className="h-4 w-4 text-slate-400" />
                          <span>
                            Đã làm: <strong className="text-slate-900">{attemptCount}</strong>
                            {maxAttempts > 0 ? ` / ${maxAttempts} lượt` : ' (Không giới hạn)'}
                          </span>
                        </div>
                        {highestScore !== null && (
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                            <Trophy className="h-4 w-4" />
                            <span>Điểm cao nhất: {highestScore.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
                      {canAttempt ? (
                        <button
                          onClick={() => onStartAssignment(assignment)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>{attemptCount === 0 ? 'BẮT ĐẦU LÀM BÀI' : 'LÀM LẠI (LƯỢT MỚI)'}</span>
                        </button>
                      ) : (
                        <div className="rounded-xl bg-slate-100 px-5 py-2.5 text-center text-xs font-semibold text-slate-500">
                          {isOpen ? 'Đã hết số lượt làm bài' : 'Bài tập đã đóng'}
                        </div>
                      )}

                      {latestAttempt && (
                        <button
                          onClick={() => onViewPreviousResult(latestAttempt)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Xem lại kết quả gần nhất
                        </button>
                      )}

                      {assignment.show_leaderboard && (
                        <button
                          onClick={() =>
                            setSelectedAssignmentForLeaderboard(
                              selectedAssignmentForLeaderboard === assignment.id ? null : assignment.id
                            )
                          }
                          className="text-xs font-medium text-sky-600 hover:underline flex items-center gap-1"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>
                            {selectedAssignmentForLeaderboard === assignment.id
                              ? 'Ẩn bảng xếp hạng'
                              : 'Bảng xếp hạng lớp'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Leaderboard dropdown if opened */}
                  {selectedAssignmentForLeaderboard === assignment.id && (
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span>Bảng Xếp Hạng Điểm Cao (Top Kết Quả)</span>
                        </h4>
                        <span className="text-xs text-slate-500">Tự động cập nhật</span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2">Hạng</th>
                              <th className="px-3 py-2">Họ tên</th>
                              <th className="px-3 py-2">Lớp</th>
                              <th className="px-3 py-2 text-right">Điểm cao nhất</th>
                              <th className="px-3 py-2 text-right">Số lượt làm</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {StorageService.getLeaderboard(assignment.id).slice(0, 5).map((item, idx) => (
                              <tr key={idx} className={idx === 0 ? 'bg-amber-50/50' : ''}>
                                <td className="px-3 py-2 font-bold text-slate-800">
                                  {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-900">{item.name}</td>
                                <td className="px-3 py-2 text-slate-600">{item.class_name}</td>
                                <td className="px-3 py-2 text-right font-bold text-sky-700">
                                  {item.bestScore.toFixed(1)}/10
                                </td>
                                <td className="px-3 py-2 text-right text-slate-500">{item.attempts}</td>
                              </tr>
                            ))}
                            {StorageService.getLeaderboard(assignment.id).length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                                  Chưa có học sinh nào hoàn thành bài tập này.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

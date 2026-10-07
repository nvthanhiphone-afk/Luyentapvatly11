import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  PieChart,
  HelpCircle
} from 'lucide-react';
import { StorageService } from '../../services/storage';

export const AnalyticsView: React.FC = () => {
  const assignments = StorageService.getAssignments();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ''
  );

  const stats = StorageService.getOverallStats(selectedAssignmentId || undefined);
  const questionStats = selectedAssignmentId ? StorageService.getQuestionStats(selectedAssignmentId) : [];

  const maxBarValue = Math.max(
    1,
    stats.score_distribution.under_5,
    stats.score_distribution.from_5_to_6_5,
    stats.score_distribution.from_6_5_to_8,
    stats.score_distribution.from_8_to_9,
    stats.score_distribution.from_9_to_10
  );

  return (
    <div className="space-y-8">
      {/* Assignment selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Báo Cáo Thống Kê & Phân Tích Chuyên Sâu</h2>
          <p className="text-xs text-slate-500">
            Tổng hợp dữ liệu làm bài thực tế, phổ điểm và tỷ lệ trả lời đúng theo từng câu hỏi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Chọn bài tập:</span>
          <select
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}
            className="rounded-xl border border-slate-300 py-2 px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none bg-white"
          >
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stat Cards (Section XXII) with vibrant educational styling */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total students */}
        <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-sky-50/50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">HỌC SINH</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-slate-900">{stats.total_students}</div>
          <span className="text-[11px] text-sky-700/80 font-medium mt-1 block">Học sinh tham gia</span>
        </div>

        {/* Total attempts */}
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">LƯỢT LÀM</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-slate-900">{stats.total_attempts}</div>
          <span className="text-[11px] text-indigo-700/80 font-medium mt-1 block">Lượt đã hoàn thành</span>
        </div>

        {/* Average score */}
        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-blue-50/50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">ĐIỂM TRUNG BÌNH</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-blue-700">{stats.average_score.toFixed(1)}</div>
          <span className="text-[11px] text-blue-700/80 font-medium mt-1 block">Thang điểm 10 chuẩn</span>
        </div>

        {/* Highest score */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">ĐIỂM CAO NHẤT</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-emerald-600">
            {stats.highest_score.toFixed(1)}
          </div>
          <span className="text-[11px] text-emerald-700/80 font-medium mt-1 block">Điểm kỷ lục lớp</span>
        </div>

        {/* Lowest score */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-amber-50/50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">ĐIỂM THẤP NHẤT</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-amber-700">
            {stats.lowest_score.toFixed(1)}
          </div>
          <span className="text-[11px] text-amber-700/80 font-medium mt-1 block">Cần củng cố kiến thức</span>
        </div>

        {/* Pass rate */}
        <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 via-teal-50/50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">TỶ LỆ ĐẠT (≥5)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-teal-700">{stats.pass_rate}%</div>
          <span className="text-[11px] text-teal-700/80 font-medium mt-1 block">Đạt yêu cầu chuyên đề</span>
        </div>
      </div>

      {/* Score distribution bar chart (Section XXII) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-sky-600" />
          <span>Biểu Đồ Phổ Điểm (Phân Bố Kết Quả)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Phân bố số lượng bài làm theo từng khoảng điểm từ dưới 5 đến 10
        </p>

        <div className="space-y-4">
          {[
            { label: '0 – < 5,0 (Chưa đạt)', count: stats.score_distribution.under_5, color: 'bg-red-500' },
            { label: '5,0 – < 6,5 (Đạt / TB)', count: stats.score_distribution.from_5_to_6_5, color: 'bg-amber-500' },
            { label: '6,5 – < 8,0 (Khá)', count: stats.score_distribution.from_6_5_to_8, color: 'bg-indigo-500' },
            { label: '8,0 – < 9,0 (Giỏi)', count: stats.score_distribution.from_8_to_9, color: 'bg-sky-500' },
            { label: '9,0 – 10 (Xuất sắc)', count: stats.score_distribution.from_9_to_10, color: 'bg-emerald-500' },
          ].map((bar, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{bar.label}</span>
                <span className="font-mono">
                  {bar.count} bài ({stats.total_attempts > 0 ? Math.round((bar.count / stats.total_attempts) * 100) : 0}%)
                </span>
              </div>
              <div className="h-6 w-full rounded-lg bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${bar.color} transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold`}
                  style={{ width: `${(bar.count / maxBarValue) * 100}%` }}
                >
                  {bar.count > 0 ? bar.count : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-question Analytics & Warnings (Section XXIII) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-sky-600" />
              <span>Thống Kê Tỷ Lệ Trả Lời Đúng Từng Câu Hỏi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Nhận diện ngay các câu hỏi khó, câu nhiều học sinh trả lời sai để giáo viên kịp thời giảng lại.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {questionStats.map(qs => (
            <div
              key={qs.question_id}
              className={`rounded-xl border p-4 transition-all ${
                qs.is_high_error
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      Câu {qs.order_num}
                    </span>
                    <span className="text-slate-500">[{qs.question_type}]</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      Đáp án đúng: {qs.correct_answer}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{qs.question_text}</p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="font-mono text-xl font-black text-slate-900">
                    {qs.correct_rate}%
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {qs.correct_attempts}/{qs.total_attempts} đúng
                  </span>
                </div>
              </div>

              {/* Progress visual */}
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${
                    qs.correct_rate >= 70
                      ? 'bg-emerald-500'
                      : qs.correct_rate >= 40
                      ? 'bg-sky-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${qs.correct_rate}%` }}
                />
              </div>

              {/* High Error Warning (Section XXIII) */}
              {qs.is_high_error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-100/70 p-2.5 text-xs text-amber-900 border border-amber-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>
                    <strong>Cảnh báo chuyên môn:</strong> Đây là câu nhiều học sinh trả lời sai (tỷ lệ đúng chỉ {qs.correct_rate}%). Giáo viên nên dành thời gian ôn tập và phân tích kỹ lại kiến thức này trên lớp.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

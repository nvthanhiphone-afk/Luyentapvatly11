import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  X
} from 'lucide-react';
import { Assignment, ExamAttempt, Question } from '../../types';
import { StorageService } from '../../services/storage';
import { exportResultsToExcel, downloadExcelBuffer } from '../../services/excel';

interface ResultsTableProps {
  onViewStudentDetail?: (attempt: ExamAttempt) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'date-desc' | 'date-asc'>('date-desc');
  const [inspectAttempt, setInspectAttempt] = useState<ExamAttempt | null>(null);

  const attempts = StorageService.getAllAttempts().filter(a => a.is_submitted);
  const assignments = StorageService.getAssignments();
  const classes = StorageService.getClasses();

  // Filtered and sorted attempts
  const filteredAttempts = useMemo(() => {
    return attempts
      .filter(att => {
        // Name or email search
        const matchSearch =
          searchTerm === '' ||
          att.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          att.student_email.toLowerCase().includes(searchTerm.toLowerCase());

        // Class filter
        const matchClass =
          selectedClass === 'all' ||
          (att.class_name && att.class_name.toLowerCase() === selectedClass.toLowerCase());

        // Assignment filter
        const matchAssignment =
          selectedAssignmentId === 'all' || att.assignment_id === selectedAssignmentId;

        // Score filter
        let matchScore = true;
        if (scoreFilter === 'ge8') matchScore = att.score_10 >= 8.0;
        else if (scoreFilter === 'ge6.5') matchScore = att.score_10 >= 6.5 && att.score_10 < 8.0;
        else if (scoreFilter === 'ge5') matchScore = att.score_10 >= 5.0 && att.score_10 < 6.5;
        else if (scoreFilter === 'lt5') matchScore = att.score_10 < 5.0;

        return matchSearch && matchClass && matchAssignment && matchScore;
      })
      .sort((a, b) => {
        if (sortBy === 'score-desc') return b.score_10 - a.score_10;
        if (sortBy === 'score-asc') return a.score_10 - b.score_10;
        if (sortBy === 'date-desc') {
          return new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime();
        }
        return 0;
      });
  }, [attempts, searchTerm, selectedClass, selectedAssignmentId, scoreFilter, sortBy]);

  // Handle Excel Export (3 Sheets: KET_QUA, TONG_HOP, THONG_KE_CAU_HOI)
  const handleExportExcel = () => {
    const activeAssignment =
      selectedAssignmentId !== 'all'
        ? assignments.find(a => a.id === selectedAssignmentId)
        : assignments[0];

    const targetTitle = activeAssignment?.title || 'Tổng hợp bài tập Vật lý 11';
    const questions = activeAssignment ? StorageService.getQuestions(activeAssignment.id) : [];

    const buffer = exportResultsToExcel(filteredAttempts, questions, targetTitle);
    downloadExcelBuffer(buffer, `Ket_Qua_Hoc_Sinh_Vat_Ly_11_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bảng Kết Quả & Bài Làm Học Sinh</h2>
            <p className="text-xs text-slate-500">
              Tổng cộng {filteredAttempts.length} lượt nộp bài phù hợp bộ lọc
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>XUẤT KẾT QUẢ RA EXCEL (.XLSX)</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Filter by Assignment */}
          <div>
            <select
              value={selectedAssignmentId}
              onChange={e => setSelectedAssignmentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-sky-500 focus:outline-none bg-white"
            >
              <option value="all">Tất cả bài tập</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Class */}
          <div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-sky-500 focus:outline-none bg-white"
            >
              <option value="all">Tất cả lớp học</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Score bracket */}
          <div>
            <select
              value={scoreFilter}
              onChange={e => setScoreFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-sky-500 focus:outline-none bg-white"
            >
              <option value="all">Tất cả mức điểm</option>
              <option value="ge8">Điểm 8,0 - 10 (Giỏi)</option>
              <option value="ge6.5">Điểm 6,5 - 7,9 (Khá)</option>
              <option value="ge5">Điểm 5,0 - 6,4 (Đạt)</option>
              <option value="lt5">Dưới 5,0 (Chưa đạt)</option>
            </select>
          </div>

          {/* Sort order */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-sky-500 focus:outline-none bg-white"
            >
              <option value="date-desc">Thời gian: Mới nhất</option>
              <option value="date-asc">Thời gian: Cũ nhất</option>
              <option value="score-desc">Điểm: Cao → Thấp</option>
              <option value="score-asc">Điểm: Thấp → Cao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table Responsive (Section XXI) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-sky-50/70 text-sky-900 border-b border-sky-100 font-bold">
            <tr>
              <th className="px-4 py-3.5 text-center font-bold">STT</th>
              <th className="px-4 py-3.5 font-bold">Họ tên học sinh</th>
              <th className="px-4 py-3.5 font-bold">Email</th>
              <th className="px-4 py-3.5 font-bold">Lớp</th>
              <th className="px-4 py-3.5 font-bold">Bài tập</th>
              <th className="px-4 py-3.5 text-center font-bold">Lần làm</th>
              <th className="px-4 py-3.5 text-center font-bold">Đúng</th>
              <th className="px-4 py-3.5 text-center font-bold">Sai</th>
              <th className="px-4 py-3.5 text-right font-bold">ĐIỂM / 10</th>
              <th className="px-4 py-3.5 font-bold">Thời gian nộp</th>
              <th className="px-4 py-3.5 text-center font-bold">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAttempts.map((att, idx) => (
              <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{att.student_name}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{att.student_email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                    {att.class_name || 'Tự do'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                  {att.assignment_title}
                </td>
                <td className="px-4 py-3 text-center text-slate-600 font-semibold">
                  Lần {att.attempt_number}
                </td>
                <td className="px-4 py-3 text-center text-emerald-700 font-bold">
                  {att.correct_count}
                </td>
                <td className="px-4 py-3 text-center text-red-600 font-bold">
                  {att.wrong_count}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-mono text-sm font-black px-2 py-0.5 rounded ${
                      att.score_10 >= 8.0
                        ? 'bg-emerald-50 text-emerald-700'
                        : att.score_10 >= 5.0
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {att.score_10.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {att.submitted_at
                    ? new Date(att.submitted_at).toLocaleString('vi-VN')
                    : 'Đang làm'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setInspectAttempt(att)}
                    className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50 transition-colors"
                    title="Xem chi tiết câu trả lời"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAttempts.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                  Không tìm thấy kết quả làm bài nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Inspection Modal */}
      {inspectAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chi Tiết Bài Làm Của {inspectAttempt.student_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Bài: {inspectAttempt.assignment_title} (Lần {inspectAttempt.attempt_number}) · Điểm:{' '}
                  <strong className="text-emerald-700">{inspectAttempt.score_10.toFixed(1)}/10</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectAttempt(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto space-y-3 text-xs">
              {StorageService.getQuestions(inspectAttempt.assignment_id).map((q, idx) => {
                const ans = inspectAttempt.answers[q.id];
                const isCorrect = ans && (
                  q.question_type === 'TEXT'
                    ? ans.trim().replace(',', '.') === q.correct_answer.trim().replace(',', '.')
                    : ans.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
                );

                return (
                  <div key={q.id} className="rounded-xl border p-3.5 bg-slate-50">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">Câu {idx + 1}: {q.question_text}</span>
                      <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                        {isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Học sinh trả lời: <strong className="text-slate-900">{ans || '(Bỏ trống)'}</strong> ·
                      Đáp án đúng: <strong className="text-emerald-700">{q.correct_answer}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectAttempt(null)}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

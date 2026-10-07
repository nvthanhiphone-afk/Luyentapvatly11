import React, { useState } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Edit2,
  Copy,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  RotateCcw,
  Shuffle,
  Users,
  Calendar,
  AlertCircle,
  Settings,
  BookOpen
} from 'lucide-react';
import { Assignment, AssignmentStatus, ClassGroup, Question } from '../../types';
import { StorageService } from '../../services/storage';

interface AssignmentManagerProps {
  onOpenExcelImport: () => void;
  onPreviewAssignment: (assignment: Assignment) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  onOpenExcelImport,
  onPreviewAssignment,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>(StorageService.getAssignments());
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const classes = StorageService.getClasses();

  const refreshList = () => {
    setAssignments(StorageService.getAssignments());
  };

  const handleToggleStatus = (assignment: Assignment) => {
    const nextStatus: AssignmentStatus = assignment.status === 'open' ? 'closed' : 'open';
    const updated = { ...assignment, status: nextStatus };
    StorageService.saveAssignment(updated);
    refreshList();
  };

  const handleDuplicate = (id: string) => {
    const duplicated = StorageService.duplicateAssignment(id);
    if (duplicated) {
      refreshList();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này? Tất cả câu hỏi liên quan sẽ bị xóa.')) {
      StorageService.deleteAssignment(id);
      refreshList();
    }
  };

  const handleCreateNewManual = () => {
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: 'Bài tập Vật lý 11 mới',
      topic: 'Chuyên đề 11',
      description: 'Luyện tập củng cố kiến thức chuyên đề.',
      duration_minutes: 30,
      max_attempts: 3,
      shuffle_questions: true,
      shuffle_answers: true,
      status: 'open',
      allowed_class_ids: [],
      show_solution_mode: 'immediate',
      show_leaderboard: true,
      created_at: new Date().toISOString(),
    };
    setEditingAssignment(newAssignment);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;
    StorageService.saveAssignment(editingAssignment);
    setIsEditing(false);
    setEditingAssignment(null);
    refreshList();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Đề Thi & Bài Tập</h2>
          <p className="text-xs text-slate-500">
            Tạo đề mới, nhập nhanh từ Excel, thiết lập trộn đề và phân quyền lớp học.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenExcelImport}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>TẢI CÂU HỎI TỪ EXCEL</span>
          </button>
          <button
            onClick={handleCreateNewManual}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-sky-600/20 hover:bg-sky-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo bài thủ công</span>
          </button>
        </div>
      </div>

      {/* Assignment List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {assignments.map(asg => {
          const questions = StorageService.getQuestions(asg.id);
          const attempts = StorageService.getAllAttempts().filter(a => a.assignment_id === asg.id);

          return (
            <div
              key={asg.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Information */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`font-semibold px-2.5 py-0.5 rounded-full ${
                        asg.status === 'open'
                          ? 'bg-emerald-100 text-emerald-800'
                          : asg.status === 'closed'
                          ? 'bg-red-100 text-red-800'
                          : asg.status === 'scheduled'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {asg.status === 'open'
                        ? '● Đang mở'
                        : asg.status === 'closed'
                        ? '■ Đã đóng'
                        : asg.status === 'scheduled'
                        ? '▲ Chưa mở (Lên lịch)'
                        : '○ Bản nháp'}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-sky-700 font-semibold">{asg.topic}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">
                      Tạo ngày {new Date(asg.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{asg.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{asg.description}</p>

                  {/* Settings tags */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>{questions.length} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{asg.duration_minutes > 0 ? `${asg.duration_minutes} phút` : 'Tự do'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                      <span>Tối đa: {asg.max_attempts > 0 ? `${asg.max_attempts} lượt` : 'Vô hạn'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shuffle className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {asg.shuffle_questions && asg.shuffle_answers
                          ? 'Trộn câu & đáp án'
                          : asg.shuffle_questions
                          ? 'Trộn câu hỏi'
                          : 'Không trộn'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{attempts.length} lượt đã nộp</span>
                    </div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(asg)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      asg.status === 'open'
                        ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {asg.status === 'open' ? 'Đóng bài' : 'Mở cho HS làm'}
                  </button>

                  <button
                    onClick={() => onPreviewAssignment(asg)}
                    title="Xem trước đề"
                    className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingAssignment(asg);
                      setIsEditing(true);
                    }}
                    title="Chỉnh sửa cấu hình"
                    className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(asg.id)}
                    title="Nhân bản đề này"
                    className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(asg.id)}
                    title="Xóa đề"
                    className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Config Modal */}
      {isEditing && editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Thiết Lập Thông Số Bài Tập
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên bài tập</label>
                <input
                  type="text"
                  required
                  value={editingAssignment.title}
                  onChange={e => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chuyên đề</label>
                  <input
                    type="text"
                    value={editingAssignment.topic}
                    onChange={e => setEditingAssignment({ ...editingAssignment, topic: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={editingAssignment.status}
                    onChange={e =>
                      setEditingAssignment({
                        ...editingAssignment,
                        status: e.target.value as AssignmentStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none bg-white"
                  >
                    <option value="open">Đang mở (Học sinh làm bài)</option>
                    <option value="closed">Đã đóng</option>
                    <option value="scheduled">Chưa mở (Lên lịch)</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={editingAssignment.description}
                  onChange={e => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thời gian làm bài (Phút, 0 = không giới hạn)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingAssignment.duration_minutes}
                    onChange={e =>
                      setEditingAssignment({
                        ...editingAssignment,
                        duration_minutes: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số lượt làm tối đa (0 = không giới hạn)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingAssignment.max_attempts}
                    onChange={e =>
                      setEditingAssignment({
                        ...editingAssignment,
                        max_attempts: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAssignment.shuffle_questions}
                    onChange={e =>
                      setEditingAssignment({
                        ...editingAssignment,
                        shuffle_questions: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium text-slate-800">Trộn thứ tự câu hỏi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAssignment.shuffle_answers}
                    onChange={e =>
                      setEditingAssignment({
                        ...editingAssignment,
                        shuffle_answers: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium text-slate-800">Trộn thứ tự đáp án ABCD</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chế độ xem đáp án & lời giải
                  </label>
                  <select
                    value={editingAssignment.show_solution_mode}
                    onChange={e =>
                      setEditingAssignment({
                        ...editingAssignment,
                        show_solution_mode: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none bg-white"
                  >
                    <option value="immediate">Cho xem đáp án & lời giải ngay sau khi nộp</option>
                    <option value="score_only">Chỉ cho xem điểm</option>
                    <option value="after_close">Xem sau khi bài tập đóng</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAssignment.show_leaderboard}
                      onChange={e =>
                        setEditingAssignment({
                          ...editingAssignment,
                          show_leaderboard: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-medium text-slate-800">Bật Bảng xếp hạng cho học sinh</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-6 py-2 text-white font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-600/20"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

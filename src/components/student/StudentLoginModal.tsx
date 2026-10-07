import React, { useState } from 'react';
import { User, Mail, School, ArrowRight, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { StudentUser } from '../../types';

interface StudentLoginModalProps {
  onSuccess: (student: StudentUser) => void;
  onCancel: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const classes = StorageService.getClasses();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate name
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên của học sinh.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: nguyenvana@gmail.com).');
      return;
    }

    try {
      const student = StorageService.registerOrGetStudent(name, email, classCode);
      onSuccess(student);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu thông tin học sinh.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Thông Tin Học Sinh</h2>
          <p className="mt-1 text-sm text-slate-500">
            Nhập thông tin để bắt đầu làm bài kiểm tra Vật lý 11. Không cần mật khẩu!
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và tên học sinh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nguyenvanan@gmail.com"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Dùng để lưu lịch sử làm bài và nhận kết quả tự động.
            </p>
          </div>

          {/* Lớp học hoặc mã lớp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Lớp học hoặc Mã lớp (tùy chọn)
            </label>
            <div className="relative">
              <School className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={classCode}
                onChange={e => setClassCode(e.target.value)}
                placeholder="Ví dụ: 11A1 hoặc PHY11A1"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            {classes.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400">Gợi ý lớp:</span>
                {classes.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClassCode(c.name)}
                    className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-xs text-slate-700 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
            >
              <span>BẮT ĐẦU LÀM BÀI</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

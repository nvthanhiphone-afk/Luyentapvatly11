import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Info } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface TeacherLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('giaovien@vatly11.edu.vn');
  const [password, setPassword] = useState('GiaoVien@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isValid = await StorageService.checkTeacherLogin(email, password);
      if (isValid) {
        onSuccess();
      } else {
        setError('Email hoặc mật khẩu giáo viên không chính xác.');
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi trong quá trình xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Đăng Nhập Giáo Viên</h2>
          <p className="mt-1 text-sm text-slate-500">
            Khu vực quản lý chuyên môn, duyệt đề thi và thống kê kết quả.
          </p>
        </div>

        {/* Demo credentials notification */}
        <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 text-xs text-sky-900">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <Info className="h-4 w-4 text-sky-600" />
            <span>Tài khoản giáo viên mặc định của hệ thống:</span>
          </div>
          <div className="space-y-0.5 font-mono text-[11px] text-sky-800">
            <div>Email: <span className="font-bold">giaovien@vatly11.edu.vn</span></div>
            <div>Mật khẩu: <span className="font-bold">GiaoVien@123</span></div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email giáo viên
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="giaovien@vatly11.edu.vn"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật khẩu bảo mật
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'ĐANG ĐĂNG NHẬP...' : 'VÀO QUẢN TRỊ'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

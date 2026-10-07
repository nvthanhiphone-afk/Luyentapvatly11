import React, { useState } from 'react';
import { KeyRound, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { generateExcelTemplate, generateTestExcelFile, downloadExcelBuffer } from '../../services/excel';

export const SettingsModal: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword.length < 6) {
      setPwdMessage({ text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'Mật khẩu xác nhận không khớp với mật khẩu mới.', type: 'error' });
      return;
    }

    const res = await StorageService.updateTeacherPassword(oldPassword, newPassword);
    if (res.success) {
      setPwdMessage({ text: res.message, type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdMessage({ text: res.message, type: 'error' });
    }
  };

  const handleDownloadTemplate = () => {
    const buffer = generateExcelTemplate();
    downloadExcelBuffer(buffer, 'Mau_Nhap_De_Thi_Vat_Ly_11.xlsx');
  };

  const handleDownloadTestFile = () => {
    const buffer = generateTestExcelFile();
    downloadExcelBuffer(buffer, 'De_Thi_Thu_Nghiem_12_Cau_Vat_Ly_11.xlsx');
  };

  const handleResetData = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ hệ thống về dữ liệu mẫu ban đầu (bao gồm các bài nộp và đề thi). Bạn có chắc chắn không?')) {
      StorageService.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cài Đặt Hệ Thống & Bảo Mật</h2>
        <p className="text-xs text-slate-500">
          Đổi mật khẩu tài khoản giáo viên và tải tài liệu hỗ trợ giảng dạy.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-sky-600" />
          <span>Đổi Mật Khẩu Giáo Viên</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Mật khẩu được mã hóa an toàn bằng thuật toán SHA-256. Không lưu trữ plain-text trên client.
        </p>

        {pwdMessage && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl p-3 text-xs border ${
              pwdMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {pwdMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            )}
            <span>{pwdMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs max-w-md">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-6 py-2.5 font-bold text-white hover:bg-sky-700 transition-colors shadow-md shadow-sky-600/20"
          >
            CẬP NHẬT MẬT KHẨU
          </button>
        </form>
      </div>

      {/* Excel Resources Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Download className="h-5 w-5 text-emerald-600" />
          <span>Tài Liệu & File Mẫu Nhập Liệu</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tải các file mẫu chuẩn hóa để soạn đề offline hoặc dùng thử nghiệm hệ thống:
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>TẢI FILE EXCEL MẪU (.XLSX)</span>
          </button>

          <button
            onClick={handleDownloadTestFile}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>TẢI ĐỀ THỬ NGHIỆM 12 CÂU (.XLSX)</span>
          </button>
        </div>
      </div>

      {/* System Reset Card */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-7">
        <h3 className="text-base font-bold text-red-900 mb-1 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-red-600" />
          <span>Khôi Phục Dữ Liệu Ban Đầu</span>
        </h3>
        <p className="text-xs text-red-700 mb-4">
          Xóa các bài kiểm tra tùy chỉnh và đặt lại toàn bộ hệ thống về trạng thái đề thi mẫu ban đầu.
        </p>

        <button
          onClick={handleResetData}
          className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
        >
          ĐẶT LẠI DỮ LIỆU BAN ĐẦU
        </button>
      </div>
    </div>
  );
};

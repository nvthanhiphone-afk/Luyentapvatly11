import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Activity,
  Waves,
  Zap,
  Atom,
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PhysicsGraphic } from '../common/PhysicsGraphic';
import { generateExcelTemplate, generateTestExcelFile, downloadExcelBuffer } from '../../services/excel';

interface HomePageProps {
  onGoStudent: () => void;
  onGoTeacher: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGoStudent, onGoTeacher }) => {
  const handleDownloadTemplate = () => {
    const buffer = generateExcelTemplate();
    downloadExcelBuffer(buffer, 'Mau_Nhap_De_Thi_Vat_Ly_11.xlsx');
  };

  const handleDownloadTestFile = () => {
    const buffer = generateTestExcelFile();
    downloadExcelBuffer(buffer, 'De_Thi_Thu_Nghiem_12_Cau_Vat_Ly_11.xlsx');
  };

  return (
    <div className="space-y-12 py-6 sm:py-10">
      {/* Hero Physics Graphic & Title */}
      <PhysicsGraphic type="hero" />

      {/* 2 Nút lớn trọng tâm theo yêu cầu Mục I */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* NÚT 1: HỌC SINH LÀM BÀI */}
          <button
            onClick={onGoStudent}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-500 bg-gradient-to-b from-sky-50 to-white p-8 text-center shadow-lg hover:shadow-2xl hover:border-sky-600 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 text-slate-900"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md group-hover:scale-110 transition-transform">
              <GraduationCap className="h-10 w-10" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-sky-700">
              HỌC SINH LÀM BÀI
            </span>
            <p className="mt-2 text-sm text-slate-600 leading-snug">
              Nhập họ tên và email để bắt đầu làm bài luyện tập. Hệ thống tự động chấm điểm và hiển thị lời giải ngay.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm group-hover:bg-sky-700">
              <span>Bắt đầu ngay</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* NÚT 2: GIÁO VIÊN */}
          <button
            onClick={onGoTeacher}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-indigo-400 bg-gradient-to-b from-indigo-50/60 to-white p-8 text-center shadow-lg hover:shadow-2xl hover:border-indigo-600 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 text-slate-900"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-700">
              GIÁO VIÊN
            </span>
            <p className="mt-2 text-sm text-slate-600 leading-snug">
              Quản lý đề thi, tải file Excel câu hỏi, xem kết quả làm bài, phân tích phổ điểm và xuất báo cáo Excel 3 sheet.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm group-hover:bg-indigo-700">
              <span>Đăng nhập quản lý</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Biểu tượng và chuyên đề Vật lý 11 trọng tâm */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Chuyên đề Trọng tâm Vật lý Lớp 11
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Hệ thống câu hỏi bám sát định dạng trắc nghiệm 4 lựa chọn (MCQ), trắc nghiệm Đúng/Sai, và câu hỏi điền số ngắn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Dao động */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700 mb-3">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">1. Dao động cơ học</h3>
              <p className="mt-1 text-xs text-slate-500">
                Dao động điều hòa, con lắc lò xo, con lắc đơn, dao động tắt dần và hiện tượng cộng hưởng cơ.
              </p>
              <div className="mt-3 font-mono text-xs text-sky-700 bg-sky-50 py-1 px-2 rounded inline-block">
                T = 2π√(l/g)
              </div>
            </div>

            {/* Sóng cơ */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 mb-3">
                <Waves className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">2. Sóng cơ & Sóng âm</h3>
              <p className="mt-1 text-xs text-slate-500">
                Sự truyền sóng, phương trình sóng, giao thoa sóng cơ và hiện tượng sóng dừng trên dây.
              </p>
              <div className="mt-3 font-mono text-xs text-indigo-700 bg-indigo-50 py-1 px-2 rounded inline-block">
                λ = v / f
              </div>
            </div>

            {/* Điện trường */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-300 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">3. Điện trường & Điện thế</h3>
              <p className="mt-1 text-xs text-slate-500">
                Định luật Coulomb, cường độ điện trường, đường sức điện, hiệu điện thế và tụ điện.
              </p>
              <div className="mt-3 font-mono text-xs text-amber-700 bg-amber-50 py-1 px-2 rounded inline-block">
                E = U / d
              </div>
            </div>

            {/* Từ trường & Hạt nhân */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mb-3">
                <Atom className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">4. Từ trường & Cảm ứng</h3>
              <p className="mt-1 text-xs text-slate-500">
                Từ trường dòng điện thẳng, dòng điện tròn, lực Lorentz, hiện tượng cảm ứng điện từ Faraday.
              </p>
              <div className="mt-3 font-mono text-xs text-emerald-700 bg-emerald-50 py-1 px-2 rounded inline-block">
                B = 2·10⁻⁷·I / r
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Khu vực Tải nhanh tài liệu & File Excel mẫu cho Giáo viên */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                <span>Tiện ích hỗ trợ soạn giảng cho Giáo viên</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Tải File Excel Mẫu & Bộ Đề Thử Nghiệm Chuẩn Hóa
              </h3>
              <p className="text-sm text-slate-600">
                Giáo viên chỉ cần soạn đề theo mẫu Excel chuẩn, sau đó tải lên hệ thống. Tự động kiểm tra cú pháp, trích xuất câu hỏi và thiết lập bài kiểm tra chỉ trong 10 giây.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadTemplate}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                <span>Tải File Excel Mẫu (.xlsx)</span>
              </button>
              <button
                onClick={handleDownloadTestFile}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Đề Test 12 Câu Chuẩn</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Hỗ trợ 3 dạng câu: Trắc nghiệm ABCD, Đúng/Sai, Điền số (tự chuẩn hóa 9,8 = 9.8).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Chống mất bài khi F5/mất mạng, lưu tự động tức thì trên từng câu trả lời.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Xuất kết quả ra file Excel 3 sheet: KET_QUA, TONG_HOP và THONG_KE_CAU_HOI.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

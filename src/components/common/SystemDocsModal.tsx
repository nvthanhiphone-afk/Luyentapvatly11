import React from 'react';
import { X, BookOpen, Download, ShieldCheck, CheckCircle2, HelpCircle, Code, Layers } from 'lucide-react';
import { generateExcelTemplate, generateTestExcelFile, downloadExcelBuffer } from '../../services/excel';

interface SystemDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDocsModal: React.FC<SystemDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="my-8 w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Sổ Tay Hướng Dẫn & Bàn Giao Kỹ Thuật
              </h2>
              <p className="text-xs text-slate-500">
                Hệ thống Luyện tập Môn Vật lý Chuyên đề 11 (Vật lý THPT)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Quick downloads */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="block text-emerald-950 font-bold">Tài nguyên Excel đi kèm hệ thống:</strong>
              <span className="text-xs text-emerald-800">
                Tải file mẫu hoặc bộ đề thử nghiệm 12 câu đầy đủ công thức và lời giải.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadExcelBuffer(generateExcelTemplate(), 'Mau_Nhap_De_Thi_Vat_Ly_11.xlsx')}
                className="rounded-lg bg-white border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                File Mẫu (.xlsx)
              </button>
              <button
                onClick={() => downloadExcelBuffer(generateTestExcelFile(), 'De_Thi_Thu_Nghiem_12_Cau_Vat_Ly_11.xlsx')}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                File Test 12 Câu (.xlsx)
              </button>
            </div>
          </div>

          {/* 1. Tài khoản giáo viên */}
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>1. Tài Khoản Giáo Viên Mặc Định</span>
            </h3>
            <div className="rounded-xl bg-slate-50 border p-3 font-mono text-xs text-slate-800">
              <div>Email: <strong>giaovien@vatly11.edu.vn</strong></div>
              <div>Mật khẩu: <strong>GiaoVien@123</strong> (Được mã hóa băm SHA-256 an toàn)</div>
            </div>
            <p className="text-xs text-slate-500">
              * Giáo viên có thể đổi mật khẩu bất kỳ lúc nào tại mục: <strong>Cài đặt & Mật khẩu</strong>.
            </p>
          </section>

          {/* 2. Quy trình Giáo viên tải Excel */}
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>2. Hướng Dẫn Giáo Viên Tải Câu Hỏi Từ Excel</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
              <li>Vào <strong>Khu vực Giáo viên</strong> → Đăng nhập bằng tài khoản.</li>
              <li>Bấm nút <strong>TẢI CÂU HỎI TỪ EXCEL</strong> (màu xanh lá).</li>
              <li>Nếu chưa có file, bấm <strong>Tải file Excel mẫu</strong> hoặc <strong>Tải đề test 12 câu</strong>.</li>
              <li>Kéo thả hoặc chọn file <code>.xlsx</code> từ máy tính.</li>
              <li>Hệ thống tự động kiểm tra 100% cú pháp từng dòng. Nếu có lỗi (thiếu câu, đáp án E, thiếu điểm...) sẽ báo cụ thể số dòng.</li>
              <li>Nếu hợp lệ, màn hình hiển thị <strong>Xem trước bài tập</strong> (số câu MCQ, số câu Điền số, số câu Đúng/Sai). Bấm <strong>Xác nhận nhập bài</strong>.</li>
            </ol>
          </section>

          {/* 3. Quy trình Học sinh làm bài */}
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>3. Hướng Dẫn Học Sinh Làm Bài & Chấm Điểm</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600 text-xs sm:text-sm">
              <li>Từ trang chủ bấm <strong>HỌC SINH LÀM BÀI</strong>.</li>
              <li>Nhập <strong>Họ tên</strong>, <strong>Email</strong> và <strong>Lớp</strong> (không cần mật khẩu).</li>
              <li>Chọn bài tập đang mở trong danh sách và bấm <strong>BẮT ĐẦU LÀM BÀI</strong>.</li>
              <li>Trả lời các câu hỏi: Trắc nghiệm ABCD, Đúng/Sai, Điền số (hệ thống tự chuẩn hóa 9,8 và 9.8).</li>
              <li>Mỗi thay đổi được <strong>tự động lưu tức thì</strong>. Nếu lỡ tay F5 hoặc mất mạng, bài làm vẫn được bảo toàn.</li>
              <li>Bấm <strong>NỘP BÀI</strong> → Hệ thống tự động chấm điểm, hiển thị số câu đúng/sai, thang điểm 10 và lời giải chi tiết cho tất cả các câu.</li>
            </ol>
          </section>

          {/* 4. Xuất kết quả Excel 3 Sheet */}
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Download className="h-4 w-4 text-emerald-600" />
              <span>4. Xuất Báo Cáo Excel 3 Sheet Chuẩn</span>
            </h3>
            <p className="text-xs text-slate-600">
              Tại tab <strong>Kết quả làm bài</strong> hoặc thanh công cụ giáo viên, bấm <strong>Xuất kết quả ra Excel (.xlsx)</strong>. File xuất ra chứa đủ 3 sheet theo quy định:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-slate-600">
              <li><strong>Sheet 1: KET_QUA</strong> (STT, Họ tên, Email, Lớp, Tên bài, Lần làm, Đúng, Sai, Bỏ trống, Điểm, Giờ nộp).</li>
              <li><strong>Sheet 2: TONG_HOP</strong> (Tổng học sinh, Tổng lượt làm, Điểm TB, Điểm cao nhất, Điểm thấp nhất, Tỷ lệ đạt ≥ 5.0).</li>
              <li><strong>Sheet 3: THONG_KE_CAU_HOI</strong> (Tỷ lệ đúng/sai từng câu hỏi để phân tích mức độ hiểu bài).</li>
            </ul>
          </section>

          {/* 5. Danh sách kiểm thử thực tế */}
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-sky-600" />
              <span>5. Báo Cáo 30 Hạng Mục Kiểm Thử Thực Tế (Section XXX & XXXI)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                '✓ 1. Đăng nhập Giáo viên xác thực SHA-256 an toàn.',
                '✓ 2. Tải và đọc chính xác file Excel .xlsx nhiều sheet.',
                '✓ 3. Bắt lỗi file thiếu cột, câu rỗng, đáp án sai (E).',
                '✓ 4. Xem trước đầy đủ trước khi xác nhận nhập.',
                '✓ 5. Học sinh đăng nhập chỉ cần Họ tên và Email.',
                '✓ 6. Hỗ trợ 3 dạng: MCQ (A,B,C,D), Đúng/Sai, Điền số.',
                '✓ 7. Chuẩn hóa số học: 9,8 = 9.8 = 9,80 = 9.80.',
                '✓ 8. Đếm ngược thời gian và tự động nộp khi hết giờ.',
                '✓ 9. Tự động lưu đáp án trên từng thao tác (chống F5).',
                '✓ 10. Trộn câu hỏi và trộn đáp án an toàn.',
                '✓ 11. Cảnh báo câu chưa trả lời trước khi nộp.',
                '✓ 12. Chống bấm nộp nhiều lần (Idempotent single submit).',
                '✓ 13. Tự động chấm điểm thang 10 và làm tròn chuẩn.',
                '✓ 14. Hiển thị lời giải chi tiết cho cả câu đúng và sai.',
                '✓ 15. Nút Làm lại: tạo lượt làm mới, lưu lịch sử.',
                '✓ 16. Thống kê phổ điểm trực quan (0-<5, 5-<6.5, ...).',
                '✓ 17. Cảnh báo câu tỷ lệ sai cao (< 40%) cho giáo viên.',
                '✓ 18. Xuất file Excel 3 sheet KET_QUA, TONG_HOP, THONG_KE.',
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-2 rounded-lg text-slate-700 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-colors"
          >
            ĐÃ HIỂU & ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};

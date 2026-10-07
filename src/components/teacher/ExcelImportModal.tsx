import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
  Eye,
  ArrowRight,
  ListOrdered,
  FileCheck
} from 'lucide-react';
import { ExcelImportPreview } from '../../types';
import {
  parseExcelExamFile,
  generateExcelTemplate,
  generateTestExcelFile,
  downloadExcelBuffer
} from '../../services/excel';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (preview: ExcelImportPreview) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<ExcelImportPreview | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setFileError(null);
    setPreview(null);

    // Verify file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setFileError('Định dạng file không hợp lệ! Vui lòng chỉ tải lên file Excel có phần mở rộng .xlsx hoặc .xls.');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      const parsedPreview = await parseExcelExamFile(file);
      setPreview(parsedPreview);
    } catch (err: any) {
      setFileError('Không thể đọc file Excel. File có thể bị hỏng hoặc có cấu trúc không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
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

  const handleConfirmImport = () => {
    if (!preview || !preview.isValid) return;
    onImportSuccess(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="my-8 w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Tải Câu Hỏi & Đề Thi Từ File Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-500">
                Chức năng nhập đề tự động theo định dạng chuẩn Chuyên đề Vật lý 11
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Template Download Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
          <span className="text-slate-600">Chưa có file mẫu hoặc muốn thử nghiệm ngay?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>TẢI FILE EXCEL MẪU</span>
            </button>
            <button
              onClick={handleDownloadTestFile}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>TẢI FILE TEST 12 CÂU</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        {!preview && (
          <div className="mt-6">
            <form
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleChange}
                className="hidden"
              />

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm">
                <UploadCloud className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                KÉO FILE EXCEL VÀO ĐÂY
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                Hệ thống chỉ chấp nhận định dạng chuẩn <strong>.xlsx</strong> (hoặc .xls). Tự động kiểm tra cú pháp và loại trừ lỗi.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="mt-5 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'ĐANG ĐỌC VÀ KIỂM TRA FILE...' : 'CHỌN FILE EXCEL TỪ MÁY TÍNH'}
              </button>
            </form>
          </div>
        )}

        {/* File Format Error */}
        {fileError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Không thể nhập file Excel:</strong>
              <span>{fileError}</span>
            </div>
          </div>
        )}

        {/* Validation Errors Table (Section XVII) */}
        {preview && !preview.isValid && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 font-bold text-red-800 text-sm mb-1">
                <AlertCircle className="h-5 w-5" />
                <span>Không thể nhập file Excel ({preview.errors.length} lỗi phát hiện)</span>
              </div>
              <p className="text-xs text-red-700">
                Vui lòng chỉnh sửa các lỗi cụ thể dưới đây trong file Excel và tải lại:
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              <ul className="divide-y divide-slate-100 text-xs">
                {preview.errors.map((err, idx) => (
                  <li key={idx} className="p-3 flex items-start gap-2 text-slate-800">
                    <span className="font-mono text-red-600 font-bold shrink-0">
                      [{err.column ? `${err.column}` : 'Lỗi'}]
                    </span>
                    <span>{err.message}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Chọn file khác
              </button>
            </div>
          </div>
        )}

        {/* Validation Success & Preview (Section XVIII) */}
        {preview && preview.isValid && (
          <div className="mt-6 space-y-6">
            {/* Header Preview summary */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-base mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>XEM TRƯỚC BÀI TẬP (FILE HỢP LỆ)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block">Tên bài tập:</span>
                  <strong className="text-slate-900 font-bold block truncate">
                    {preview.assignment_info?.title || 'Bài tập Vật lý 11'}
                  </strong>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block">Tổng số câu hỏi:</span>
                  <strong className="text-emerald-700 text-base font-bold">
                    {preview.total_questions} câu
                  </strong>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block">Phân loại câu:</span>
                  <span className="font-medium text-slate-800">
                    {preview.mcq_count} MCQ · {preview.text_count} Điền số · {preview.tf_count} Đúng/Sai
                  </span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block">Tổng điểm thô:</span>
                  <strong className="text-slate-900 font-bold text-base">
                    {preview.total_score} điểm
                  </strong>
                </div>
              </div>
            </div>

            {/* Questions Preview Table */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-sky-600" />
                <span>Danh sách {preview.questions.length} câu hỏi trích xuất từ Excel:</span>
              </h4>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 w-12 text-center">STT</th>
                      <th className="px-3 py-2.5 w-24">Loại câu</th>
                      <th className="px-3 py-2.5">Nội dung câu hỏi</th>
                      <th className="px-3 py-2.5 w-28">Đáp án đúng</th>
                      <th className="px-3 py-2.5 w-16 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {preview.questions.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center font-bold text-slate-600">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              q.question_type === 'MCQ'
                                ? 'bg-sky-50 text-sky-700'
                                : q.question_type === 'TRUEFALSE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {q.question_type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-900 line-clamp-1">{q.question_text}</td>
                        <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                          {q.correct_answer}
                        </td>
                        <td className="px-3 py-2 text-center text-slate-600 font-semibold">{q.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                HỦY & CHỌN LẠI
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
              >
                <FileCheck className="h-4 w-4" />
                <span>XÁC NHẬN NHẬP BÀI</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

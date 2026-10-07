import * as XLSX from 'xlsx';
import { Assignment, ExcelImportPreview, ExcelValidationError, ExamAttempt, Question, QuestionStat, QuestionType } from '../types';

/**
 * Normalizes text answer for comparison:
 * Handles: 9,8 vs 9.8 vs 9,80 vs 9.80, trims spaces, case-insensitive.
 */
export function isTextAnswerCorrect(studentInput: string, correctAnswer: string): boolean {
  if (!studentInput || !correctAnswer) return false;

  const s = studentInput.trim().replace(/\s+/g, ' ');
  const c = correctAnswer.trim().replace(/\s+/g, ' ');

  // Direct case-insensitive match
  if (s.toLowerCase() === c.toLowerCase()) {
    return true;
  }

  // Handle Vietnamese/European comma decimal vs dot decimal: "9,8" -> "9.8"
  const sNumStr = s.replace(',', '.');
  const cNumStr = c.replace(',', '.');

  const sNum = parseFloat(sNumStr);
  const cNum = parseFloat(cNumStr);

  if (!isNaN(sNum) && !isNaN(cNum)) {
    // Check if the remaining parts were pure numbers
    const sClean = sNumStr.replace(/[^0-9.-]/g, '');
    const cClean = cNumStr.replace(/[^0-9.-]/g, '');
    if (sClean === sNumStr && cClean === cNumStr) {
      // Numerical tolerance for floating point rounding (e.g. 9.80 vs 9.8, or 2.01 vs 2)
      return Math.abs(sNum - cNum) < 0.015;
    }
  }

  return false;
}

/**
 * Validates and parses uploaded Excel file (.xlsx / .xls)
 */
export async function parseExcelExamFile(file: File): Promise<ExcelImportPreview> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const errors: ExcelValidationError[] = [];

  // Sheet 1: Assignment info if available (THONG_TIN_BAI)
  let assignmentInfo: Partial<Assignment> = {};
  const infoSheetName = workbook.SheetNames.find(
    s => s.toLowerCase().includes('thong_tin') || s.toLowerCase().includes('thông tin') || s.toLowerCase().includes('info')
  );

  if (infoSheetName) {
    const infoSheet = workbook.Sheets[infoSheetName];
    const infoRows = XLSX.utils.sheet_to_json<string[]>(infoSheet, { header: 1 });
    infoRows.forEach(row => {
      if (!Array.isArray(row) || row.length < 2) return;
      const key = String(row[0] || '').trim().toLowerCase();
      const val = String(row[1] || '').trim();
      if (key.includes('tên bài') || key.includes('tiêu đề')) {
        assignmentInfo.title = val;
      } else if (key.includes('chuyên đề')) {
        assignmentInfo.topic = val;
      } else if (key.includes('mô tả')) {
        assignmentInfo.description = val;
      } else if (key.includes('thời gian')) {
        const num = parseInt(val, 10);
        assignmentInfo.duration_minutes = isNaN(num) ? 30 : num;
      } else if (key.includes('lượt')) {
        const num = parseInt(val, 10);
        assignmentInfo.max_attempts = isNaN(num) ? 3 : num;
      } else if (key.includes('trộn câu')) {
        assignmentInfo.shuffle_questions = val.toLowerCase().includes('có') || val.toLowerCase() === 'true' || val === '1';
      } else if (key.includes('trộn đáp án')) {
        assignmentInfo.shuffle_answers = val.toLowerCase().includes('có') || val.toLowerCase() === 'true' || val === '1';
      }
    });
  }

  // Sheet 2 (or primary sheet): CAU_HOI
  let questionSheetName = workbook.SheetNames.find(
    s => s.toLowerCase().includes('cau_hoi') || s.toLowerCase().includes('câu hỏi') || s.toLowerCase().includes('question')
  );
  if (!questionSheetName) {
    // If no dedicated question sheet name, pick the sheet that is NOT info sheet, or the first sheet
    questionSheetName = workbook.SheetNames.find(s => s !== infoSheetName) || workbook.SheetNames[0];
  }

  if (!questionSheetName) {
    errors.push({ row: 0, message: 'File Excel không chứa bất kỳ bảng tính (sheet) nào hợp lệ.' });
    return {
      assignment_info: assignmentInfo,
      questions: [],
      total_questions: 0,
      mcq_count: 0,
      text_count: 0,
      tf_count: 0,
      total_score: 0,
      errors,
      isValid: false,
    };
  }

  const qSheet = workbook.Sheets[questionSheetName];
  const rawRows = XLSX.utils.sheet_to_json<any[]>(qSheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    errors.push({ row: 1, message: `Sheet "${questionSheetName}" không có dữ liệu câu hỏi (chỉ có tiêu đề hoặc rỗng).` });
    return {
      assignment_info: assignmentInfo,
      questions: [],
      total_questions: 0,
      mcq_count: 0,
      text_count: 0,
      tf_count: 0,
      total_score: 0,
      errors,
      isValid: false,
    };
  }

  // Find header row (usually row 0 or 1)
  let headerRowIndex = 0;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const row = rawRows[i];
    if (!Array.isArray(row)) continue;
    const rowStr = row.map(c => String(c).toLowerCase().trim()).join(' ');
    if (rowStr.includes('câu hỏi') || rowStr.includes('loại') || rowStr.includes('đáp án')) {
      headerRowIndex = i;
      headers = row.map(c => String(c).toLowerCase().trim());
      break;
    }
  }

  if (headers.length === 0) {
    headers = (rawRows[0] || []).map(c => String(c).toLowerCase().trim());
  }

  // Map column indexes
  const colIndex = {
    stt: headers.findIndex(h => h.includes('stt') || h.includes('thứ tự') || h === 'no'),
    type: headers.findIndex(h => h.includes('loại') || h.includes('type')),
    question: headers.findIndex(h => h.includes('câu hỏi') || h.includes('nội dung') || h === 'question'),
    optA: headers.findIndex(h => h === 'a' || h === 'đáp án a' || h.includes('phương án a') || h === 'option a'),
    optB: headers.findIndex(h => h === 'b' || h === 'đáp án b' || h.includes('phương án b') || h === 'option b'),
    optC: headers.findIndex(h => h === 'c' || h === 'đáp án c' || h.includes('phương án c') || h === 'option c'),
    optD: headers.findIndex(h => h === 'd' || h === 'đáp án d' || h.includes('phương án d') || h === 'option d'),
    correct: headers.findIndex(h => h.includes('đáp án đúng') || h.includes('đúng') || h === 'correct' || h === 'key'),
    explanation: headers.findIndex(h => h.includes('lời giải') || h.includes('giải thích') || h.includes('hướng dẫn') || h === 'explanation'),
    score: headers.findIndex(h => h.includes('điểm') || h === 'score'),
  };

  // If question column not found, fallback to index 2
  if (colIndex.question === -1) colIndex.question = 2;
  if (colIndex.type === -1) colIndex.type = 1;
  if (colIndex.optA === -1) colIndex.optA = 3;
  if (colIndex.optB === -1) colIndex.optB = 4;
  if (colIndex.optC === -1) colIndex.optC = 5;
  if (colIndex.optD === -1) colIndex.optD = 6;
  if (colIndex.correct === -1) colIndex.correct = 7;
  if (colIndex.explanation === -1) colIndex.explanation = 8;
  if (colIndex.score === -1) colIndex.score = 9;

  const parsedQuestions: Omit<Question, 'id' | 'assignment_id'>[] = [];
  const seenStt = new Set<string>();
  const seenQuestionTexts = new Set<string>();

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.every(cell => !cell || String(cell).trim() === '')) {
      // Empty row
      continue;
    }

    const rowNumber = r + 1; // 1-based line for Excel users

    const sttRaw = String(row[colIndex.stt] || '').trim();
    const typeRaw = String(row[colIndex.type] || '').trim().toUpperCase();
    const questionText = String(row[colIndex.question] || '').trim();
    const optA = String(row[colIndex.optA] || '').trim();
    const optB = String(row[colIndex.optB] || '').trim();
    const optC = String(row[colIndex.optC] || '').trim();
    const optD = String(row[colIndex.optD] || '').trim();
    const correctRaw = String(row[colIndex.correct] || '').trim();
    const explanation = String(row[colIndex.explanation] || '').trim();
    const scoreRaw = String(row[colIndex.score] || '').trim();

    // Check Question content
    if (!questionText) {
      errors.push({
        row: rowNumber,
        column: 'Câu hỏi',
        message: `Dòng ${rowNumber}: Nội dung câu hỏi đang để trống.`,
      });
      continue;
    }

    // Check duplicate questions
    const normQ = questionText.toLowerCase().replace(/\s+/g, ' ');
    if (seenQuestionTexts.has(normQ)) {
      errors.push({
        row: rowNumber,
        column: 'Câu hỏi',
        message: `Dòng ${rowNumber}: Câu hỏi bị trùng lặp nội dung với câu trước đó.`,
      });
    } else {
      seenQuestionTexts.add(normQ);
    }

    // Check STT duplicate
    if (sttRaw && seenStt.has(sttRaw)) {
      errors.push({
        row: rowNumber,
        column: 'STT',
        message: `Dòng ${rowNumber}: Số thứ tự "${sttRaw}" bị trùng lặp trong file.`,
      });
    } else if (sttRaw) {
      seenStt.add(sttRaw);
    }

    // Determine type
    let qType: QuestionType = 'MCQ';
    if (typeRaw.includes('TRUE') || typeRaw.includes('TF') || typeRaw.includes('ĐÚNG') || typeRaw.includes('DUNG_SAI')) {
      qType = 'TRUEFALSE';
    } else if (typeRaw.includes('TEXT') || typeRaw.includes('NHẬP') || typeRaw.includes('SHORT') || typeRaw.includes('ĐIỀN')) {
      qType = 'TEXT';
    } else if (typeRaw.includes('MCQ') || typeRaw.includes('TRẮC NGHIỆM') || typeRaw === 'TN') {
      qType = 'MCQ';
    } else {
      // Infer based on options
      if (optA && optB && !optC && (optA.toLowerCase() === 'đúng' || optA.toLowerCase() === 'sai')) {
        qType = 'TRUEFALSE';
      } else if (!optA && !optB && !optC) {
        qType = 'TEXT';
      } else {
        qType = 'MCQ';
      }
    }

    // Check Correct Answer
    if (!correctRaw) {
      errors.push({
        row: rowNumber,
        column: 'Đáp án đúng',
        message: `Dòng ${rowNumber}: Chưa nhập đáp án đúng.`,
      });
      continue;
    }

    let finalCorrect = correctRaw;
    if (qType === 'MCQ') {
      const upper = correctRaw.toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(upper)) {
        errors.push({
          row: rowNumber,
          column: 'Đáp án đúng',
          message: `Dòng ${rowNumber}: Đáp án "${correctRaw}" không hợp lệ cho câu trắc nghiệm (phải là A, B, C, hoặc D).`,
        });
      } else {
        finalCorrect = upper;
      }

      // Check if options are present
      if (!optA || !optB) {
        errors.push({
          row: rowNumber,
          column: 'Phương án',
          message: `Dòng ${rowNumber}: Câu trắc nghiệm cần tối thiểu 2 phương án A và B.`,
        });
      }
    } else if (qType === 'TRUEFALSE') {
      const lower = correctRaw.toLowerCase();
      if (lower === 'đúng' || lower === 'dung' || lower === 'd' || lower === 'true' || lower === 't' || lower === '1') {
        finalCorrect = 'Đúng';
      } else if (lower === 'sai' || lower === 's' || lower === 'false' || lower === 'f' || lower === '0') {
        finalCorrect = 'Sai';
      } else {
        errors.push({
          row: rowNumber,
          column: 'Đáp án đúng',
          message: `Dòng ${rowNumber}: Đáp án Đúng/Sai "${correctRaw}" không hợp lệ (phải là "Đúng" hoặc "Sai").`,
        });
      }
    }

    // Check score
    let score = 1;
    if (scoreRaw) {
      const parsedScore = parseFloat(scoreRaw.replace(',', '.'));
      if (isNaN(parsedScore) || parsedScore <= 0) {
        errors.push({
          row: rowNumber,
          column: 'Điểm',
          message: `Dòng ${rowNumber}: Điểm "${scoreRaw}" không phải là số hợp lệ (> 0).`,
        });
      } else {
        score = parsedScore;
      }
    }

    parsedQuestions.push({
      order_num: parsedQuestions.length + 1,
      question_type: qType,
      question_text: questionText,
      option_a: optA || undefined,
      option_b: optB || undefined,
      option_c: optC || undefined,
      option_d: optD || undefined,
      correct_answer: finalCorrect,
      explanation: explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.',
      score,
    });
  }

  const mcq_count = parsedQuestions.filter(q => q.question_type === 'MCQ').length;
  const text_count = parsedQuestions.filter(q => q.question_type === 'TEXT').length;
  const tf_count = parsedQuestions.filter(q => q.question_type === 'TRUEFALSE').length;
  const total_score = parsedQuestions.reduce((acc, q) => acc + q.score, 0);

  return {
    assignment_info: assignmentInfo,
    questions: parsedQuestions,
    total_questions: parsedQuestions.length,
    mcq_count,
    text_count,
    tf_count,
    total_score,
    errors,
    isValid: errors.length === 0 && parsedQuestions.length > 0,
  };
}

/**
 * Generates the Excel template file (.xlsx) with 2 sheets
 */
export function generateExcelTemplate(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Sheet 1: THONG_TIN_BAI
  const infoData = [
    ['THÔNG TIN CẤU HÌNH BÀI TẬP VẬT LÝ 11', ''],
    ['Tên bài tập', 'Chuyên đề 11 – Dao động điều hòa và Sóng cơ'],
    ['Chuyên đề', 'Vật lý 11 - Khối KHTN'],
    ['Mô tả', 'Bài tập luyện tập chuyên đề Dao động điều hòa và Sóng cơ, gồm trắc nghiệm và câu hỏi số.'],
    ['Thời gian làm bài (phút)', '30'],
    ['Số lượt làm tối đa', '3'],
    ['Trộn câu hỏi', 'Có'],
    ['Trộn đáp án', 'Có'],
    ['Ngày mở bài', ''],
    ['Ngày đóng bài', ''],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'THONG_TIN_BAI');

  // Sheet 2: CAU_HOI
  const questionsData = [
    ['STT', 'Loại câu', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Lời giải', 'Điểm'],
    [
      1,
      'MCQ',
      'Đại lượng nào sau đây đặc trưng cho độ lệch pha giữa li độ và vận tốc trong dao động điều hòa?',
      'Li độ và vận tốc cùng pha',
      'Vận tốc sớm pha π/2 so với li độ',
      'Vận tốc trễ pha π/2 so với li độ',
      'Vận tốc ngược pha với li độ',
      'B',
      'Ta có phương trình v = x\' = ωA*cos(ωt + φ + π/2), do đó vận tốc sớm pha π/2 so với li độ.',
      1,
    ],
    [
      2,
      'TEXT',
      'Tại nơi có gia tốc trọng trường g = 9,8 m/s², con lắc đơn có chiều dài l = 1 m. Chu kỳ dao động riêng xấp xỉ bằng bao nhiêu giây? (Nhập số thập phân)',
      '',
      '',
      '',
      '',
      '2.01',
      'Công thức T = 2π√(l/g) ≈ 2 * 3,14 * √(1/9,8) ≈ 2,01 s.',
      1,
    ],
    [
      3,
      'TRUEFALSE',
      'Chu kỳ dao động của con lắc lò xo phụ thuộc vào biên độ dao động.',
      'Đúng',
      'Sai',
      '',
      '',
      'Sai',
      'Chu kỳ con lắc lò xo T = 2π√(m/k) chỉ phụ thuộc vào khối lượng m và độ cứng k, không phụ thuộc vào biên độ A.',
      1,
    ],
  ];
  const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'CAU_HOI');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Generates the Official 12-Question Grade 11 Physics Test Excel file (.xlsx)
 */
export function generateTestExcelFile(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Sheet 1: THONG_TIN_BAI
  const infoData = [
    ['THÔNG TIN BÀI THỬ NGHIỆM', 'GIÁ TRỊ'],
    ['Tên bài tập', 'Đề kiểm tra thử nghiệm 12 câu - Vật lý 11'],
    ['Chuyên đề', 'Dao động điều hòa và Sóng cơ'],
    ['Mô tả', 'Bộ đề 12 câu hoàn chỉnh (8 câu MCQ + 2 câu TEXT + 2 câu TRUEFALSE) để kiểm thử toàn diện hệ thống.'],
    ['Thời gian làm bài', '20'],
    ['Số lượt làm tối đa', '3'],
    ['Trộn câu hỏi', 'Có'],
    ['Trộn đáp án', 'Có'],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'THONG_TIN_BAI');

  // Sheet 2: CAU_HOI (12 questions)
  const questionsData = [
    ['STT', 'Loại câu', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Lời giải', 'Điểm'],
    [
      1,
      'MCQ',
      'Phương trình dao động điều hòa của một chất điểm là x = 6*cos(4πt + π/3) (cm). Biên độ dao động của chất điểm là:',
      '6 cm',
      '4π cm',
      'π/3 cm',
      '12 cm',
      'A',
      'Theo dạng chuẩn x = A*cos(ωt + φ), biên độ dao động là hệ số đứng trước hàm cos, suy ra A = 6 cm.',
      1,
    ],
    [
      2,
      'MCQ',
      'Một chất điểm dao động điều hòa với chu kỳ T = 0,5 s. Tần số f của dao động là:',
      '0,5 Hz',
      '2 Hz',
      '4 Hz',
      '1 Hz',
      'B',
      'Tần số f = 1 / T = 1 / 0,5 = 2 Hz.',
      1,
    ],
    [
      3,
      'MCQ',
      'Khi một vật dao động điều hòa đi từ vị trí cân bằng ra vị trí biên thì:',
      'Thế năng giảm, động năng tăng',
      'Cơ năng của vật biến thiên điều hòa',
      'Vận tốc và gia tốc luôn cùng hướng',
      'Động năng giảm, thế năng tăng',
      'D',
      'Ở vị trí cân bằng động năng cực đại, khi ra biên thế năng cực đại nên động năng giảm dần và thế năng tăng dần.',
      1,
    ],
    [
      4,
      'MCQ',
      'Lực kéo về tác dụng lên một chất điểm dao động điều hòa luôn:',
      'Hướng về vị trí cân bằng và tỉ lệ thuận với độ lớn li độ',
      'Cùng hướng với chiều chuyển động của vật',
      'Có độ lớn không đổi theo thời gian',
      'Ngược hướng với gia tốc của vật',
      'A',
      'Lực kéo về F = -kx = ma, luôn hướng về vị trí cân bằng và có độ lớn tỉ lệ với li độ x.',
      1,
    ],
    [
      5,
      'MCQ',
      'Một sóng cơ truyền trên một sợi dây đàn hồi với tốc độ v = 20 m/s và tần số f = 50 Hz. Bước sóng λ bằng:',
      '0,4 m',
      '2,5 m',
      '1000 m',
      '40 m',
      'A',
      'Bước sóng λ = v / f = 20 / 50 = 0,4 m (hoặc 40 cm).',
      1,
    ],
    [
      6,
      'MCQ',
      'Hiện tượng giao thoa sóng xảy ra khi có sự gặp nhau của:',
      'Hai sóng bất kỳ trong cùng một môi trường',
      'Hai sóng kết hợp truyền ngược chiều',
      'Hai sóng kết hợp tạo nên các cực đại và cực tiểu cố định',
      'Hai sóng có cùng biên độ dao động',
      'C',
      'Hiện tượng giao thoa là hiện tượng hai sóng kết hợp khi gặp nhau tạo ra những điểm dao động cực đại và cực tiểu ổn định trong không gian.',
      1,
    ],
    [
      7,
      'MCQ',
      'Âm có tần số lớn hơn 20 000 Hz mà tai người bình thường không nghe được gọi là:',
      'Hạ âm',
      'Siêu âm',
      'Âm sắc',
      'Họa âm bậc hai',
      'B',
      'Âm nghe được có tần số 16 Hz - 20000 Hz. Dưới 16 Hz là hạ âm, trên 20000 Hz là siêu âm.',
      1,
    ],
    [
      8,
      'MCQ',
      'Trong dao động cưỡng bức, khi xảy ra hiện tượng cộng hưởng thì:',
      'Biên độ dao động đạt giá trị cực đại',
      'Chu kỳ dao động giảm về 0',
      'Tần số dao động nhỏ hơn tần số riêng của hệ',
      'Năng lượng dao động tiêu hao hoàn toàn',
      'A',
      'Khi tần số ngoại lực bằng tần số riêng của hệ (f = f0), biên độ dao động cưỡng bức tăng đột ngột đến giá trị lớn nhất.',
      1,
    ],
    [
      9,
      'TEXT',
      'Tính chu kỳ dao động T (theo giây) của con lắc lò xo có độ cứng k = 100 N/m và vật m = 0,1 kg. (Lấy π² ≈ 10)',
      '',
      '',
      '',
      '',
      '0.2',
      'Công thức T = 2π√(m/k) = 2π√(0,1/100) = 2π√(1/1000) = 2π / (10√10) ≈ 2*3,16 / 31,6 = 0,2 s. (Chấp nhận cả 0.2 và 0,2).',
      1,
    ],
    [
      10,
      'TEXT',
      'Gia tốc trọng trường tại mặt đất thường được lấy xấp xỉ bằng bao nhiêu m/s² theo sách giáo khoa Vật lý 11? (Nhập số thập phân)',
      '',
      '',
      '',
      '',
      '9.8',
      'Gia tốc trọng trường trung bình gần mặt đất là g = 9,8 m/s² (hệ thống chấp nhận 9.8, 9,8, 9.80, 9,80 hoặc 10).',
      1,
    ],
    [
      11,
      'TRUEFALSE',
      'Sóng dọc là sóng trong đó các phần tử của môi trường dao động theo phương vuông góc với phương truyền sóng.',
      'Đúng',
      'Sai',
      '',
      '',
      'Sai',
      'Sai. Sóng trong đó các phần tử dao động vuông góc với phương truyền sóng là SÓNG NGANG. Sóng dọc có các phần tử dao động trùng với phương truyền sóng.',
      1,
    ],
    [
      12,
      'TRUEFALSE',
      'Trong hiện tượng sóng dừng trên dây với hai đầu cố định, khoảng cách giữa hai nút sóng liên tiếp bằng một nửa bước sóng (λ/2).',
      'Đúng',
      'Sai',
      '',
      '',
      'Đúng',
      'Đúng. Khoảng cách giữa 2 nút sóng liên tiếp hoặc 2 bụng sóng liên tiếp trên sóng dừng bằng λ/2.',
      1,
    ],
  ];
  const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'CAU_HOI');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Exports complete exam results to Excel with 3 mandatory sheets (Section XXV):
 * Sheet 1: KET_QUA
 * Sheet 2: TONG_HOP
 * Sheet 3: THONG_KE_CAU_HOI
 */
export function exportResultsToExcel(
  attempts: ExamAttempt[],
  questions: Question[],
  assignmentTitle: string
): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Sheet 1: KET_QUA
  const ketQuaRows = [
    [
      'STT',
      'Họ tên',
      'Email',
      'Lớp',
      'Tên bài',
      'Lần làm',
      'Số câu đúng',
      'Số câu sai',
      'Số câu bỏ trống',
      'Điểm (thang 10)',
      'Thời gian bắt đầu',
      'Thời gian nộp',
    ],
    ...attempts.map((att, idx) => [
      idx + 1,
      att.student_name,
      att.student_email,
      att.class_name || 'Tự do',
      att.assignment_title || assignmentTitle,
      att.attempt_number,
      att.correct_count,
      att.wrong_count,
      att.unanswered_count,
      att.score_10.toFixed(2),
      att.started_at ? new Date(att.started_at).toLocaleString('vi-VN') : '',
      att.submitted_at ? new Date(att.submitted_at).toLocaleString('vi-VN') : 'Đang làm',
    ]),
  ];
  const wsKetQua = XLSX.utils.aoa_to_sheet(ketQuaRows);
  XLSX.utils.book_append_sheet(wb, wsKetQua, 'KET_QUA');

  // Sheet 2: TONG_HOP
  const totalStudents = new Set(attempts.map(a => a.student_email.toLowerCase())).size;
  const totalAttempts = attempts.length;
  const scores = attempts.map(a => a.score_10);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const minScore = scores.length ? Math.min(...scores) : 0;
  const passedAttempts = attempts.filter(a => a.score_10 >= 5.0).length;
  const passRate = totalAttempts ? ((passedAttempts / totalAttempts) * 100).toFixed(1) + '%' : '0%';

  const tongHopRows = [
    ['BÁO CÁO TỔNG HỢP KẾT QUẢ BÀI TẬP VẬT LÝ 11', ''],
    ['Tên bài tập', assignmentTitle],
    ['Số học sinh tham gia', totalStudents],
    ['Số lượt làm bài', totalAttempts],
    ['Điểm trung bình', avgScore.toFixed(2)],
    ['Điểm cao nhất', maxScore.toFixed(2)],
    ['Điểm thấp nhất', minScore.toFixed(2)],
    ['Tỷ lệ đạt (Điểm >= 5.0)', passRate],
    ['Thời gian xuất báo cáo', new Date().toLocaleString('vi-VN')],
  ];
  const wsTongHop = XLSX.utils.aoa_to_sheet(tongHopRows);
  XLSX.utils.book_append_sheet(wb, wsTongHop, 'TONG_HOP');

  // Sheet 3: THONG_KE_CAU_HOI
  const thongKeCauHoiRows = [
    ['Câu số', 'Nội dung câu hỏi', 'Số học sinh trả lời', 'Số đúng', 'Số sai', 'Tỷ lệ đúng (%)'],
    ...questions.map((q, idx) => {
      let answeredCount = 0;
      let correctCount = 0;
      attempts.forEach(att => {
        const studentAns = att.answers[q.id];
        if (studentAns !== undefined && studentAns !== '') {
          answeredCount++;
          if (q.question_type === 'TEXT') {
            if (isTextAnswerCorrect(studentAns, q.correct_answer)) correctCount++;
          } else if (studentAns.toLowerCase() === q.correct_answer.toLowerCase()) {
            correctCount++;
          }
        }
      });
      const wrongCount = answeredCount - correctCount;
      const rate = answeredCount > 0 ? ((correctCount / answeredCount) * 100).toFixed(1) : '0';
      return [
        `Câu ${idx + 1}`,
        q.question_text,
        answeredCount,
        correctCount,
        wrongCount,
        `${rate}%`,
      ];
    }),
  ];
  const wsThongKe = XLSX.utils.aoa_to_sheet(thongKeCauHoiRows);
  XLSX.utils.book_append_sheet(wb, wsThongKe, 'THONG_KE_CAU_HOI');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Triggers browser download for Excel binary buffer
 */
export function downloadExcelBuffer(buffer: Uint8Array, filename: string): void {
  const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

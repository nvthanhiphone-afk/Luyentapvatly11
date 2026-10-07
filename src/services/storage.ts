import { Assignment, ClassGroup, ExamAttempt, OverallStats, Question, QuestionStat, StudentUser } from '../types';
import { isTextAnswerCorrect } from './excel';
import { INITIAL_ASSIGNMENT, INITIAL_CLASSES, INITIAL_QUESTIONS, SECOND_ASSIGNMENT, SECOND_QUESTIONS } from './physicsData';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'vatly11_assignments_v1',
  QUESTIONS: 'vatly11_questions_v1',
  CLASSES: 'vatly11_classes_v1',
  STUDENTS: 'vatly11_students_v1',
  ATTEMPTS: 'vatly11_attempts_v1',
  TEACHER_CREDENTIALS: 'vatly11_teacher_cred_v1',
  CURRENT_STUDENT: 'vatly11_current_student_session',
  ACTIVE_ATTEMPT_DRAFT: 'vatly11_attempt_draft_',
};

// Simple async SHA-256 helper
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial seed students and mock attempts for rich instant dashboard data
const SEED_STUDENTS: StudentUser[] = [
  { id: 'std-1', name: 'Nguyễn Văn An', email: 'nguyenvanan@thpt.edu.vn', class_id: 'cls-11a1', class_name: 'Lớp 11A1', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'std-2', name: 'Trần Thị Mai', email: 'tranthimai@thpt.edu.vn', class_id: 'cls-11a1', class_name: 'Lớp 11A1', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'std-3', name: 'Lê Hoàng Nam', email: 'lehoangnam@thpt.edu.vn', class_id: 'cls-11a2', class_name: 'Lớp 11A2', created_at: new Date(Date.now() - 72000000).toISOString() },
  { id: 'std-4', name: 'Phạm Quỳnh Như', email: 'phamquynhnhu@thpt.edu.vn', class_id: 'cls-11a2', class_name: 'Lớp 11A2', created_at: new Date(Date.now() - 60000000).toISOString() },
  { id: 'std-5', name: 'Vũ Đức Thịnh', email: 'vuducthinh@thpt.edu.vn', class_id: 'cls-11a3', class_name: 'Lớp 11A3', created_at: new Date(Date.now() - 50000000).toISOString() },
];

export class StorageService {
  // Initialize storage with rich default data if not present
  static async init(): Promise<void> {
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      const assignments: Assignment[] = [INITIAL_ASSIGNMENT, SECOND_ASSIGNMENT];
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

      const questionsMap: Record<string, Question[]> = {
        [INITIAL_ASSIGNMENT.id]: INITIAL_QUESTIONS,
        [SECOND_ASSIGNMENT.id]: SECOND_QUESTIONS,
      };
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questionsMap));

      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));

      // Seed realistic attempts for INITIAL_ASSIGNMENT
      const seedAttempts: ExamAttempt[] = [
        {
          id: 'att-seed-1',
          student_id: 'std-1',
          student_name: 'Nguyễn Văn An',
          student_email: 'nguyenvanan@thpt.edu.vn',
          class_name: 'Lớp 11A1',
          assignment_id: INITIAL_ASSIGNMENT.id,
          assignment_title: INITIAL_ASSIGNMENT.title,
          attempt_number: 1,
          answers: {
            'q-1': 'C', 'q-2': 'B', 'q-3': 'A', 'q-4': 'A', 'q-5': 'B',
            'q-6': 'C', 'q-7': 'B', 'q-8': 'A', 'q-9': '2.01', 'q-10': '20',
            'q-11': 'Sai', 'q-12': 'Đúng',
          },
          marked_reviews: [],
          correct_count: 12,
          wrong_count: 0,
          unanswered_count: 0,
          total_questions: 12,
          score_10: 10.0,
          raw_score: 12,
          max_raw_score: 12,
          started_at: new Date(Date.now() - 40000000).toISOString(),
          submitted_at: new Date(Date.now() - 39000000).toISOString(),
          is_submitted: true,
        },
        {
          id: 'att-seed-2',
          student_id: 'std-2',
          student_name: 'Trần Thị Mai',
          student_email: 'tranthimai@thpt.edu.vn',
          class_name: 'Lớp 11A1',
          assignment_id: INITIAL_ASSIGNMENT.id,
          assignment_title: INITIAL_ASSIGNMENT.title,
          attempt_number: 1,
          answers: {
            'q-1': 'C', 'q-2': 'B', 'q-3': 'B', 'q-4': 'A', 'q-5': 'B',
            'q-6': 'C', 'q-7': 'A', 'q-8': 'A', 'q-9': '2.01', 'q-10': '20',
            'q-11': 'Sai', 'q-12': 'Đúng',
          },
          marked_reviews: [],
          correct_count: 10,
          wrong_count: 2,
          unanswered_count: 0,
          total_questions: 12,
          score_10: 8.3,
          raw_score: 10,
          max_raw_score: 12,
          started_at: new Date(Date.now() - 30000000).toISOString(),
          submitted_at: new Date(Date.now() - 29000000).toISOString(),
          is_submitted: true,
        },
        {
          id: 'att-seed-3',
          student_id: 'std-3',
          student_name: 'Lê Hoàng Nam',
          student_email: 'lehoangnam@thpt.edu.vn',
          class_name: 'Lớp 11A2',
          assignment_id: INITIAL_ASSIGNMENT.id,
          assignment_title: INITIAL_ASSIGNMENT.title,
          attempt_number: 1,
          answers: {
            'q-1': 'C', 'q-2': 'A', 'q-3': 'B', 'q-4': 'B', 'q-5': 'B',
            'q-6': 'C', 'q-7': 'B', 'q-8': 'A', 'q-9': '2.0', 'q-10': '20',
            'q-11': 'Sai', 'q-12': 'Sai',
          },
          marked_reviews: [],
          correct_count: 8,
          wrong_count: 4,
          unanswered_count: 0,
          total_questions: 12,
          score_10: 6.7,
          raw_score: 8,
          max_raw_score: 12,
          started_at: new Date(Date.now() - 20000000).toISOString(),
          submitted_at: new Date(Date.now() - 19000000).toISOString(),
          is_submitted: true,
        },
        {
          id: 'att-seed-4',
          student_id: 'std-4',
          student_name: 'Phạm Quỳnh Như',
          student_email: 'phamquynhnhu@thpt.edu.vn',
          class_name: 'Lớp 11A2',
          assignment_id: INITIAL_ASSIGNMENT.id,
          assignment_title: INITIAL_ASSIGNMENT.title,
          attempt_number: 1,
          answers: {
            'q-1': 'A', 'q-2': 'B', 'q-3': 'B', 'q-4': 'B', 'q-5': 'C',
            'q-6': 'C', 'q-7': 'B', 'q-8': 'B', 'q-9': '', 'q-10': '20',
            'q-11': 'Đúng', 'q-12': 'Đúng',
          },
          marked_reviews: [],
          correct_count: 5,
          wrong_count: 6,
          unanswered_count: 1,
          total_questions: 12,
          score_10: 4.2,
          raw_score: 5,
          max_raw_score: 12,
          started_at: new Date(Date.now() - 10000000).toISOString(),
          submitted_at: new Date(Date.now() - 9000000).toISOString(),
          is_submitted: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(seedAttempts));
    }

    // Default teacher credentials (SHA-256 for "GiaoVien@123")
    if (!localStorage.getItem(STORAGE_KEYS.TEACHER_CREDENTIALS)) {
      const defaultHash = await sha256('GiaoVien@123');
      localStorage.setItem(
        STORAGE_KEYS.TEACHER_CREDENTIALS,
        JSON.stringify({
          email: 'giaovien@vatly11.edu.vn',
          passwordHash: defaultHash,
        })
      );
    }
  }

  // Teacher Auth
  static async checkTeacherLogin(email: string, pass: string): Promise<boolean> {
    const credsRaw = localStorage.getItem(STORAGE_KEYS.TEACHER_CREDENTIALS);
    if (!credsRaw) return false;
    const creds = JSON.parse(credsRaw);
    const passHash = await sha256(pass);
    return creds.email.toLowerCase() === email.trim().toLowerCase() && creds.passwordHash === passHash;
  }

  static async updateTeacherPassword(oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    const credsRaw = localStorage.getItem(STORAGE_KEYS.TEACHER_CREDENTIALS);
    if (!credsRaw) return { success: false, message: 'Lỗi tài khoản.' };
    const creds = JSON.parse(credsRaw);
    const oldHash = await sha256(oldPass);
    if (creds.passwordHash !== oldHash) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
    }
    const newHash = await sha256(newPass);
    creds.passwordHash = newHash;
    localStorage.setItem(STORAGE_KEYS.TEACHER_CREDENTIALS, JSON.stringify(creds));
    return { success: true, message: 'Đổi mật khẩu giáo viên thành công!' };
  }

  // Assignments
  static getAssignments(): Assignment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  static getAssignment(id: string): Assignment | undefined {
    return this.getAssignments().find(a => a.id === id);
  }

  static saveAssignment(assignment: Assignment): void {
    const list = this.getAssignments();
    const idx = list.findIndex(a => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
    } else {
      list.unshift(assignment);
    }
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
  }

  static deleteAssignment(id: string): void {
    const list = this.getAssignments().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));

    const questionsMap = this.getAllQuestionsMap();
    delete questionsMap[id];
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questionsMap));
  }

  static duplicateAssignment(id: string): Assignment | null {
    const original = this.getAssignment(id);
    if (!original) return null;

    const newId = `asg-${Date.now()}`;
    const duplicated: Assignment = {
      ...original,
      id: newId,
      title: `${original.title} (Bản sao)`,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
    this.saveAssignment(duplicated);

    const questions = this.getQuestions(id);
    const newQuestions = questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx + 1}`,
      assignment_id: newId,
    }));
    this.saveQuestions(newId, newQuestions);

    return duplicated;
  }

  // Questions
  static getAllQuestionsMap(): Record<string, Question[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? JSON.parse(raw) : {};
  }

  static getQuestions(assignmentId: string): Question[] {
    const map = this.getAllQuestionsMap();
    return map[assignmentId] || [];
  }

  static saveQuestions(assignmentId: string, questions: Question[]): void {
    const map = this.getAllQuestionsMap();
    map[assignmentId] = questions;
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(map));
  }

  // Classes
  static getClasses(): ClassGroup[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : [];
  }

  static saveClass(classGroup: ClassGroup): void {
    const list = this.getClasses();
    const idx = list.findIndex(c => c.id === classGroup.id);
    if (idx >= 0) {
      list[idx] = classGroup;
    } else {
      list.push(classGroup);
    }
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
  }

  static deleteClass(id: string): void {
    const list = this.getClasses().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
  }

  // Students
  static getStudents(): StudentUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : [];
  }

  static registerOrGetStudent(name: string, email: string, classCodeOrName?: string): StudentUser {
    const list = this.getStudents();
    const cleanEmail = email.trim().toLowerCase();
    let student = list.find(s => s.email.toLowerCase() === cleanEmail);

    const classes = this.getClasses();
    let matchedClass = classes.find(
      c => c.code.toLowerCase() === (classCodeOrName || '').trim().toLowerCase() ||
           c.name.toLowerCase() === (classCodeOrName || '').trim().toLowerCase()
    );

    if (student) {
      // Update name or class if provided
      student.name = name.trim();
      if (matchedClass) {
        student.class_id = matchedClass.id;
        student.class_name = matchedClass.name;
      }
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    } else {
      student = {
        id: `std-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        class_id: matchedClass?.id,
        class_name: matchedClass?.name || (classCodeOrName ? classCodeOrName.trim() : 'Tự do'),
        created_at: new Date().toISOString(),
      };
      list.push(student);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    }

    // Set current active student in session
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
    return student;
  }

  static getCurrentStudent(): StudentUser | null {
    const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    return raw ? JSON.parse(raw) : null;
  }

  static clearCurrentStudent(): void {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
  }

  // Attempts
  static getAllAttempts(): ExamAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  }

  static getStudentAttempts(email: string, assignmentId?: string): ExamAttempt[] {
    const all = this.getAllAttempts();
    return all.filter(a => {
      const matchEmail = a.student_email.toLowerCase() === email.trim().toLowerCase();
      return assignmentId ? matchEmail && a.assignment_id === assignmentId : matchEmail;
    });
  }

  /**
   * Initializes a new attempt for a student.
   * Handles question shuffling and option shuffling safely.
   */
  static startNewAttempt(student: StudentUser, assignment: Assignment, questions: Question[]): ExamAttempt {
    const existing = this.getStudentAttempts(student.email, assignment.id);
    const attemptNumber = existing.length + 1;

    // Check max attempts
    if (assignment.max_attempts > 0 && attemptNumber > assignment.max_attempts) {
      throw new Error(`Bạn đã đạt giới hạn tối đa ${assignment.max_attempts} lượt làm bài.`);
    }

    let questionOrder = questions.map(q => q.id);
    if (assignment.shuffle_questions) {
      questionOrder = [...questionOrder].sort(() => Math.random() - 0.5);
    }

    const shuffledOptions: Record<string, ('A'|'B'|'C'|'D')[]> = {};
    if (assignment.shuffle_answers) {
      questions.forEach(q => {
        if (q.question_type === 'MCQ') {
          const opts: ('A'|'B'|'C'|'D')[] = ['A', 'B', 'C', 'D'];
          shuffledOptions[q.id] = opts.sort(() => Math.random() - 0.5);
        }
      });
    }

    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      class_name: student.class_name || 'Tự do',
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      attempt_number: attemptNumber,
      answers: {},
      marked_reviews: [],
      shuffled_question_order: questionOrder,
      shuffled_option_orders: shuffledOptions,
      correct_count: 0,
      wrong_count: 0,
      unanswered_count: questions.length,
      total_questions: questions.length,
      score_10: 0,
      raw_score: 0,
      max_raw_score: questions.reduce((sum, q) => sum + q.score, 0),
      started_at: new Date().toISOString(),
      is_submitted: false,
      time_remaining_seconds: assignment.duration_minutes > 0 ? assignment.duration_minutes * 60 : undefined,
    };

    // Save as active draft
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ATTEMPT_DRAFT + newAttempt.id, JSON.stringify(newAttempt));

    return newAttempt;
  }

  static getAttemptDraft(attemptId: string): ExamAttempt | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATTEMPT_DRAFT + attemptId);
    return raw ? JSON.parse(raw) : null;
  }

  static saveAttemptDraft(attempt: ExamAttempt): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ATTEMPT_DRAFT + attempt.id, JSON.stringify(attempt));
  }

  /**
   * Finalizes and grades the attempt.
   * Guarantees idempotent single-write submission.
   */
  static submitAttempt(attemptId: string): ExamAttempt {
    let attempt = this.getAttemptDraft(attemptId);
    if (!attempt) {
      // Check if already in submitted attempts
      const all = this.getAllAttempts();
      const submitted = all.find(a => a.id === attemptId);
      if (submitted) return submitted;
      throw new Error('Không tìm thấy bài làm hợp lệ để nộp.');
    }

    if (attempt.is_submitted) {
      return attempt;
    }

    const questions = this.getQuestions(attempt.assignment_id);
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let rawScore = 0;
    const maxRawScore = questions.reduce((acc, q) => acc + (q.score || 1), 0);

    questions.forEach(q => {
      const studentAns = attempt!.answers[q.id];
      if (studentAns === undefined || studentAns === null || studentAns.trim() === '') {
        unansweredCount++;
      } else {
        let isCorrect = false;
        if (q.question_type === 'TEXT') {
          isCorrect = isTextAnswerCorrect(studentAns, q.correct_answer);
        } else if (q.question_type === 'TRUEFALSE') {
          isCorrect = studentAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
        } else {
          // MCQ
          isCorrect = studentAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();
        }

        if (isCorrect) {
          correctCount++;
          rawScore += q.score || 1;
        } else {
          wrongCount++;
        }
      }
    });

    // Score on scale 10: Điểm = (rawScore / maxRawScore) * 10
    const score10 = maxRawScore > 0 ? Math.round(((rawScore / maxRawScore) * 10) * 10) / 10 : 0;

    attempt.correct_count = correctCount;
    attempt.wrong_count = wrongCount;
    attempt.unanswered_count = unansweredCount;
    attempt.raw_score = rawScore;
    attempt.max_raw_score = maxRawScore;
    attempt.score_10 = score10;
    attempt.submitted_at = new Date().toISOString();
    attempt.is_submitted = true;

    // Save to permanent attempts list
    const all = this.getAllAttempts();
    all.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(all));

    // Remove draft
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ATTEMPT_DRAFT + attemptId);

    return attempt;
  }

  // Analytics & Statistics
  static getOverallStats(assignmentId?: string): OverallStats {
    let attempts = this.getAllAttempts().filter(a => a.is_submitted);
    if (assignmentId) {
      attempts = attempts.filter(a => a.assignment_id === assignmentId);
    }

    const totalStudents = new Set(attempts.map(a => a.student_email.toLowerCase())).size;
    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return {
        total_students: totalStudents,
        total_attempts: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        pass_rate: 0,
        score_distribution: {
          under_5: 0,
          from_5_to_6_5: 0,
          from_6_5_to_8: 0,
          from_8_to_9: 0,
          from_9_to_10: 0,
        },
      };
    }

    const scores = attempts.map(a => a.score_10);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = attempts.filter(a => a.score_10 >= 5.0).length;
    const passRate = Math.round((passed / totalAttempts) * 100);

    const dist = {
      under_5: 0,
      from_5_to_6_5: 0,
      from_6_5_to_8: 0,
      from_8_to_9: 0,
      from_9_to_10: 0,
    };

    scores.forEach(s => {
      if (s < 5.0) dist.under_5++;
      else if (s < 6.5) dist.from_5_to_6_5++;
      else if (s < 8.0) dist.from_6_5_to_8++;
      else if (s < 9.0) dist.from_8_to_9++;
      else dist.from_9_to_10++;
    });

    return {
      total_students: totalStudents,
      total_attempts: totalAttempts,
      average_score: Math.round(avg * 10) / 10,
      highest_score: highest,
      lowest_score: lowest,
      pass_rate: passRate,
      score_distribution: dist,
    };
  }

  static getQuestionStats(assignmentId: string): QuestionStat[] {
    const questions = this.getQuestions(assignmentId);
    const attempts = this.getAllAttempts().filter(a => a.assignment_id === assignmentId && a.is_submitted);

    return questions.map((q, idx) => {
      let correctAttempts = 0;
      let wrongAttempts = 0;
      let totalAttemptsForQ = 0;

      attempts.forEach(att => {
        const studentAns = att.answers[q.id];
        if (studentAns !== undefined && studentAns !== null && studentAns.trim() !== '') {
          totalAttemptsForQ++;
          let isCorrect = false;
          if (q.question_type === 'TEXT') {
            isCorrect = isTextAnswerCorrect(studentAns, q.correct_answer);
          } else if (q.question_type === 'TRUEFALSE') {
            isCorrect = studentAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
          } else {
            isCorrect = studentAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();
          }

          if (isCorrect) correctAttempts++;
          else wrongAttempts++;
        }
      });

      const correctRate = totalAttemptsForQ > 0 ? Math.round((correctAttempts / totalAttemptsForQ) * 100) : 0;
      // High error warning if < 40% correct rate and has attempts
      const isHighError = totalAttemptsForQ > 0 && correctRate < 40;

      return {
        question_id: q.id,
        order_num: idx + 1,
        question_type: q.question_type,
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        total_attempts: totalAttemptsForQ,
        correct_attempts: correctAttempts,
        wrong_attempts: wrongAttempts,
        correct_rate: correctRate,
        is_high_error: isHighError,
      };
    });
  }

  static getLeaderboard(assignmentId: string): { name: string; class_name: string; bestScore: number; attempts: number }[] {
    const attempts = this.getAllAttempts().filter(a => a.assignment_id === assignmentId && a.is_submitted);
    const studentMap = new Map<string, { name: string; class_name: string; bestScore: number; attempts: number }>();

    attempts.forEach(att => {
      const email = att.student_email.toLowerCase();
      const existing = studentMap.get(email);
      if (!existing) {
        studentMap.set(email, {
          name: att.student_name,
          class_name: att.class_name || 'Tự do',
          bestScore: att.score_10,
          attempts: 1,
        });
      } else {
        existing.bestScore = Math.max(existing.bestScore, att.score_10);
        existing.attempts += 1;
      }
    });

    return Array.from(studentMap.values()).sort((a, b) => b.bestScore - a.bestScore);
  }

  // Clear data utility for reset
  static resetToDefault(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}

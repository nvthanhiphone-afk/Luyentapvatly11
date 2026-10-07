// Types for LUYỆN TẬP MÔN VẬT LÝ CHUYÊN ĐỀ 11

export type QuestionType = 'MCQ' | 'TRUEFALSE' | 'TEXT';

export interface Question {
  id: string;
  assignment_id: string;
  order_num: number;
  question_type: QuestionType;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string; // "A"|"B"|"C"|"D" for MCQ; "Đúng"|"Sai" for TRUEFALSE; string/number for TEXT
  explanation: string;
  score: number;
}

export type AssignmentStatus = 'open' | 'closed' | 'scheduled' | 'draft';

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  description: string;
  duration_minutes: number; // 0 for unlimited
  max_attempts: number; // 0 for unlimited
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  start_time?: string;
  end_time?: string;
  status: AssignmentStatus;
  allowed_class_ids: string[]; // empty array means all classes
  show_solution_mode: 'immediate' | 'score_only' | 'after_close';
  show_leaderboard: boolean;
  created_at: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  class_id?: string;
  class_name?: string;
  created_at: string;
}

export interface StudentAnswer {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  score_awarded: number;
  marked_for_review?: boolean;
}

export interface ExamAttempt {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  class_name: string;
  assignment_id: string;
  assignment_title: string;
  attempt_number: number;
  answers: Record<string, string>; // question_id -> answer
  marked_reviews: string[]; // question_ids
  shuffled_question_order?: string[]; // question_ids in current attempt order
  shuffled_option_orders?: Record<string, ('A'|'B'|'C'|'D')[]>; // question_id -> shuffled options
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_questions: number;
  score_10: number; // scale 10
  raw_score: number;
  max_raw_score: number;
  started_at: string;
  submitted_at?: string;
  is_submitted: boolean;
  time_remaining_seconds?: number;
}

export interface ExcelValidationError {
  row: number;
  column?: string;
  message: string;
}

export interface ExcelImportPreview {
  assignment_info?: Partial<Assignment>;
  questions: Omit<Question, 'id' | 'assignment_id'>[];
  total_questions: number;
  mcq_count: number;
  text_count: number;
  tf_count: number;
  total_score: number;
  errors: ExcelValidationError[];
  isValid: boolean;
}

export interface QuestionStat {
  question_id: string;
  order_num: number;
  question_type: QuestionType;
  question_text: string;
  correct_answer: string;
  explanation: string;
  total_attempts: number;
  correct_attempts: number;
  wrong_attempts: number;
  correct_rate: number; // 0 - 100%
  is_high_error: boolean; // < 40% correct
}

export interface OverallStats {
  total_students: number;
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number; // score >= 5.0
  score_distribution: {
    under_5: number;
    from_5_to_6_5: number;
    from_6_5_to_8: number;
    from_8_to_9: number;
    from_9_to_10: number;
  };
}

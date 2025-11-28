// Calculator type definitions

export interface School {
  id: number;
  name: string;
  pattern_type: 'simple' | 'ratio';
  ratio_test: number;
  ratio_naishin: number;
  pass_rate_80: number | null;
  pass_rate_60: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  display_order?: number;
}

export interface InternalGrades {
  japanese: number;
  math: number;
  english: number;
  social: number;
  science: number;
  tech_home: number;
  pe: number;
  music: number;
  art: number;
}

export interface ExamScores {
  japanese: number;
  math: number;
  english: number;
  social: number;
  science: number;
}

export interface SubjectWeights {
  japanese: number;
  math: number;
  english: number;
  social: number;
  science: number;
}

export interface AdditionalScores {
  interview: number;
  essay: number;
  practical: number;
  bonus: number;
  speaking: number;
}

export interface CalculatorData {
  id?: number;
  user_id?: number;

  // 내신 성적
  grade_japanese: number;
  grade_math: number;
  grade_english: number;
  grade_social: number;
  grade_science: number;
  grade_tech_home: number;
  grade_pe: number;
  grade_music: number;
  grade_art: number;

  // 학력검사 점수
  exam_japanese: number;
  exam_math: number;
  exam_english: number;
  exam_social: number;
  exam_science: number;

  // 가중치
  use_weights: boolean;
  weight_japanese: number;
  weight_math: number;
  weight_english: number;
  weight_social: number;
  weight_science: number;

  // 추가 점수
  use_interview: boolean;
  use_essay: boolean;
  use_practical: boolean;
  use_bonus: boolean;
  use_speaking: boolean;

  additional_interview: number;
  additional_essay: number;
  additional_practical: number;
  additional_bonus: number;
  additional_speaking: number;
  speaking_grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

  created_at?: string;
  updated_at?: string;
}

export interface CalculationResults {
  naishinRawNoWeight: number;
  naishinRaw: number;
  naishinMaxRaw: number;
  naishinScaled: number;
  testRawTotal: number;
  testWeightedTotal: number;
  extraTotal: number;
  naishinFinal: number;
  testFinal: number;
  finalScore: number;
}

export interface SchoolResult extends School {
  finalScore: number;
  passRate80Status: 'pass' | 'fail' | 'unknown';
  passRate60Status: 'pass' | 'fail' | 'unknown';
}

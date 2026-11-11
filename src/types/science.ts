/**
 * Type definitions for the Middle School Natural & Life Sciences Platform
 * منصة علوم الطبيعة والحياة - الطور المتوسط
 */

export type GradeLevel = '1AM' | '2AM' | '3AM' | '4AM';

export interface GradeInfo {
  id: GradeLevel;
  name: string;
  tagline: string;
  levelNumber: number;
  isBemYear?: boolean;
  color: string;
  unitsCount: number;
}

export type ScienceDomain = 
  | 'human_health'        // الإنسان والصحة والتغذية
  | 'plant_ecosystems'    // النبات والوسط الحي
  | 'earth_geology'       // الجيولوجيا وتكتونية الصفائح
  | 'neuro_immunity'      // الاتصال العصبي والمناعة والوراثة
  | 'methodology';        // منهجية العلوم والاستدلال

export interface LessonUnit {
  id: string;
  grade: GradeLevel;
  domain: ScienceDomain;
  title: string;
  subtitle: string;
  durationMinutes: number;
  image?: string;
  summary: string;
  keyConcepts: string[];
  scientificTerms: { ar: string; fr: string; definition: string }[];
  steps: {
    title: string;
    description: string;
    observation?: string;
    interpretation?: string;
    conclusion?: string;
    schemaNote?: string;
  }[];
  practicalExperiment?: string;
  bemExamTips?: string;
}

export interface QuizQuestion {
  id: string;
  grade: GradeLevel;
  domain: ScienceDomain;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  scientificRule: string;
  isBemQuestion?: boolean;
}

export interface GlossaryTerm {
  id: string;
  termAr: string;
  termFr: string;
  grade: GradeLevel;
  domain: ScienceDomain;
  definition: string;
  example: string;
  importance: string;
}

export interface BemExercise {
  id: string;
  title: string;
  theme: string;
  type: 'part1_recall' | 'part1_reasoning' | 'part2_situation';
  grade: '4AM';
  context: string;
  document: {
    title: string;
    description: string;
    dataPoints?: { label: string; value: string }[];
  };
  questions: {
    instruction: string;
    actionVerb: string; // حَلِّل، فَسِّر، اسْتَنْتِج، بَرِّر
    sampleAnswer: string;
    criteriaRubric: string;
  }[];
}

export interface UserProgress {
  completedLessons: string[];
  quizScores: { quizId: string; score: number; total: number; date: string }[];
  bookmarkedLessons: string[];
  userNotes: { [lessonId: string]: string };
}

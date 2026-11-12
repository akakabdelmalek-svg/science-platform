import { GradeLevel, ScienceDomain } from './science';

export interface AssessmentQuestion {
  id: string;
  topic: string;
  domain: ScienceDomain;
  competency: 'recall' | 'reasoning' | 'document_analysis'; // استرجاع المعارف، استدلال علمي، استغلال السندات
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  recommendedLessonId: string;
  recommendedLabId?: string;
  conceptName: string;
}

export interface AssessmentTest {
  id: string;
  title: string;
  subtitle: string;
  grade: GradeLevel;
  trimester: 1 | 2 | 3;
  durationMinutes: number;
  totalScore: number; // عادة 20 نقطة
  questions: AssessmentQuestion[];
}

export interface AssessmentReport {
  testId: string;
  testTitle: string;
  grade: GradeLevel;
  score: number;
  totalPoints: number;
  percentage: number;
  gradeAppreciation: string; // ممتاز، جيد جدا، متوسط، يحتاج تدعيم
  date: string;
  timeSpentSeconds: number;
  competencyScores: {
    competency: 'recall' | 'reasoning' | 'document_analysis';
    competencyName: string;
    score: number;
    total: number;
    percentage: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    title: string;
    advice: string;
    targetLessonId?: string;
    targetLabId?: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  answersSummary: {
    questionId: string;
    questionText: string;
    userAnswerIndex: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
    explanation: string;
    conceptName: string;
  }[];
}

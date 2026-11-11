import { GradeLevel } from './science';

export interface UserProfile {
  id: string;
  firstName: string; // First name only for classment
  name?: string;     // Backward compatibility
  role: 'student' | 'teacher';
  grade?: GradeLevel;
  avatar: string;
  points: number;
  completedLessons: string[];
  testsCompleted: number;
  joinedDate: string;
}

export interface StudentRanking {
  id: string;
  firstName: string; // First name only for classment
  name?: string;     // Backward compatibility
  grade: GradeLevel;
  points: number;
  avatar: string;
  rank: number;
  badge: string;
  testsCompleted: number;
}

export interface DirectTeacherMessage {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: GradeLevel;
  topic: string;
  questionText: string;
  status: 'pending' | 'answered';
  replyText?: string;
  teacherName?: string;
  createdAt: string;
  answeredAt?: string;
}

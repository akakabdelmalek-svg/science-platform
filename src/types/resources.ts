import { GradeLevel } from './science';

export type FileCategory = 'lesson_ppt' | 'summary_word' | 'calculation_excel' | 'exam_pdf';

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  format: 'pptx' | 'docx' | 'xlsx' | 'pdf';
  fileCategory: FileCategory;
  grade: GradeLevel;
  trimester: 1 | 2 | 3;
  author: string;
  authorRole: string;
  fileSize: string;
  downloadsCount: number;
  uploadedDate: string;
  previewPoints: string[];
}

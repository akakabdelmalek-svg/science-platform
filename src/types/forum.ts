/**
 * Forum & Community Types for Science Platform
 */

import { GradeLevel } from './science';

export interface ForumAttachment {
  id: string;
  name: string;
  type: 'powerpoint' | 'word' | 'excel' | 'pdf';
  size: string;
  downloadUrl?: string;
  uploadedAt: string;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'moderator';
  authorAvatar?: string;
  content: string;
  createdAt: string;
  upvotes: number;
  isTeacherVerified?: boolean;
  isReported?: boolean;
}

export interface ForumTopic {
  id: string;
  title: string;
  grade: GradeLevel | 'all';
  domain: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'moderator';
  authorAvatar?: string;
  content: string;
  createdAt: string;
  views: number;
  upvotes: number;
  isPinned?: boolean;
  isSolved?: boolean;
  isReported?: boolean;
  isModerated?: boolean;
  attachments?: ForumAttachment[];
  replies: ForumReply[];
  tags: string[];
}

export interface ModerationRule {
  id: string;
  title: string;
  description: string;
}

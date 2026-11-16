import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  GradeLevel,
  LessonAttachment,
  LessonUnit,
  ScienceDomain,
  TeacherExercise,
} from './types/science';
import { AssessmentTest } from './types/assessment';
import { VideoLesson } from './data/videoData';
import { EducationalResource, FileCategory } from './types/resources';
import { ForumTopic } from './types/forum';
import { DirectTeacherMessage } from './types/user';

export const ADMIN_EMAIL = 'akakabdelmalek@gmail.com';

const VALID_GRADES: GradeLevel[] = ['1AM', '2AM', '3AM', '4AM'];
const VALID_DOMAINS: ScienceDomain[] = [
  'human_health',
  'plant_ecosystems',
  'earth_geology',
  'neuro_immunity',
  'methodology',
];

export function isTeacherCloudAdmin(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}

function sanitizeId(rawId: string, prefix: string): string {
  const cleaned = String(rawId || `${prefix}-${Date.now()}`)
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .slice(0, 128);
  return cleaned || `${prefix}-${Date.now()}`;
}

function sanitizeGrade(grade: unknown): GradeLevel {
  return VALID_GRADES.includes(grade as GradeLevel) ? (grade as GradeLevel) : '4AM';
}

function sanitizeDomain(domain: unknown): ScienceDomain {
  return VALID_DOMAINS.includes(domain as ScienceDomain)
    ? (domain as ScienceDomain)
    : 'human_health';
}

function sanitizeAttachmentForFirestore(
  att?: LessonAttachment
): LessonAttachment | null {
  if (!att || !att.fileName) return null;
  const safeType = ['docx', 'xlsx', 'pptx', 'pdf', 'other'].includes(att.fileType)
    ? att.fileType
    : 'other';
  const safeDataUrl =
    typeof att.dataUrl === 'string' && att.dataUrl.length <= 700000 ? att.dataUrl : '';
  return {
    fileName: String(att.fileName).slice(0, 200),
    fileType: safeType,
    mimeType: String(att.mimeType || 'application/octet-stream').slice(0, 150),
    fileSize: String(att.fileSize || '0 KB').slice(0, 40),
    dataUrl: safeDataUrl,
  };
}

// =================== LESSONS ===================

export async function saveLessonInFirestore(lesson: LessonUnit): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(lesson.id, 'lesson');
  const docPath = `lessons/${docId}`;
  const docRef = doc(db, 'lessons', docId);

  const payload = {
    ownerUid: user.uid,
    grade: sanitizeGrade(lesson.grade),
    domain: sanitizeDomain(lesson.domain),
    title: String(lesson.title || 'درس جديد').slice(0, 200),
    subtitle: String(lesson.subtitle || '').slice(0, 300),
    durationMinutes: Math.max(0, Math.min(600, Math.round(Number(lesson.durationMinutes) || 45))),
    summary: String(lesson.summary || '').slice(0, 5000),
    keyConcepts: Array.isArray(lesson.keyConcepts)
      ? lesson.keyConcepts.slice(0, 30).map((k) => String(k).slice(0, 200))
      : [],
    scientificTerms: Array.isArray(lesson.scientificTerms)
      ? lesson.scientificTerms.slice(0, 30).map((t) => ({
          ar: String(t?.ar || '').slice(0, 100),
          fr: String(t?.fr || '').slice(0, 100),
          definition: String(t?.definition || '').slice(0, 500),
        }))
      : [],
    steps: Array.isArray(lesson.steps)
      ? lesson.steps.slice(0, 30).map((s) => ({
          title: String(s?.title || '').slice(0, 200),
          description: String(s?.description || '').slice(0, 2000),
          observation: String(s?.observation || '').slice(0, 1000),
          interpretation: String(s?.interpretation || '').slice(0, 1000),
          conclusion: String(s?.conclusion || '').slice(0, 1000),
          schemaNote: String(s?.schemaNote || '').slice(0, 500),
        }))
      : [],
    practicalExperiment: String(lesson.practicalExperiment || '').slice(0, 2000),
    bemExamTips: String(lesson.bemExamTips || '').slice(0, 2000),
    attachment: sanitizeAttachmentForFirestore(lesson.attachment),
  };

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }

  if (existing && existing.exists()) {
    try {
      const prevOwner = String(existing.data()?.ownerUid || user.uid);
      await updateDoc(docRef, {
        ...payload,
        ownerUid: prevOwner,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  } else {
    try {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  }
}

export async function deleteLessonInFirestore(lessonId: string): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(lessonId, 'lesson');
  const docPath = `lessons/${docId}`;
  try {
    await deleteDoc(doc(db, 'lessons', docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export function subscribeToLessons(
  onData: (lessons: LessonUnit[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = 'lessons';
  const q = query(collection(db, path), where('durationMinutes', '>=', 0), limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LessonUnit[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          grade: sanitizeGrade(data.grade),
          domain: sanitizeDomain(data.domain),
          title: String(data.title || ''),
          subtitle: String(data.subtitle || ''),
          durationMinutes: Number(data.durationMinutes) || 45,
          summary: String(data.summary || ''),
          keyConcepts: Array.isArray(data.keyConcepts) ? data.keyConcepts : [],
          scientificTerms: Array.isArray(data.scientificTerms) ? data.scientificTerms : [],
          steps: Array.isArray(data.steps) ? data.steps : [],
          practicalExperiment: data.practicalExperiment || undefined,
          bemExamTips: data.bemExamTips || undefined,
          attachment: data.attachment || undefined,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// =================== EXERCISES ===================

export async function saveExerciseInFirestore(exercise: TeacherExercise): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(exercise.id, 'ex');
  const docPath = `exercises/${docId}`;
  const docRef = doc(db, 'exercises', docId);
  const safeDiff = ['easy', 'medium', 'hard'].includes(exercise.difficulty)
    ? exercise.difficulty
    : 'medium';

  const payload = {
    ownerUid: user.uid,
    title: String(exercise.title || 'تمرين تطبيقي').slice(0, 200),
    grade: sanitizeGrade(exercise.grade),
    domain: sanitizeDomain(exercise.domain),
    lessonId: String(exercise.lessonId || '').slice(0, 128),
    difficulty: safeDiff,
    statement: String(exercise.statement || '').slice(0, 5000),
    instructions: String(exercise.instructions || '').slice(0, 3000),
    solution: String(exercise.solution || '').slice(0, 5000),
    createdAtLabel: String(exercise.createdAt || new Date().toLocaleDateString('ar-DZ')).slice(0, 60),
  };

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }

  if (existing && existing.exists()) {
    try {
      const prevOwner = String(existing.data()?.ownerUid || user.uid);
      await updateDoc(docRef, { ...payload, ownerUid: prevOwner, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  } else {
    try {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  }
}

export async function deleteExerciseInFirestore(exerciseId: string): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(exerciseId, 'ex');
  const docPath = `exercises/${docId}`;
  try {
    await deleteDoc(doc(db, 'exercises', docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export function subscribeToExercises(
  onData: (exercises: TeacherExercise[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = 'exercises';
  const q = query(collection(db, path), where('grade', 'in', VALID_GRADES), limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: TeacherExercise[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title || ''),
          grade: sanitizeGrade(data.grade),
          domain: sanitizeDomain(data.domain),
          lessonId: data.lessonId || undefined,
          difficulty: (['easy', 'medium', 'hard'].includes(data.difficulty)
            ? data.difficulty
            : 'medium') as 'easy' | 'medium' | 'hard',
          statement: String(data.statement || ''),
          instructions: String(data.instructions || ''),
          solution: String(data.solution || ''),
          createdAt: String(data.createdAtLabel || ''),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// =================== VIDEOS ===================

export async function saveVideoInFirestore(video: VideoLesson): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(video.id, 'vid');
  const docPath = `videos/${docId}`;
  const docRef = doc(db, 'videos', docId);

  const payload = {
    ownerUid: user.uid,
    title: String(video.title || 'فيديو تعليمي').slice(0, 200),
    subtitle: String(video.subtitle || '').slice(0, 300),
    grade: sanitizeGrade(video.grade),
    domain: sanitizeDomain(video.domain),
    durationSeconds: Math.max(0, Math.min(36000, Math.round(Number(video.durationSeconds) || 60))),
    thumbnail: String(video.thumbnail || '').slice(0, 500),
    description: String(video.description || '').slice(0, 3000),
    learningOutcomes: Array.isArray(video.learningOutcomes)
      ? video.learningOutcomes.slice(0, 20).map((o) => String(o).slice(0, 300))
      : [],
    keyConcept: String(video.keyConcept || '').slice(0, 500),
    checkpoints: Array.isArray(video.checkpoints) ? video.checkpoints.slice(0, 30) : [],
    scenes: Array.isArray(video.scenes) ? video.scenes.slice(0, 30) : [],
  };

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }

  if (existing && existing.exists()) {
    try {
      const prevOwner = String(existing.data()?.ownerUid || user.uid);
      await updateDoc(docRef, { ...payload, ownerUid: prevOwner, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  } else {
    try {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  }
}

export async function deleteVideoInFirestore(videoId: string): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(videoId, 'vid');
  const docPath = `videos/${docId}`;
  try {
    await deleteDoc(doc(db, 'videos', docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export function subscribeToVideos(
  onData: (videos: VideoLesson[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = 'videos';
  const q = query(collection(db, path), where('durationSeconds', '>=', 0), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: VideoLesson[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title || ''),
          subtitle: String(data.subtitle || ''),
          grade: sanitizeGrade(data.grade),
          domain: sanitizeDomain(data.domain),
          durationSeconds: Number(data.durationSeconds) || 60,
          thumbnail: String(data.thumbnail || ''),
          description: String(data.description || ''),
          learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
          keyConcept: String(data.keyConcept || ''),
          checkpoints: Array.isArray(data.checkpoints) ? data.checkpoints : [],
          scenes: Array.isArray(data.scenes) ? data.scenes : [],
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// =================== CUSTOM TESTS / QUESTIONS ===================

export async function saveCustomTestInFirestore(test: AssessmentTest): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(test.id, 'test');
  const docPath = `custom_tests/${docId}`;
  const docRef = doc(db, 'custom_tests', docId);
  const trimester: 1 | 2 | 3 = test.trimester === 2 ? 2 : test.trimester === 3 ? 3 : 1;

  const payload = {
    ownerUid: user.uid,
    title: String(test.title || 'اختبار').slice(0, 200),
    subtitle: String(test.subtitle || '').slice(0, 300),
    grade: sanitizeGrade(test.grade),
    trimester,
    durationMinutes: Math.max(1, Math.min(240, Math.round(Number(test.durationMinutes) || 20))),
    totalScore: Math.max(1, Math.min(100, Math.round(Number(test.totalScore) || 20))),
    questions: Array.isArray(test.questions) ? test.questions.slice(0, 50) : [],
  };

  let existing;
  try {
    existing = await getDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }

  if (existing && existing.exists()) {
    try {
      const prevOwner = String(existing.data()?.ownerUid || user.uid);
      await updateDoc(docRef, { ...payload, ownerUid: prevOwner, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  } else {
    try {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  }
}

export function subscribeToCustomTests(
  onData: (tests: AssessmentTest[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = 'custom_tests';
  const q = query(collection(db, path), where('trimester', '>=', 1), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: AssessmentTest[] = snapshot.docs.map((d) => {
        const data = d.data();
        const tri: 1 | 2 | 3 = data.trimester === 2 ? 2 : data.trimester === 3 ? 3 : 1;
        return {
          id: d.id,
          title: String(data.title || ''),
          subtitle: String(data.subtitle || ''),
          grade: sanitizeGrade(data.grade),
          trimester: tri,
          durationMinutes: Number(data.durationMinutes) || 20,
          totalScore: Number(data.totalScore) || 20,
          questions: Array.isArray(data.questions) ? data.questions : [],
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// =================== RESOURCES ===================

export async function saveResourceInFirestore(res: EducationalResource): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(res.id, 'res');
  const docPath = `resources/${docId}`;
  const docRef = doc(db, 'resources', docId);
  const safeFormat = ['pptx', 'docx', 'xlsx', 'pdf'].includes(res.format) ? res.format : 'pptx';
  const validCategories: FileCategory[] = [
    'lesson_ppt',
    'summary_word',
    'calculation_excel',
    'exam_pdf',
  ];
  const safeCategory: FileCategory = validCategories.includes(res.fileCategory)
    ? res.fileCategory
    : 'lesson_ppt';

  const payload = {
    ownerUid: user.uid,
    title: String(res.title || 'مورد تعليمي').slice(0, 200),
    description: String(res.description || '').slice(0, 2000),
    format: safeFormat,
    fileCategory: safeCategory,
    grade: sanitizeGrade(res.grade),
    trimester: res.trimester === 2 ? 2 : res.trimester === 3 ? 3 : 1,
    author: String(res.author || 'أستاذ مساهم').slice(0, 80),
    authorRole: String(res.authorRole || '').slice(0, 100),
    fileSize: String(res.fileSize || '500 KB').slice(0, 40),
    downloadsCount: Math.max(0, Math.round(Number(res.downloadsCount) || 1)),
    uploadedDate: String(res.uploadedDate || new Date().toISOString().split('T')[0]).slice(0, 40),
    previewPoints: Array.isArray(res.previewPoints)
      ? res.previewPoints.slice(0, 15).map((p) => String(p).slice(0, 300))
      : [],
  };

  try {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}

export async function incrementResourceDownloadInFirestore(
  resourceId: string,
  nextCount: number
): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(resourceId, 'res');
  const docPath = `resources/${docId}`;
  try {
    await updateDoc(doc(db, 'resources', docId), {
      downloadsCount: Math.max(1, Math.round(nextCount)),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

export async function deleteResourceInFirestore(resourceId: string): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(resourceId, 'res');
  const docPath = `resources/${docId}`;
  try {
    await deleteDoc(doc(db, 'resources', docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export function subscribeToResources(
  onData: (resources: EducationalResource[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = 'resources';
  const q = query(collection(db, path), where('downloadsCount', '>=', 0), limit(150));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: EducationalResource[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title || ''),
          description: String(data.description || ''),
          format: data.format || 'pptx',
          fileCategory: data.fileCategory || 'lesson_ppt',
          grade: sanitizeGrade(data.grade),
          trimester: data.trimester === 2 ? 2 : data.trimester === 3 ? 3 : 1,
          author: String(data.author || ''),
          authorRole: String(data.authorRole || ''),
          fileSize: String(data.fileSize || ''),
          downloadsCount: Number(data.downloadsCount) || 0,
          uploadedDate: String(data.uploadedDate || ''),
          previewPoints: Array.isArray(data.previewPoints) ? data.previewPoints : [],
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// =================== FORUM TOPICS ===================

export async function saveForumTopicInFirestore(topic: ForumTopic): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(topic.id, 'topic');
  const docPath = `forum_topics/${docId}`;
  const docRef = doc(db, 'forum_topics', docId);
  const safeGrade = topic.grade === 'all' ? 'all' : sanitizeGrade(topic.grade);
  const safeRole = ['student', 'teacher', 'moderator'].includes(topic.authorRole)
    ? topic.authorRole
    : 'student';

  const payload = {
    ownerUid: user.uid,
    title: String(topic.title || 'موضوع').slice(0, 200),
    grade: safeGrade,
    domain: String(topic.domain || 'human_health').slice(0, 60),
    authorName: String(topic.authorName || 'تلميذ').slice(0, 60),
    authorRole: safeRole,
    content: String(topic.content || '').slice(0, 5000),
    createdAtLabel: String(topic.createdAt || 'الآن').slice(0, 60),
    views: Math.max(0, Math.round(Number(topic.views) || 1)),
    upvotes: Math.max(0, Math.round(Number(topic.upvotes) || 0)),
    isReported: Boolean(topic.isReported),
    attachments: Array.isArray(topic.attachments) ? topic.attachments.slice(0, 10) : [],
    replies: Array.isArray(topic.replies) ? topic.replies.slice(0, 100) : [],
    tags: Array.isArray(topic.tags)
      ? topic.tags.slice(0, 15).map((t) => String(t).slice(0, 60))
      : [],
  };

  try {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}

export async function updateForumTopicInFirestore(
  topicId: string,
  updates: Partial<Pick<ForumTopic, 'upvotes' | 'replies' | 'isReported' | 'views'>>
): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(topicId, 'topic');
  const docPath = `forum_topics/${docId}`;
  try {
    await updateDoc(doc(db, 'forum_topics', docId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

export function subscribeToForumTopics(
  onData: (topics: ForumTopic[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = 'forum_topics';
  const q = query(collection(db, path), where('upvotes', '>=', 0), limit(150));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ForumTopic[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title || ''),
          grade: data.grade === 'all' ? 'all' : sanitizeGrade(data.grade),
          domain: String(data.domain || 'human_health'),
          authorName: String(data.authorName || ''),
          authorRole: data.authorRole || 'student',
          content: String(data.content || ''),
          createdAt: String(data.createdAtLabel || 'الآن'),
          views: Number(data.views) || 1,
          upvotes: Number(data.upvotes) || 0,
          isReported: Boolean(data.isReported),
          attachments: Array.isArray(data.attachments) ? data.attachments : [],
          replies: Array.isArray(data.replies) ? data.replies : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

// =================== DIRECT TEACHER MESSAGES ===================

export async function saveDirectMessageInFirestore(msg: DirectTeacherMessage): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docId = sanitizeId(msg.id, 'msg');
  const docPath = `direct_messages/${docId}`;
  const payload = {
    ownerUid: user.uid,
    studentId: sanitizeId(msg.studentId || user.uid, 'st'),
    studentName: String(msg.studentName || 'تلميذ').slice(0, 60),
    studentGrade: sanitizeGrade(msg.studentGrade),
    topic: String(msg.topic || 'علوم عامة').slice(0, 150),
    questionText: String(msg.questionText || '').slice(0, 3000),
    status: 'pending' as const,
    createdAtLabel: String(msg.createdAt || 'الآن').slice(0, 60),
  };

  try {
    await setDoc(doc(db, 'direct_messages', docId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}

export async function replyDirectMessageInFirestore(
  messageId: string,
  replyText: string,
  teacherName: string
): Promise<void> {
  if (!auth.currentUser) return;
  const docId = sanitizeId(messageId, 'msg');
  const docPath = `direct_messages/${docId}`;
  try {
    await updateDoc(doc(db, 'direct_messages', docId), {
      status: 'answered',
      replyText: String(replyText || '').slice(0, 3000),
      teacherName: String(teacherName || 'الأستاذ المشرف').slice(0, 80),
      answeredAtLabel: 'الآن',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

export function subscribeToDirectMessages(
  onData: (messages: DirectTeacherMessage[]) => void,
  onError?: (err: Error) => void
): () => void {
  const user = auth.currentUser;
  if (!user) return () => {};
  const path = 'direct_messages';
  const q = isTeacherCloudAdmin(user.email)
    ? query(collection(db, path), limit(150))
    : query(collection(db, path), where('ownerUid', '==', user.uid), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: DirectTeacherMessage[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          studentId: String(data.studentId || ''),
          studentName: String(data.studentName || ''),
          studentGrade: sanitizeGrade(data.studentGrade),
          topic: String(data.topic || ''),
          questionText: String(data.questionText || ''),
          status: data.status === 'answered' ? 'answered' : 'pending',
          replyText: data.replyText || undefined,
          teacherName: data.teacherName || undefined,
          createdAt: String(data.createdAtLabel || 'الآن'),
          answeredAt: data.answeredAtLabel || undefined,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

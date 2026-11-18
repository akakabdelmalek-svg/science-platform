import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Lock, Plus, Trash2, Edit3, CheckCircle2, 
  BookOpen, Video, HelpCircle, User, MessageCircle, 
  BarChart3, Sparkles, X, Send, Eye, KeyRound, FileText, ArrowLeft,
  Upload, Download, FileSpreadsheet, Presentation, FileCode, Cloud
} from 'lucide-react';
import { LessonUnit, LessonAttachment, GradeLevel, ScienceDomain, TeacherExercise } from '../types/science';
import { AssessmentTest, AssessmentQuestion } from '../types/assessment';
import { VideoLesson } from '../data/videoData';
import { DirectTeacherMessage, StudentRanking, UserProfile } from '../types/user';
import { isTeacherCloudAdmin } from '../firebaseWebData';
import heroBiologyThumb from '../assets/images/science_hero_biology_1794414991383.jpg';

interface TeacherAdminDashboardProps {
  lessons: LessonUnit[];
  onAddLesson: (lesson: LessonUnit) => void;
  onDeleteLesson: (lessonId: string) => void;

  exercises: TeacherExercise[];
  onAddExercise: (exercise: TeacherExercise) => void;
  onDeleteExercise: (exerciseId: string) => void;

  tests: AssessmentTest[];
  onAddQuestion: (testId: string, question: AssessmentQuestion, fallbackGrade?: GradeLevel) => void;
  onDeleteQuestion: (testId: string, questionId: string) => void;

  videos: VideoLesson[];
  onAddVideo: (video: VideoLesson) => void;
  onDeleteVideo: (videoId: string) => void;

  directMessages: DirectTeacherMessage[];
  onReplyDirectMessage: (messageId: string, replyText: string, teacherName: string) => void;

  rankings: StudentRanking[];
  currentUser?: UserProfile | null;
  firebaseUser?: { uid: string; email?: string | null; displayName?: string | null } | null;
  firebaseSyncError?: string | null;
  onGoogleSignIn?: () => Promise<any> | void;
  initialSubtab?: 'lessons' | 'exercises' | 'videos' | 'questions_box' | 'student_levels';
  onNavigateToLessons?: (grade?: GradeLevel | 'all') => void;
  onNavigateToExercises?: (grade?: GradeLevel | 'all') => void;
}

export const TeacherAdminDashboard: React.FC<TeacherAdminDashboardProps> = ({
  lessons,
  onAddLesson,
  onDeleteLesson,
  exercises,
  onAddExercise,
  onDeleteExercise,
  tests,
  onAddQuestion,
  onDeleteQuestion,
  videos,
  onAddVideo,
  onDeleteVideo,
  directMessages,
  onReplyDirectMessage,
  rankings,
  currentUser,
  firebaseUser,
  firebaseSyncError,
  onGoogleSignIn,
  initialSubtab = 'lessons',
  onNavigateToLessons,
  onNavigateToExercises,
}) => {
  // Authentication state for teacher
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(currentUser?.role === 'teacher');
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Subtab
  const [activeTab, setActiveTab] = useState<'lessons' | 'exercises' | 'videos' | 'questions_box' | 'student_levels'>(initialSubtab);

  useEffect(() => {
    setActiveTab(initialSubtab);
  }, [initialSubtab]);

  // Modals
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<boolean>(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState<boolean>(false);

  // Inline Delete Confirm Key
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  // Last added notice for quick jump
  const [lastAddedLessonGrade, setLastAddedLessonGrade] = useState<GradeLevel | null>(null);
  const [lastAddedExerciseGrade, setLastAddedExerciseGrade] = useState<GradeLevel | null>(null);

  // Replying to a student question
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>(currentUser?.name || 'الأستاذ المشرف');

  // New Lesson Form
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [lessonSubtitle, setLessonSubtitle] = useState<string>('');
  const [lessonGrade, setLessonGrade] = useState<GradeLevel>('4AM');
  const [lessonDomain, setLessonDomain] = useState<ScienceDomain>('human_health');
  const [lessonDuration, setLessonDuration] = useState<number>(45);
  const [lessonSummary, setLessonSummary] = useState<string>('');
  const [lessonKeyConcept, setLessonKeyConcept] = useState<string>('');
  const [lessonAttachment, setLessonAttachment] = useState<LessonAttachment | null>(null);
  const [lessonFileError, setLessonFileError] = useState<string | null>(null);
  const [isReadingLessonFile, setIsReadingLessonFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New Applied Exercise Form
  const [exTitle, setExTitle] = useState<string>('');
  const [exGrade, setExGrade] = useState<GradeLevel>('4AM');
  const [exDomain, setExDomain] = useState<ScienceDomain>('human_health');
  const [exLessonId, setExLessonId] = useState<string>('');
  const [exDifficulty, setExDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [exStatement, setExStatement] = useState<string>('');
  const [exInstructions, setExInstructions] = useState<string>('');
  const [exSolution, setExSolution] = useState<string>('');

  // New Question Form
  const [questionGrade, setQuestionGrade] = useState<GradeLevel>('4AM');
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || '');
  const [questionPrompt, setQuestionPrompt] = useState<string>('');
  const [questionTopic, setQuestionTopic] = useState<string>('الهضم والإنزيمات');
  const [opt0, setOpt0] = useState<string>('');
  const [opt1, setOpt1] = useState<string>('');
  const [opt2, setOpt2] = useState<string>('');
  const [opt3, setOpt3] = useState<string>('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');
  const [competency, setCompetency] = useState<'recall' | 'reasoning' | 'document_analysis'>('recall');

  useEffect(() => {
    const matchingTest = tests.find((t) => t.grade === questionGrade);
    if (matchingTest) {
      setSelectedTestId(matchingTest.id);
    } else if (tests[0]) {
      setSelectedTestId(tests[0].id);
    }
  }, [questionGrade, tests]);

  // New Video Form
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoSubtitle, setVideoSubtitle] = useState<string>('');
  const [videoGrade, setVideoGrade] = useState<GradeLevel>('4AM');
  const [videoDesc, setVideoDesc] = useState<string>('');
  const [videoSceneText, setVideoSceneText] = useState<string>('');

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (txt: string) => {
    setToast(txt);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === '0542836997') {
      setIsAuthenticated(true);
      setAuthError(null);
      showToast('مرحباً بك أستاذي الكريم في لوحة التحكم والإدارة.');
    } else {
      setAuthError('رمز المرور غير صحيح. يرجى إدخال الرمز السري الخاص بالأستاذ.');
    }
  };

  // Process imported Word / Excel / PowerPoint / PDF file
  const processLessonFile = (file: File) => {
    setLessonFileError(null);
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setLessonFileError('حجم الملف يتجاوز 25 ميغابايت. يرجى اختيار ملف أصغر حجماً.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mime = (file.type || '').toLowerCase();
    let fileType: LessonAttachment['fileType'] = 'other';

    if (ext === 'docx' || ext === 'doc' || mime.includes('wordprocessingml') || mime === 'application/msword') {
      fileType = 'docx';
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || mime.includes('spreadsheetml') || mime.includes('ms-excel')) {
      fileType = 'xlsx';
    } else if (ext === 'pptx' || ext === 'ppt' || ext === 'ppsx' || mime.includes('presentationml') || mime.includes('ms-powerpoint')) {
      fileType = 'pptx';
    } else if (ext === 'pdf' || mime === 'application/pdf') {
      fileType = 'pdf';
    }

    if (fileType === 'other') {
      setLessonFileError('يرجى استيراد ملف بصيغة Word (.docx/.doc) أو Excel (.xlsx/.xls) أو PowerPoint (.pptx/.ppt) أو PDF.');
      return;
    }

    const sizeFormatted =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    setIsReadingLessonFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setIsReadingLessonFile(false);
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        setLessonFileError('تعذّر قراءة الملف المحدد. يرجى المحاولة مرة أخرى.');
        return;
      }
      setLessonAttachment({
        fileName: file.name,
        fileType,
        mimeType: file.type || 'application/octet-stream',
        fileSize: sizeFormatted,
        dataUrl,
      });
      if (!lessonTitle.trim()) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
        setLessonTitle(cleanTitle);
      }
    };
    reader.onerror = () => {
      setIsReadingLessonFile(false);
      setLessonFileError('حدث خطأ أثناء قراءة الملف.');
    };
    reader.readAsDataURL(file);
  };

  const handleLessonFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLessonFile(file);
    }
    e.target.value = '';
  };

  const handleLessonFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLessonFile(file);
    }
  };

  // Add Lesson Submit
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    if (!lessonSummary.trim() && !lessonAttachment) return;

    const effectiveSummary =
      lessonSummary.trim() ||
      `ملف درس مرفق بصيغة ${lessonAttachment?.fileType.toUpperCase()} (${lessonAttachment?.fileName}) جاهز للتحميل والمراجعة.`;

    const newLesson: LessonUnit = {
      id: `lesson-${Date.now()}`,
      grade: lessonGrade,
      domain: lessonDomain,
      title: lessonTitle.trim(),
      subtitle:
        lessonSubtitle.trim() ||
        (lessonAttachment
          ? `ملف درس مرفق (${lessonAttachment.fileType.toUpperCase()})`
          : 'درس مفاهيمي جديد مضاف من الأستاذ'),
      durationMinutes: lessonDuration,
      attachment: lessonAttachment || undefined,
      summary: effectiveSummary,
      keyConcepts: [
        lessonKeyConcept.trim() || 'مفهوم علمي أساسي مقرر في المنهاج',
      ],
      scientificTerms: [
        { ar: 'مصطلح علمي', fr: 'Terme scientifique', definition: 'تعريف علمي دقيق مطابق للمنهاج.' },
      ],
      steps: [
        {
          title: '1. المحطة الاستكشافية والملاحظة',
          description: effectiveSummary,
        },
      ],
    };

    onAddLesson(newLesson);
    setLastAddedLessonGrade(lessonGrade);
    setShowAddLessonModal(false);
    setLessonTitle('');
    setLessonSubtitle('');
    setLessonSummary('');
    setLessonKeyConcept('');
    setLessonAttachment(null);
    setLessonFileError(null);
    showToast('تمت إضافة الدرس الجديد بنجاح وسيظهر مباشرة في قسم الدروس!');
  };

  // Add Applied Exercise Submit
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exTitle.trim() || !exStatement.trim() || !exInstructions.trim()) return;

    const newExercise: TeacherExercise = {
      id: `ex-${Date.now()}`,
      title: exTitle.trim(),
      grade: exGrade,
      domain: exDomain,
      lessonId: exLessonId || undefined,
      difficulty: exDifficulty,
      statement: exStatement.trim(),
      instructions: exInstructions.trim(),
      solution: exSolution.trim() || 'سيتم مناقشة الحل النموذجي مع الأستاذ في الحصة.',
      createdAt: new Date().toLocaleDateString('ar-EG'),
    };

    onAddExercise(newExercise);
    setLastAddedExerciseGrade(exGrade);
    setShowAddExerciseModal(false);
    setExTitle('');
    setExLessonId('');
    setExStatement('');
    setExInstructions('');
    setExSolution('');
    showToast('تمت إضافة التمرين التطبيقي بنجاح إلى قسم التمارين والاختبارات!');
  };

  // Add Question Submit
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionPrompt.trim() || !opt0.trim() || !opt1.trim()) return;

    const targetTest =
      tests.find((t) => t.id === selectedTestId) ||
      tests.find((t) => t.grade === questionGrade) ||
      tests[0];

    const newQ: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      topic: questionTopic.trim() || 'موضوع علمي',
      domain: 'human_health',
      competency,
      prompt: questionPrompt.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim() || 'خيار ثالث', opt3.trim() || 'خيار رابع'],
      correctIndex,
      explanation: explanation.trim() || 'تفسير علمي منهجي يوضح سبب صحة الإجابة.',
      recommendedLessonId: 'lesson-4am-digestion',
      conceptName: questionTopic.trim() || 'مفهوم علمي',
    };

    onAddQuestion(targetTest?.id || `test-${questionGrade.toLowerCase()}`, newQ, questionGrade);
    setShowAddQuestionModal(false);
    setQuestionPrompt('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    showToast('تمت إضافة السؤال التفاعلي الجديد إلى بنك الاختبارات!');
  };

  // Add Video Submit
  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    const newVid: VideoLesson = {
      id: `vid-${Date.now()}`,
      title: videoTitle.trim(),
      subtitle: videoSubtitle.trim() || 'شرح مرئي تفاعلي',
      grade: videoGrade,
      domain: 'human_health',
      durationSeconds: 120,
      thumbnail: heroBiologyThumb,
      description: videoDesc.trim() || 'مقطع تعليمي مركز يشرح المفهوم خطوة بخطوة.',
      learningOutcomes: ['التحكم في المفهوم العلمي', 'التطبيق المخبري المباشر'],
      keyConcept: videoTitle.trim(),
      checkpoints: [
        {
          timeSeconds: 60,
          question: `سؤال فحص الفهم لدرس: ${videoTitle}`,
          options: ['إجابة صحيحة', 'إجابة خاطئة 1', 'إجابة خاطئة 2'],
          correctIndex: 0,
          explanation: 'تعليل علمي يوضح المفهوم المستهدف.',
        },
      ],
      scenes: [
        {
          title: 'المشهد 1: التمهيد العلمي',
          description: videoDesc.trim(),
          visualAction: 'رسم متحرك يوضح التفاعل البيولوجي.',
          subtitles: videoSceneText.trim() || 'نلاحظ سريان الظاهرة العلمية بالتفصيل.',
        },
      ],
    };

    onAddVideo(newVid);
    setShowAddVideoModal(false);
    setVideoTitle('');
    setVideoSubtitle('');
    setVideoDesc('');
    showToast('تمت إضافة الفيديو التفاعلي الجديد إلى المنصة!');
  };

  // Send Reply to Student
  const handleSendReply = (messageId: string) => {
    if (!replyContent.trim()) return;
    onReplyDirectMessage(messageId, replyContent.trim(), teacherName.trim());
    setReplyingMessageId(null);
    setReplyContent('');
    showToast('تم إرسال إجابتك الرسمية للتلميذ بنجاح!');
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            بوابة الإدارة التربوية للأستاذ فقط
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            منطقة مخصصة لأساتذة مادة علوم الطبيعة والحياة لإضافة وحذف الدروس والتمارين والفيديوهات، والرد على استفسارات التلاميذ في صندوق المراسلة.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 pt-2">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="password"
              placeholder="أدخل رمز مرور الأستاذ..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {authError && (
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            تسجيل الدخول إلى لوحة الأستاذ
          </button>
        </form>
      </div>
    );
  }

  // Pending questions count
  const pendingQuestionsCount = directMessages.filter((m) => m.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة التحكم والإدارة البيداغوجية للأستاذ · مساحة المعلم المعتمد</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              إدارة المحتوى التعليمي والتمارين ومتابعة التلاميذ
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              التحكم الكامل في دروس المنهاج، بنك الأسئلة والتمارين، الفيديوهات التفاعلية، والرد على أسئلة التلاميذ في صندوق المراسلة مع الاطلاع على تصنيفات النقاط.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              تسجيل الخروج من الإدارة
            </button>
          </div>
        </div>
      </div>

      {/* Firebase Web Data Sync Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isTeacherCloudAdmin(firebaseUser?.email)
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
          }`}>
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {isTeacherCloudAdmin(firebaseUser?.email)
                ? `قاعدة بيانات المنصة السحابية مفعلة (${firebaseUser?.email})`
                : firebaseUser
                ? `متصل بحساب (${firebaseUser.email || 'Google'}) — لحفظ دروس المنصة سحابياً استخدم حساب الأستاذ`
                : 'مزامنة قاعدة بيانات الويب (الدروس، التمارين، الفيديوهات، الأسئلة) عبر Firebase'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTeacherCloudAdmin(firebaseUser?.email)
                ? 'جميع الدروس والتمارين والردود تُحفظ مباشرة في Firestore لجميع التلاميذ.'
                : 'اربط حساب Google الأستاذ لمزامنة كل المحتوى والملفات على الويب دائماً.'}
            </div>
            {firebaseSyncError && (
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                {firebaseSyncError}
              </div>
            )}
          </div>
        </div>
        {onGoogleSignIn && !isTeacherCloudAdmin(firebaseUser?.email) && (
          <button
            type="button"
            onClick={() => onGoogleSignIn()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>ربط حساب الأستاذ السحابي</span>
          </button>
        )}
      </div>

      {/* Admin KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">إجمالي الدروس المسجلة</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {lessons.length} درس
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            عبر المستويات 1AM - 4AM
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">الفيديوهات التفاعلية</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {videos.length} مقطع
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            مع نقاط فحص الفهم
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">أسئلة صندوق الأستاذ</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {directMessages.length} رسالة
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
            {pendingQuestionsCount} بانتظار إجابتك
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">التلاميذ المصنفون</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {rankings.length} تلميذ
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            في سلم تصنيف النقاط
          </span>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'lessons'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>إدارة الدروس ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'exercises'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>إدارة التمارين والاختبارات</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'videos'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>إدارة الفيديوهات ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions_box')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'questions_box'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>صندوق أسئلة التلاميذ ({directMessages.length})</span>
          {pendingQuestionsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('student_levels')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'student_levels'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>مستويات ونقاط التلاميذ (Classment)</span>
        </button>
      </div>

      {/* ================= Tab 1: Manage Lessons ================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              قائمة الدروس والمفاهيم المقررة في المنهاج:
            </h3>
            <div className="flex items-center gap-2">
              {onNavigateToLessons && (
                <button
                  onClick={() => onNavigateToLessons('all')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>عرض الدروس في قسم الدروس</span>
                </button>
              )}
              <button
                onClick={() => setShowAddLessonModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة درس جديد</span>
              </button>
            </div>
          </div>

          {lastAddedLessonGrade && onNavigateToLessons && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                ✓ تم نشر الدرس بنجاح في مستوى {lastAddedLessonGrade}! يمكنك الآن معاينته في قسم الدروس.
              </span>
              <button
                onClick={() => onNavigateToLessons(lastAddedLessonGrade)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
              >
                <span>الذهاب إلى قسم الدروس</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {lessons.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              لا توجد دروس مضافة حالياً. اضغط على "إضافة درس جديد" لنشر أول درس وسيظهر مباشرة في قسم الدروس.
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const delKey = `lesson:${lesson.id}`;
                return (
                  <div
                    key={lesson.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {lesson.grade}
                        </span>
                        <span>·</span>
                        <span>{lesson.durationMinutes} دقيقة</span>
                        <span>·</span>
                        <span>{lesson.domain}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {lesson.summary}
                      </p>
                      {lesson.attachment && (
                        <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                          <FileText className="w-3 h-3" />
                          <span>ملف مرفق: {lesson.attachment.fileName} ({lesson.attachment.fileSize})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigateToLessons && (
                        <button
                          onClick={() => onNavigateToLessons(lesson.grade)}
                          className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة</span>
                        </button>
                      )}
                      {confirmDeleteKey === delKey ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteLesson(lesson.id);
                              setConfirmDeleteKey(null);
                              showToast(`تم حذف درس: ${lesson.title}`);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg cursor-pointer"
                          >
                            تأكيد الحذف
                          </button>
                          <button
                            onClick={() => setConfirmDeleteKey(null)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteKey(delKey)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                          title="حذف الدرس"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= Tab 2: Manage Exercises ================= */}
      {activeTab === 'exercises' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              إدارة التمارين التطبيقية وبنك الأسئلة التشخيصية:
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {onNavigateToExercises && (
                <button
                  onClick={() => onNavigateToExercises('all')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>عرض في قسم التمارين</span>
                </button>
              )}
              <button
                onClick={() => setShowAddExerciseModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة تمرين تطبيقي (مع الحل)</span>
              </button>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال اختبار (QCM)</span>
              </button>
            </div>
          </div>

          {lastAddedExerciseGrade && onNavigateToExercises && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-indigo-800 dark:text-indigo-300">
                ✓ تم نشر التمرين التطبيقي بنجاح لمستوى {lastAddedExerciseGrade}!
              </span>
              <button
                onClick={() => onNavigateToExercises(lastAddedExerciseGrade)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg cursor-pointer"
              >
                <span>عرض في التمارين والاختبارات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section A: Teacher Applied Exercises */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>التمارين التطبيقية المضافة ({exercises.length})</span>
            </h4>

            {exercises.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                لم يتم إضافة تمارين تطبيقية بعد. اضغط على "إضافة تمرين تطبيقي (مع الحل)" لإنشاء تمرين علمي للتلاميذ.
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex) => {
                  const delKey = `ex:${ex.id}`;
                  return (
                    <div
                      key={ex.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {ex.grade}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{ex.title}</span>
                        </div>
                        {confirmDeleteKey === delKey ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteExercise(ex.id);
                                setConfirmDeleteKey(null);
                                showToast('تم حذف التمرين بنجاح.');
                              }}
                              className="px-2 py-1 text-[11px] font-bold bg-rose-600 text-white rounded cursor-pointer"
                            >
                              تأكيد الحذف
                            </button>
                            <button
                              onClick={() => setConfirmDeleteKey(null)}
                              className="px-2 py-1 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteKey(delKey)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded transition-colors cursor-pointer"
                            title="حذف التمرين"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ex.statement}</p>
                      <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-2 rounded">
                        <strong>المطلوب: </strong>{ex.instructions}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: MCQ Diagnostic Questions */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>أسئلة الاختبارات التفاعلية (QCM)</span>
            </h4>
            <div className="space-y-3">
              {tests.flatMap((test) =>
                test.questions.map((q) => {
                  const delKey = `q:${test.id}:${q.id}`;
                  return (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          [{test.grade}] {q.topic}
                        </span>
                        {confirmDeleteKey === delKey ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteQuestion(test.id, q.id);
                                setConfirmDeleteKey(null);
                                showToast('تم حذف السؤال.');
                              }}
                              className="px-2 py-1 text-[11px] font-bold bg-rose-600 text-white rounded cursor-pointer"
                            >
                              تأكيد الحذف
                            </button>
                            <button
                              onClick={() => setConfirmDeleteKey(null)}
                              className="px-2 py-1 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteKey(delKey)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded transition-colors cursor-pointer"
                            title="حذف السؤال"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {q.prompt}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 text-slate-600 dark:text-slate-400">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded ${
                              oIdx === q.correctIndex
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-50 dark:bg-slate-800'
                            }`}
                          >
                            {oIdx + 1}. {opt} {oIdx === q.correctIndex && '✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= Tab 3: Manage Videos ================= */}
      {activeTab === 'videos' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              قائمة الفيديوهات والمقاطع التفاعلية:
            </h3>
            <button
              onClick={() => setShowAddVideoModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فيديو تعليمي جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {videos.map((vid) => {
              const delKey = `vid:${vid.id}`;
              return (
                <div
                  key={vid.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {vid.grade}
                      </span>
                      <span>·</span>
                      <span>{vid.durationSeconds} ثانية</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {vid.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {confirmDeleteKey === delKey ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteVideo(vid.id);
                            setConfirmDeleteKey(null);
                            showToast(`تم حذف الفيديو: ${vid.title}`);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg cursor-pointer"
                        >
                          تأكيد الحذف
                        </button>
                        <button
                          onClick={() => setConfirmDeleteKey(null)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteKey(delKey)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                        title="حذف الفيديو"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= Tab 4: Direct Student Question Box ================= */}
      {activeTab === 'questions_box' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              صندوق رسائل وتساؤلات التلاميذ المباشرة للأستاذ:
            </h3>
            <span className="text-xs text-slate-500">
              إجمالي الرسائل: {directMessages.length} (المعلقة: {pendingQuestionsCount})
            </span>
          </div>

          <div className="space-y-3">
            {directMessages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 space-y-3 shadow-sm ${
                  msg.status === 'pending'
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.studentName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {msg.studentGrade}
                    </span>
                    <span className="text-xs text-slate-400">· {msg.createdAt}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    msg.status === 'answered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {msg.status === 'answered' ? 'تم الرد' : 'بانتظار ردك كأستاذ'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    محور السؤال: {msg.topic}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {msg.questionText}
                  </p>
                </div>

                {/* Already Answered View */}
                {msg.status === 'answered' && msg.replyText && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      إجابتك السابقة المسجلة:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {msg.replyText}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {replyingMessageId === msg.id ? (
                  <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <textarea
                      rows={3}
                      placeholder="اكتب التوضيح العلمي المنهجي للتلميذ..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingMessageId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال الإجابة للتلميذ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setReplyingMessageId(msg.id);
                        setReplyContent(msg.replyText || '');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                    >
                      {msg.status === 'answered' ? 'تعديل الإجابة' : 'كتابة إجابة الأستاذ'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= Tab 5: Student Levels & Points ================= */}
      {activeTab === 'student_levels' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              لوحة متابعة مستويات ونقاط التلاميذ (Student Level Classments):
            </h3>
            <span className="text-xs text-slate-500">
              ترتيب ديناميكي لكافة الأقسام
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
              <span className="col-span-1">الرتبة</span>
              <span className="col-span-4">اسم التلميذ</span>
              <span className="col-span-2">المستوى</span>
              <span className="col-span-3">الشارة التقديرية</span>
              <span className="col-span-2 text-left">مجموع النقاط</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rankings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  لا يوجد تلاميذ مسجلون في التصنيف حالياً. سيتم عرض أسماء التلاميذ الأوائل فور تسجيلهم بالاسم الأول.
                </div>
              ) : (
                rankings.map((st, idx) => (
                  <div
                    key={st.id}
                    className="grid grid-cols-12 p-3.5 text-xs items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-right"
                  >
                    <span className="col-span-1 font-mono font-bold text-slate-500">
                      #{idx + 1}
                    </span>
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="text-lg">{st.avatar}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {st.firstName || st.name}
                      </span>
                    </div>
                    <span className="col-span-2 font-medium text-slate-600 dark:text-slate-400">
                      {st.grade}
                    </span>
                    <span className="col-span-3 text-amber-600 dark:text-amber-400 font-bold">
                      {st.badge}
                    </span>
                    <span className="col-span-2 text-left font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {st.points} نقطة
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>إضافة درس جديد للمنهاج</span>
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان الدرس:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الاستجابة المناعية الخلوية وتدخل الخلايا LT"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  وصف مختصر أو عنوان فرعي:
                </label>
                <input
                  type="text"
                  placeholder="مثال: دراسة آلية القضاء على الخلايا المصابة بالتماس المباشر"
                  value={lessonSubtitle}
                  onChange={(e) => setLessonSubtitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المستوى الدراسي:
                  </label>
                  <select
                    value={lessonGrade}
                    onChange={(e) => setLessonGrade(e.target.value as GradeLevel)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="4AM">4 متوسط (BEM)</option>
                    <option value="3AM">3 متوسط</option>
                    <option value="2AM">2 متوسط</option>
                    <option value="1AM">1 متوسط</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المجال العلمي:
                  </label>
                  <select
                    value={lessonDomain}
                    onChange={(e) => setLessonDomain(e.target.value as ScienceDomain)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="human_health">الإنسان والصحة</option>
                    <option value="neuro_immunity">الاتصال العصبي والمناعة</option>
                    <option value="earth_geology">الجيولوجيا والتكتونية</option>
                    <option value="plant_ecosystems">النبات والأنظمة البيئية</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المدة التقديرية (دقيقة):
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value) || 45)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  استيراد ملف الدرس (Word / Excel / PowerPoint / PDF):
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleLessonFileDrop}
                  className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 text-center space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.ppsx,.pdf"
                    onChange={handleLessonFileImport}
                    className="sr-only"
                  />
                  {lessonAttachment ? (
                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-right">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold text-white shrink-0 ${
                          lessonAttachment.fileType === 'pptx'
                            ? 'bg-orange-500'
                            : lessonAttachment.fileType === 'docx'
                            ? 'bg-blue-600'
                            : lessonAttachment.fileType === 'xlsx'
                            ? 'bg-emerald-600'
                            : 'bg-rose-600'
                        }`}>
                          {lessonAttachment.fileType.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {lessonAttachment.fileName}
                          </div>
                          <div className="text-[10px] text-slate-500">{lessonAttachment.fileSize}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLessonAttachment(null);
                          setLessonFileError(null);
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded cursor-pointer"
                        title="إزالة الملف"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full cursor-pointer flex flex-col items-center gap-1.5 py-2 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                    >
                      <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isReadingLessonFile
                          ? 'جارٍ قراءة وتجهيز الملف...'
                          : 'اضغط هنا أو اسحب ملف الدرس (.docx / .xlsx / .pptx / .pdf)'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        يدعم مستندات Word وجداول Excel وعروض PowerPoint حتى 25 MB
                      </span>
                    </button>
                  )}
                  {lessonFileError && (
                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      {lessonFileError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ملخص الدرس {lessonAttachment ? '(اختياري عند استيراد ملف)' : ''}:
                </label>
                <textarea
                  rows={3}
                  required={!lessonAttachment}
                  placeholder="الملخص العلمي المركّز للدرس..."
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  المفهوم العلمي الأساسي:
                </label>
                <input
                  type="text"
                  placeholder="مثال: تتدخل الخلايا LTc بإفراز البرفورين لإحداث صدمة حلولية..."
                  value={lessonKeyConcept}
                  onChange={(e) => setLessonKeyConcept(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className={`p-2.5 rounded-lg border text-[11px] flex flex-wrap items-center justify-between gap-2 ${
                isTeacherCloudAdmin(firebaseUser?.email)
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}>
                <span className="font-semibold">
                  {isTeacherCloudAdmin(firebaseUser?.email)
                    ? `✓ متصل بالسحابة (${firebaseUser?.email}) — سيظهر الدرس لجميع الحسابات والمتصفحات.`
                    : 'تنبيه: حساب الأستاذ السحابي غير مربوط حالياً؛ قد يُحفظ الدرس محلياً فقط حتى ربط Google.'}
                </span>
                {onGoogleSignIn && !isTeacherCloudAdmin(firebaseUser?.email) && (
                  <button
                    type="button"
                    onClick={() => onGoogleSignIn()}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold cursor-pointer"
                  >
                    ربط حساب الأستاذ
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isReadingLessonFile}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {isReadingLessonFile ? 'جارٍ تحميل الملف...' : 'نشر الدرس في المنهاج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Applied Exercise */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>إضافة تمرين تطبيقي جديد للتلاميذ</span>
              </h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان التمرين:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تمرين استرجاع المعارف حول الهضم الإنزيمي للنشا"
                  value={exTitle}
                  onChange={(e) => setExTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المستوى:
                  </label>
                  <select
                    value={exGrade}
                    onChange={(e) => setExGrade(e.target.value as GradeLevel)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="4AM">4 متوسط (BEM)</option>
                    <option value="3AM">3 متوسط</option>
                    <option value="2AM">2 متوسط</option>
                    <option value="1AM">1 متوسط</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المجال:
                  </label>
                  <select
                    value={exDomain}
                    onChange={(e) => setExDomain(e.target.value as ScienceDomain)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="human_health">الإنسان والصحة</option>
                    <option value="neuro_immunity">الاتصال العصبي والمناعة</option>
                    <option value="earth_geology">الجيولوجيا والتكتونية</option>
                    <option value="plant_ecosystems">النبات والأنظمة البيئية</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الصعوبة:
                  </label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">متقدم (وضعية إدماجية)</option>
                  </select>
                </div>
              </div>

              {lessons.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ربط التمرين بدرس محدد (اختياري):
                  </label>
                  <select
                    value={exLessonId}
                    onChange={(e) => setExLessonId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">عرض عام في مستوى {exGrade}</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.grade}] {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  نص التمرين والسند العلمي:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="أكتب السياق العلمي والتجربة أو المعطيات..."
                  value={exStatement}
                  onChange={(e) => setExStatement(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  التعليمات والأسئلة المطلوبة:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="1. حلل المنحنى... 2. فسر النتيجة... 3. استنتج..."
                  value={exInstructions}
                  onChange={(e) => setExInstructions(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  الحل النموذجي والتصحيح:
                </label>
                <textarea
                  rows={3}
                  placeholder="الإجابة النموذجية ليراجعها التلميذ بعد المحاولة..."
                  value={exSolution}
                  onChange={(e) => setExSolution(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className={`p-2.5 rounded-lg border text-[11px] flex flex-wrap items-center justify-between gap-2 ${
                isTeacherCloudAdmin(firebaseUser?.email)
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}>
                <span className="font-semibold">
                  {isTeacherCloudAdmin(firebaseUser?.email)
                    ? `✓ متصل بالسحابة (${firebaseUser?.email}) — سيظهر التمرين في كافة المتصفحات.`
                    : 'تنبيه: اربط حساب الأستاذ السحابي (Google) لمزامنة التمرين عبر جميع الأجهزة.'}
                </span>
                {onGoogleSignIn && !isTeacherCloudAdmin(firebaseUser?.email) && (
                  <button
                    type="button"
                    onClick={() => onGoogleSignIn()}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold cursor-pointer"
                  >
                    ربط حساب الأستاذ
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddExerciseModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  نشر التمرين التطبيقي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>إضافة سؤال/تمرين تفاعلي لبنك التقييم</span>
              </h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المستوى الدراسي:
                  </label>
                  <select
                    value={questionGrade}
                    onChange={(e) => setQuestionGrade(e.target.value as GradeLevel)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="4AM">4 متوسط (BEM)</option>
                    <option value="3AM">3 متوسط</option>
                    <option value="2AM">2 متوسط</option>
                    <option value="1AM">1 متوسط</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الاختبار المستهدف:
                  </label>
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.grade}] {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  نص السؤال:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="مثال: ما هو دور الإنزيم في عملية الهضم الكيميائي؟"
                  value={questionPrompt}
                  onChange={(e) => setQuestionPrompt(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المحور / الموضوع:
                  </label>
                  <input
                    type="text"
                    required
                    value={questionTopic}
                    onChange={(e) => setQuestionTopic(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الكفاءة المستهدفة:
                  </label>
                  <select
                    value={competency}
                    onChange={(e) => setCompetency(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="recall">استرجاع معارف</option>
                    <option value="reasoning">استدلال علمي</option>
                    <option value="document_analysis">استغلال وثائق وسندات</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  الخيارات (اختر الإجابة الصحيحة عبر الدائرة):
                </label>
                {[
                  { val: opt0, set: setOpt0, idx: 0 },
                  { val: opt1, set: setOpt1, idx: 1 },
                  { val: opt2, set: setOpt2, idx: 2 },
                  { val: opt3, set: setOpt3, idx: 3 },
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={correctIndex === item.idx}
                      onChange={() => setCorrectIndex(item.idx)}
                      className="accent-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder={`الخيار ${item.idx + 1}`}
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      className="flex-1 text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  التعليل والتفسير العلمي للإجابة النموذجية:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="شرح علمي يظهر في تقرير أداء التلميذ لتصحيح المفاهيم..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  إضافة السؤال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Video */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>إضافة فيديو تعليمي تفاعلي جديد</span>
              </h3>
              <button
                onClick={() => setShowAddVideoModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان الفيديو التفاعلي:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسار المغذيات عبر الطريقين الدموي واللمفاوي"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المستوى:
                  </label>
                  <select
                    value={videoGrade}
                    onChange={(e) => setVideoGrade(e.target.value as GradeLevel)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="4AM">4 متوسط (BEM)</option>
                    <option value="3AM">3 متوسط</option>
                    <option value="2AM">2 متوسط</option>
                    <option value="1AM">1 متوسط</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    العنوان الفرعي:
                  </label>
                  <input
                    type="text"
                    placeholder="شرح متحرك ثلاثي الأبعاد"
                    value={videoSubtitle}
                    onChange={(e) => setVideoSubtitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  وصف المقطع والظاهرة المشروحة:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="شرح ما يعرضه الفيديو..."
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  الترجمة والنص التزامني (Subtitles):
                </label>
                <input
                  type="text"
                  placeholder="العبارة الصوتية والنص المقروء..."
                  value={videoSceneText}
                  onChange={(e) => setVideoSceneText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  نشر الفيديو التفاعلي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

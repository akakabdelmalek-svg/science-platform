import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Plus, Trash2, Edit3, CheckCircle2, 
  BookOpen, Video, HelpCircle, User, MessageCircle, 
  BarChart3, Sparkles, X, Send, Eye, KeyRound 
} from 'lucide-react';
import { LessonUnit, GradeLevel, ScienceDomain } from '../types/science';
import { AssessmentTest, AssessmentQuestion } from '../types/assessment';
import { VideoLesson } from '../data/videoData';
import { DirectTeacherMessage, StudentRanking, UserProfile } from '../types/user';

interface TeacherAdminDashboardProps {
  lessons: LessonUnit[];
  onAddLesson: (lesson: LessonUnit) => void;
  onDeleteLesson: (lessonId: string) => void;

  tests: AssessmentTest[];
  onAddQuestion: (testId: string, question: AssessmentQuestion) => void;
  onDeleteQuestion: (testId: string, questionId: string) => void;

  videos: VideoLesson[];
  onAddVideo: (video: VideoLesson) => void;
  onDeleteVideo: (videoId: string) => void;

  directMessages: DirectTeacherMessage[];
  onReplyDirectMessage: (messageId: string, replyText: string, teacherName: string) => void;

  rankings: StudentRanking[];
  currentUser?: UserProfile | null;
}

export const TeacherAdminDashboard: React.FC<TeacherAdminDashboardProps> = ({
  lessons,
  onAddLesson,
  onDeleteLesson,
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
}) => {
  // Authentication state for teacher
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(currentUser?.role === 'teacher');
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Subtab
  const [activeTab, setActiveTab] = useState<'lessons' | 'exercises' | 'videos' | 'questions_box' | 'student_levels'>('lessons');

  // Modals
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState<boolean>(false);

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

  // New Question Form
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
    if (cleanPass === '0542836997' || cleanPass === 'prof2026' || cleanPass === 'admin') {
      setIsAuthenticated(true);
      setAuthError(null);
      showToast('مرحباً بك أستاذي الكريم في لوحة التحكم والإدارة.');
    } else {
      setAuthError('رمز المرور غير صحيح. يرجى إدخال الرمز السري للأستاذ (0542836997).');
    }
  };

  // Add Lesson Submit
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonSummary.trim()) return;

    const newLesson: LessonUnit = {
      id: `lesson-${Date.now()}`,
      grade: lessonGrade,
      domain: lessonDomain,
      title: lessonTitle.trim(),
      subtitle: lessonSubtitle.trim() || 'درس مفاهيمي جديد مضاف من الأستاذ',
      durationMinutes: lessonDuration,
      summary: lessonSummary.trim(),
      keyConcepts: [
        lessonKeyConcept.trim() || 'مفهوم علمي أساسي مقرر في المنهاج',
      ],
      scientificTerms: [
        { ar: 'مصطلح علمي', fr: 'Terme scientifique', definition: 'تعريف علمي دقيق مطابق للمنهاج.' },
      ],
      steps: [
        {
          title: '1. المحطة الاستكشافية والملاحظة',
          description: lessonSummary.trim(),
        },
      ],
    };

    onAddLesson(newLesson);
    setShowAddLessonModal(false);
    setLessonTitle('');
    setLessonSummary('');
    setLessonKeyConcept('');
    showToast('تمت إضافة الدرس الجديد بنجاح إلى منصة العلوم!');
  };

  // Add Question Submit
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionPrompt.trim() || !opt0.trim() || !opt1.trim()) return;

    const newQ: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      topic: questionTopic,
      domain: 'human_health',
      competency,
      prompt: questionPrompt.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim() || 'خيار إضافي', opt3.trim() || 'خيار إضافي'],
      correctIndex,
      explanation: explanation.trim() || 'تفسير علمي منهجي يوضح سبب صحة الإجابة.',
      recommendedLessonId: 'lesson-4am-digestion',
      conceptName: questionTopic,
    };

    onAddQuestion(selectedTestId, newQ);
    setShowAddQuestionModal(false);
    setQuestionPrompt('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    showToast('تمت إضافة السؤال والتمرين الجديد إلى بنك الاختبارات!');
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
      thumbnail: '/src/assets/images/science_hero_biology_1794414991383.jpg',
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

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setIsAuthenticated(true);
              showToast('تم الدخول كأستاذ المادة.');
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            دخول فوري مباشر (كأستاذ المادة للمعاينة التجريبية)
          </button>
        </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              قائمة الدروس والمفاهيم المقررة في المنهاج:
            </h3>
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة درس جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson) => (
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
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف درس: "${lesson.title}"؟`)) {
                        onDeleteLesson(lesson.id);
                        showToast(`تم حذف درس: ${lesson.title}`);
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                    title="حذف الدرس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= Tab 2: Manage Exercises ================= */}
      {activeTab === 'exercises' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              إدارة بنك التمارين والأسئلة التشخيصية:
            </h3>
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال/تمرين جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {tests.flatMap((test) =>
              test.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      [{test.grade}] {q.topic}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
                          onDeleteQuestion(test.id, q.id);
                          showToast('تم حذف السؤال.');
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded transition-colors cursor-pointer"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              ))
            )}
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
            {videos.map((vid) => (
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
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف مقطع: "${vid.title}"؟`)) {
                        onDeleteVideo(vid.id);
                        showToast(`تم حذف الفيديو: ${vid.title}`);
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                    title="حذف الفيديو"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
              {rankings.map((st, idx) => (
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
                      {st.name}
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
              ))}
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
                  ملخص الدرس:
                </label>
                <textarea
                  rows={3}
                  required
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  نشر الدرس في المنهاج
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
                <span>إضافة سؤال/تمرين جديد لبنك التقييم</span>
              </h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
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

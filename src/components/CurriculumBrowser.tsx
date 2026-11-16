import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, ChevronDown, ChevronUp, CheckCircle2, 
  Lightbulb, ArrowLeft, Bookmark, Sparkles, Plus, Trash2, HelpCircle, Eye,
  Download, FileText, FileSpreadsheet, Presentation, FileCode
} from 'lucide-react';
import { GradeLevel, LessonUnit, LessonAttachment, TeacherExercise } from '../types/science';
import { GRADES_DATA, LESSONS_DATA } from '../data/curriculumData';
import { getLessonFile, triggerDataUrlDownload } from '../utils/fileStorage';

interface CurriculumBrowserProps {
  onOpenLab?: (labType: string) => void;
  selectedGradeProp?: GradeLevel | 'all';
  lessons?: LessonUnit[];
  exercises?: TeacherExercise[];
  onOpenAddLesson?: () => void;
  onDeleteLesson?: (lessonId: string) => void;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  onOpenLab,
  selectedGradeProp = 'all',
  lessons,
  exercises = [],
  onOpenAddLesson,
  onDeleteLesson,
}) => {
  const [activeGrade, setActiveGrade] = useState<GradeLevel | 'all'>(selectedGradeProp);
  const [selectedLesson, setSelectedLesson] = useState<LessonUnit | null>(null);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [revealedExerciseIds, setRevealedExerciseIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveGrade(selectedGradeProp);
    setSelectedLesson(null);
  }, [selectedGradeProp]);

  const allLessons = lessons !== undefined ? lessons : LESSONS_DATA;
  const filteredLessons =
    activeGrade === 'all'
      ? allLessons
      : allLessons.filter((l) => l.grade === activeGrade);

  const currentGradeInfo =
    activeGrade === 'all'
      ? {
          id: 'all',
          name: 'جميع مستويات الطور المتوسط (1AM - 4AM)',
          tagline: 'استعراض كافة الدروس المضافة من طرف أستاذ المادة عبر جميع السنوات',
        }
      : GRADES_DATA.find((g) => g.id === activeGrade) || GRADES_DATA[3];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSolution = (exId: string) => {
    setRevealedExerciseIds((prev) =>
      prev.includes(exId) ? prev.filter((id) => id !== exId) : [...prev, exId]
    );
  };

  const getAttachmentMeta = (fileType: LessonAttachment['fileType']) => {
    switch (fileType) {
      case 'pptx':
        return { label: 'PowerPoint', color: 'bg-orange-500 text-white', Icon: Presentation };
      case 'docx':
        return { label: 'Word', color: 'bg-blue-600 text-white', Icon: FileText };
      case 'xlsx':
        return { label: 'Excel', color: 'bg-emerald-600 text-white', Icon: FileSpreadsheet };
      case 'pdf':
        return { label: 'PDF', color: 'bg-rose-600 text-white', Icon: FileCode };
      default:
        return { label: 'ملف مرفق', color: 'bg-slate-700 text-white', Icon: FileText };
    }
  };

  const handleDownloadAttachment = async (lessonId: string, attachment: LessonAttachment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let dataUrl = attachment.dataUrl;
    if (!dataUrl) {
      dataUrl = (await getLessonFile(lessonId)) || '';
    }
    if (!dataUrl) return;
    triggerDataUrlDownload(dataUrl, attachment.fileName, attachment.mimeType);
  };

  const lessonRelatedExercises = selectedLesson
    ? exercises.filter(
        (ex) => ex.lessonId === selectedLesson.id || (!ex.lessonId && ex.grade === selectedLesson.grade)
      )
    : [];

  return (
    <div id="lessons-div" className="space-y-6">
      {/* Grade Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => {
              setActiveGrade('all');
              setSelectedLesson(null);
            }}
            className={`p-3 rounded-xl text-right transition-all cursor-pointer flex flex-col justify-between ${
              activeGrade === 'all'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">جميع المستويات</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 dark:bg-white/20 dark:text-white">
                الكل
              </span>
            </div>
            <span className="text-[11px] opacity-80 mt-1">
              {allLessons.length} {allLessons.length === 1 ? 'درس مضاف' : 'دروس مضافة'}
            </span>
          </button>

          {GRADES_DATA.map((grade) => {
            const isSelected = grade.id === activeGrade;
            const gradeCount = allLessons.filter((l) => l.grade === grade.id).length;
            return (
              <button
                key={grade.id}
                onClick={() => {
                  setActiveGrade(grade.id);
                  setSelectedLesson(null);
                }}
                className={`p-3 rounded-xl text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{grade.name}</span>
                  {grade.isBemYear && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                      BEM
                    </span>
                  )}
                </div>
                <span className="text-[11px] opacity-80 mt-1 line-clamp-1">
                  {gradeCount} {gradeCount === 1 ? 'درس' : 'دروس'} متوفرة
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Description Banner */}
      <div className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            قسم الدروس · {currentGradeInfo.name}:
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {currentGradeInfo.tagline} ({filteredLessons.length} دروس متوفرة)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAddLesson && (
            <button
              onClick={onOpenAddLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              title="إضافة درس جديد من لوحة الأستاذ"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة درس جديد</span>
            </button>
          )}
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden md:inline">
            مطابق للمنهاج الجزائري الرسمي
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedLesson ? (
        /* Detailed Lesson Viewer */
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
            >
              <span>← العودة لقائمة الدروس</span>
            </button>

            <button
              onClick={(e) => toggleBookmark(selectedLesson.id, e)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 flex items-center gap-1 cursor-pointer"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  bookmarkedLessons.includes(selectedLesson.id)
                    ? 'fill-amber-400 text-amber-500'
                    : ''
                }`}
              />
              <span>{bookmarkedLessons.includes(selectedLesson.id) ? 'محفوظ في مفضلتي' : 'حفظ الدرس'}</span>
            </button>
          </div>

          {/* Lesson Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              {selectedLesson.image && (
                <div className="md:w-1/3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                  <img
                    src={selectedLesson.image}
                    alt={selectedLesson.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedLesson.grade}
                  </span>
                  <span>·</span>
                  <span>مدة التعلم التقديرية: {selectedLesson.durationMinutes} دقيقة</span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {selectedLesson.title}
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedLesson.summary}
                </p>

                {/* Key Concepts */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                    المفاهيم الأساسية المقررة:
                  </span>
                  <div className="space-y-1.5">
                    {selectedLesson.keyConcepts.map((kc, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{kc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attached Lesson File (Word / Excel / PowerPoint / PDF) */}
                {selectedLesson.attachment && (() => {
                  const meta = getAttachmentMeta(selectedLesson.attachment.fileType);
                  const IconComponent = meta.Icon;
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 ${meta.color}`}>
                          <IconComponent className="w-4 h-4" />
                          <span>{meta.label}</span>
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedLesson.attachment.fileName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ملف الدرس المرفق من الأستاذ · الحجم: {selectedLesson.attachment.fileSize}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadAttachment(selectedLesson.id, selectedLesson.attachment!)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل ملف الدرس</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Scientific Terms Glossary */}
          {selectedLesson.scientificTerms && selectedLesson.scientificTerms.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>المصطلحات العلمية الدقيقة (Français & Arabe):</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedLesson.scientificTerms.map((term, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {term.ar}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {term.fr}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Breakdown */}
          {selectedLesson.steps && selectedLesson.steps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                التفاصيل العلمية والمحطات التجريبية:
              </h3>

              <div className="space-y-3">
                {selectedLesson.steps.map((step, idx) => {
                  const isExpanded = expandedStepIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                        className="w-full text-right p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                      >
                        <span>{step.title}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 space-y-3 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <p className="leading-relaxed">{step.description}</p>

                          {step.observation && (
                            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                              <strong>الملاحظة والتجربة: </strong> {step.observation}
                            </div>
                          )}

                          {step.interpretation && (
                            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50">
                              <strong>التفسير العلمي: </strong> {step.interpretation}
                            </div>
                          )}

                          {step.conclusion && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                              <strong>الاستنتاج: </strong> {step.conclusion}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Teacher Exercises */}
          {lessonRelatedExercises.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>تمارين تطبيقية مرفقة بهذا الدرس ({lessonRelatedExercises.length}):</span>
              </h3>

              <div className="space-y-3">
                {lessonRelatedExercises.map((ex) => {
                  const isRevealed = revealedExerciseIds.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ex.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {ex.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {ex.statement}
                      </p>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line">
                        <strong>المطلوب: </strong>{ex.instructions}
                      </div>

                      <button
                        onClick={() => toggleSolution(ex.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRevealed ? 'إخفاء الحل النموذجي' : 'عرض الحل النموذجي والتصحيح'}</span>
                      </button>

                      {isRevealed && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 whitespace-pre-line leading-relaxed">
                          <strong>الإجابة النموذجية:</strong>
                          <div className="mt-1">{ex.solution}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BEM Exam Tips Callout */}
          {selectedLesson.bemExamTips && (
            <div className="p-5 rounded-2xl bg-gradient-to-l from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 border border-indigo-200 dark:border-indigo-800/60">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>إرشادات منهجية خاصة بامتحانات شهادة التعليم المتوسط (BEM):</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                {selectedLesson.bemExamTips}
              </p>
            </div>
          )}

          {onOpenLab && (
            <div className="flex justify-end">
              <button
                onClick={() => onOpenLab('amylase')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                فتح المختبر التفاعلي التطبيقي
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Lessons Grid for active grade */
        filteredLessons.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              لا توجد دروس مضافة حالياً في {currentGradeInfo.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              يمكن لأستاذ المادة إضافة الدروس المقررة والمفاهيم الأساسية من خلال لوحة إدارة الأستاذ (🔒) بالرمز السري 0542836997، وستظهر هنا مباشرة في قسم الدروس.
            </p>
            {activeGrade !== 'all' && allLessons.length > 0 && (
              <button
                onClick={() => setActiveGrade('all')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <span>عرض كل الدروس المضافة ({allLessons.length})</span>
              </button>
            )}
            {onOpenAddLesson && (
              <button
                onClick={onOpenAddLesson}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة درس جديد الآن</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-emerald-500 transition-all cursor-pointer shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {lesson.grade}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lesson.durationMinutes} دقيقة</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {lesson.subtitle || lesson.summary}
                  </p>

                  {lesson.attachment && (() => {
                    const meta = getAttachmentMeta(lesson.attachment.fileType);
                    const IconComponent = meta.Icon;
                    return (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 ${meta.color}`}>
                            <IconComponent className="w-3 h-3" />
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {lesson.attachment.fileName}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDownloadAttachment(lesson.id, lesson.attachment!, e)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg shrink-0 cursor-pointer"
                          title="تحميل ملف الدرس"
                        >
                          <Download className="w-3 h-3" />
                          <span>تحميل</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 flex items-center gap-1">
                    <span>تصفح الدرس والمصطلحات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {onDeleteLesson && (
                      confirmDeleteId === lesson.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteLesson(lesson.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded cursor-pointer"
                          >
                            تأكيد الحذف
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(lesson.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="حذف هذا الدرس"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                    <button
                      onClick={(e) => toggleBookmark(lesson.id, e)}
                      className="p-1 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                      title="حفظ في المفضلة"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          bookmarkedLessons.includes(lesson.id)
                            ? 'fill-amber-400 text-amber-500'
                            : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

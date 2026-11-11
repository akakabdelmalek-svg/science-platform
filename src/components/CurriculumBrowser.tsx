import React, { useState } from 'react';
import { 
  BookOpen, Clock, ChevronDown, ChevronUp, CheckCircle2, 
  Lightbulb, HelpCircle, ArrowLeft, Bookmark, Sparkles, FileText
} from 'lucide-react';
import { GradeLevel, LessonUnit } from '../types/science';
import { GRADES_DATA, LESSONS_DATA } from '../data/curriculumData';

interface CurriculumBrowserProps {
  onOpenLab?: (labType: string) => void;
  selectedGradeProp?: GradeLevel;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  onOpenLab,
  selectedGradeProp = '4AM',
}) => {
  const [activeGrade, setActiveGrade] = useState<GradeLevel>(selectedGradeProp);
  const [selectedLesson, setSelectedLesson] = useState<LessonUnit | null>(null);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);

  const filteredLessons = LESSONS_DATA.filter((l) => l.grade === activeGrade);
  const currentGradeInfo = GRADES_DATA.find((g) => g.id === activeGrade) || GRADES_DATA[3];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Grade Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GRADES_DATA.map((grade) => {
            const isSelected = grade.id === activeGrade;
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
                <span className="text-[11px] opacity-75 mt-1 line-clamp-1">
                  {grade.unitsCount} وحدات مفاهيمية
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Description Banner */}
      <div className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            برنامج {currentGradeInfo.name}:
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {currentGradeInfo.tagline}
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          مطابق للمنهاج الجزائري الرسمي
        </span>
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
              <span>← العودة لقائمة دروس {currentGradeInfo.name}</span>
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
              {/* Optional Lesson Diagram Image */}
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

                {/* Key Concepts Pills */}
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
              </div>
            </div>
          </div>

          {/* Scientific Terms Glossary for this lesson */}
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

          {/* Step-by-Step Breakdown */}
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
        </div>
      ) : (
        /* Lessons Grid for active grade */
        filteredLessons.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              لا توجد دروس مضافة حالياً في هذا المستوى
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              يمكن لأستاذ المادة إضافة الدروس المقررة وتفاصيلها من خلال لوحة إدارة الأستاذ (🔒) بالرمز السري 0542836997.
            </p>
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
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
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
                    {lesson.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 flex items-center gap-1">
                    <span>تصفح الدرس والمصطلحات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => toggleBookmark(lesson.id, e)}
                    className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
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
            ))}
          </div>
        )
      )}
    </div>
  );
};

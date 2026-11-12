import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle2, XCircle, AlertCircle, TrendingUp, BookOpen, 
  RotateCcw, Clock, ArrowRight, ArrowLeft, Printer, Sparkles, Filter, 
  BarChart3, Compass, Check
} from 'lucide-react';
import { AssessmentTest, AssessmentReport, AssessmentQuestion } from '../types/assessment';
import { COMPREHENSIVE_TESTS } from '../data/assessmentData';
import { GradeLevel } from '../types/science';

interface AssessmentEngineProps {
  onNavigateToLesson?: (lessonId: string) => void;
  onNavigateToLab?: (labId: string) => void;
  tests?: AssessmentTest[];
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({
  onNavigateToLesson,
  onNavigateToLab,
  tests = COMPREHENSIVE_TESTS,
}) => {
  const currentTests = tests && tests.length > 0 ? tests : COMPREHENSIVE_TESTS;
  const [selectedTest, setSelectedTest] = useState<AssessmentTest>(currentTests[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(1800);
  const [assessmentReport, setAssessmentReport] = useState<AssessmentReport | null>(null);
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'all'>('all');

  // Countdown timer when test is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTestActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestActive, secondsLeft]);

  const startTest = (test: AssessmentTest) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSecondsLeft(test.durationMinutes * 60);
    setIsTestActive(true);
    setAssessmentReport(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = () => {
    setIsTestActive(false);

    // Calculate score
    const questions = selectedTest.questions;
    let correctCount = 0;
    const answersSummary: AssessmentReport['answersSummary'] = [];

    const competencyMap: Record<
      string,
      { correct: number; total: number; name: string }
    > = {
      recall: { correct: 0, total: 0, name: 'استرجاع وضبط المعارف والمصطلحات' },
      reasoning: { correct: 0, total: 0, name: 'الاستدلال والتفسير والتعليل العلمي' },
      document_analysis: { correct: 0, total: 0, name: 'استغلال وقراءة السندات والوثائق' },
    };

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: AssessmentReport['recommendations'] = [];

    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      const isCorrect = userAnswer === q.correctIndex;

      if (isCorrect) correctCount++;

      // Competency tally
      competencyMap[q.competency].total += 1;
      if (isCorrect) {
        competencyMap[q.competency].correct += 1;
        if (!strengths.includes(q.topic)) {
          strengths.push(q.topic);
        }
      } else {
        if (!weaknesses.includes(q.topic)) {
          weaknesses.push(q.topic);
        }
        recommendations.push({
          title: `مراجعة محور: ${q.conceptName}`,
          advice: `أظهرت إجابتك حاجة لتدعيم مفهوم (${q.topic}). يوصى بإعادة قراءة الدرس وتطبيق التجربة المخبرية الخاصة بها.`,
          targetLessonId: q.recommendedLessonId,
          targetLabId: q.recommendedLabId,
          priority: 'high',
        });
      }

      answersSummary.push({
        questionId: q.id,
        questionText: q.prompt,
        userAnswerIndex: userAnswer !== undefined ? userAnswer : -1,
        correctAnswerIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        conceptName: q.conceptName,
      });
    });

    const scoreOutOf20 = Math.round((correctCount / questions.length) * 20 * 10) / 10;
    const percentage = Math.round((correctCount / questions.length) * 100);

    let appreciation = 'ممتاز ومتمكن جداً من كفاءات المنهاج';
    if (scoreOutOf20 < 10) appreciation = 'بحاجة إلى تكثيف المراجعة واستدراك المفاهيم الأساسية';
    else if (scoreOutOf20 < 14) appreciation = 'مستوى متوسط - يمكنك التحسن بالتركيز على منهجية الإجابة';
    else if (scoreOutOf20 < 17) appreciation = 'مستوى جيد جداً - ركز على تدقيق التعليلات العلمية';

    const competencyScores = Object.entries(competencyMap).map(([key, val]) => ({
      competency: key as any,
      competencyName: val.name,
      score: val.correct,
      total: val.total,
      percentage: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
    }));

    const report: AssessmentReport = {
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      grade: selectedTest.grade,
      score: scoreOutOf20,
      totalPoints: 20,
      percentage,
      gradeAppreciation: appreciation,
      date: new Date().toLocaleDateString('ar-EG'),
      timeSpentSeconds: selectedTest.durationMinutes * 60 - secondsLeft,
      competencyScores,
      strengths: strengths.length > 0 ? strengths : ['بداية جيدة في مسار التعلم'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['لا توجد نواقص ملحوظة'],
      recommendations,
      answersSummary,
    };

    setAssessmentReport(report);
  };

  const currentQ = selectedTest.questions[currentQuestionIndex];
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filtered tests
  const filteredTests = currentTests.filter(
    (t) => filterGrade === 'all' || t.grade === filterGrade
  );

  return (
    <div className="space-y-6">
      {/* Test Active View */}
      {isTestActive ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedTest.title}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                السؤال {currentQuestionIndex + 1} من {selectedTest.questions.length}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>الوقت المتبقي: {formatTime(secondsLeft)}</span>
              </div>

              <button
                onClick={handleSubmitTest}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                إنهاء الاختبار الآن
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / selectedTest.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Box */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                المحور: {currentQ.topic}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                الكفاءة المستهدفة: {
                  currentQ.competency === 'recall'
                    ? 'استرجاع معارف'
                    : currentQ.competency === 'reasoning'
                    ? 'استدلال علمي'
                    : 'استغلال سندات'
                }
              </span>
            </div>

            <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.prompt}
            </h4>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentQ.id] === oIdx;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(currentQ.id, oIdx)}
                    className={`w-full text-right p-4 rounded-xl text-xs md:text-sm font-medium border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mr-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            {currentQuestionIndex < selectedTest.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <span>السؤال التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسليم الاختبار وعرض التقرير</span>
              </button>
            )}
          </div>
        </div>
      ) : assessmentReport ? (
        /* Performance Diagnostic Report View */
        <div className="space-y-6">
          {/* Diagnostic Top Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  <span>كشف التقييم والتشخيص الفردي</span>
                  <span>·</span>
                  <span>تاريخ الإنجاز: {assessmentReport.date}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                  تقرير أداء الطالب: {assessmentReport.testTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  التقدير العام: <strong className="text-slate-800 dark:text-slate-200">{assessmentReport.gradeAppreciation}</strong>
                </p>
              </div>

              {/* Score Display Card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center min-w-[160px]">
                <span className="text-xs text-slate-400 font-semibold">العلامة المستحقة</span>
                <div className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 my-1 font-mono">
                  {assessmentReport.score} <span className="text-sm font-normal text-slate-400">/ 20</span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  نسبة النجاح: {assessmentReport.percentage}%
                </span>
              </div>
            </div>

            {/* Competency Mastery Grid */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>نسبة التحكم حسب الكفاءات المنهجية لمادة العلوم:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {assessmentReport.competencyScores.map((c) => (
                  <div
                    key={c.competency}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.competencyName}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {c.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      أجاب صحة: {c.score} من {c.total} أسئلة
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>نقاط القوة والمفاهيم المتقنة:</span>
                </h4>
                <ul className="text-xs text-emerald-800/90 dark:text-emerald-200/90 space-y-1 list-disc list-inside">
                  {assessmentReport.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>نقاط الضعف التي تحتاج إلى تدعيم:</span>
                </h4>
                <ul className="text-xs text-rose-800/90 dark:text-rose-200/90 space-y-1 list-disc list-inside">
                  {assessmentReport.weaknesses.map((wk, idx) => (
                    <li key={idx}>{wk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Targeted Improvement Recommendations */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>اقتراحات وخطة المراجعة الذكية للتحسين:</span>
              </h4>

              <div className="space-y-2.5">
                {assessmentReport.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-indigo-950 dark:text-indigo-300">
                        {rec.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {rec.advice}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rec.targetLessonId && onNavigateToLesson && (
                        <button
                          onClick={() => onNavigateToLesson(rec.targetLessonId!)}
                          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          مراجعة الدرس
                        </button>
                      )}
                      {rec.targetLabId && onNavigateToLab && (
                        <button
                          onClick={() => onNavigateToLab(rec.targetLabId!)}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          فتح التجربة المخبرية
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => startTest(selectedTest)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة في الاختبار</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة كشف التقييم</span>
              </button>
            </div>
          </div>

          {/* Question Breakdown Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              مراجعة وتفسير جميع الأسئلة والإجابة النموذجية ({assessmentReport.answersSummary.length}):
            </h4>

            <div className="space-y-3">
              {assessmentReport.answersSummary.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className={`p-4 rounded-xl border text-right space-y-1.5 ${
                    ans.isCorrect
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      السؤال {idx + 1}: {ans.conceptName}
                    </span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        ans.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {ans.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{ans.isCorrect ? 'إجابة صحيحة' : 'إجابة غير دقيقة'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {ans.questionText}
                  </p>

                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700 leading-relaxed">
                    <strong>التعليل والتفسير العلمي: </strong> {ans.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Test Catalog Grid */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                بنك الاختبارات والتقييمات التشخيصية
              </h3>
              <p className="text-xs text-slate-500">
                اختر الاختبار المناسب لمستواك لبدء التقييم واستلام تقرير التشخيص واقتراحات التحسين
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['all', '4AM', '3AM', '2AM', '1AM'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setFilterGrade(grade)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    filterGrade === grade
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {grade === 'all' ? 'الكل' : grade}
                </button>
              ))}
            </div>
          </div>

          {/* Test Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {test.grade === '4AM' ? '4 متوسط (BEM)' : `${test.grade.replace('AM', '')} متوسط`}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{test.durationMinutes} دقيقة</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {test.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {test.subtitle}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span>عدد الأسئلة: <strong>{test.questions.length}</strong></span>
                    <span>·</span>
                    <span>العلامة الإجمالية: <strong>20/20</strong></span>
                    <span>·</span>
                    <span>تقرير فوري واقتراحات</span>
                  </div>
                </div>

                <button
                  onClick={() => startTest(test)}
                  className="w-full mt-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>بدء الاختبار والتقييم</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

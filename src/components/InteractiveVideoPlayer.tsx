import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Award, BookOpen, Clock, ChevronRight, HelpCircle } from 'lucide-react';
import { VIDEO_LESSONS, VideoLesson, VideoCheckpoint } from '../data/videoData';

interface InteractiveVideoPlayerProps {
  videos?: VideoLesson[];
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({
  videos = VIDEO_LESSONS,
}) => {
  const currentVideos = videos && videos.length > 0 ? videos : VIDEO_LESSONS;
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson>(currentVideos[0]);

  useEffect(() => {
    if (videos && videos.length > 0) {
      if (!videos.some((v) => v.id === selectedLesson?.id)) {
        setSelectedLesson(videos[0]);
      }
    }
  }, [videos]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [answeredFeedback, setAnsweredFeedback] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !activeCheckpoint) {
      timer = setTimeout(() => {
        if (currentSceneIndex < selectedLesson.scenes.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1);

          // Trigger checkpoint on middle scene
          if (currentSceneIndex === 0 && selectedLesson.checkpoints[0]) {
            setIsPlaying(false);
            setActiveCheckpoint(selectedLesson.checkpoints[0]);
            setUserAnswer(null);
            setAnsweredFeedback(false);
          }
        } else {
          setIsPlaying(false);
          if (!completedLessons.includes(selectedLesson.id)) {
            setCompletedLessons((prev) => [...prev, selectedLesson.id]);
          }
        }
      }, 4500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex, activeCheckpoint, selectedLesson, completedLessons]);

  const handleSelectLesson = (lesson: VideoLesson) => {
    setSelectedLesson(lesson);
    setCurrentSceneIndex(0);
    setIsPlaying(false);
    setActiveCheckpoint(null);
    setUserAnswer(null);
    setAnsweredFeedback(false);
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    setUserAnswer(optionIndex);
    setAnsweredFeedback(true);
  };

  const resumeVideoAfterCheckpoint = () => {
    setActiveCheckpoint(null);
    setUserAnswer(null);
    setAnsweredFeedback(false);
    setIsPlaying(true);
  };

  const currentScene = selectedLesson.scenes[currentSceneIndex] || selectedLesson.scenes[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-emerald-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-2">
            <span>مكتبة الدروس المرئية التفاعلية (Micro-learning)</span>
            <span>·</span>
            <span>فيديوهات علمية مركزة ومحاكاة</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            شروحات مرئية تفاعلية لمفاهيم علوم الطبيعة والحياة
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
            مقاطع فيديو قصيرة تفكك المفاهيم المعقدة (الإنزيمات، المنعكسات الشوكية، تكتونية الصفائح) خطوة بخطوة مع أسئلة فحص الفهم المباشرة أثناء المشاهدة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Video Player Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
            {/* Stage Screen */}
            <div className="relative aspect-video bg-gradient-to-b from-slate-900 to-black flex flex-col justify-between p-6">
              {/* Top Bar on Video */}
              <div className="flex items-center justify-between text-xs text-slate-300 z-10">
                <span className="font-semibold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-slate-800">
                  {selectedLesson.title}
                </span>
                <span className="font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  المشهد {currentSceneIndex + 1} من {selectedLesson.scenes.length}
                </span>
              </div>

              {/* Dynamic Visual Content */}
              {activeCheckpoint ? (
                <div className="bg-slate-900/95 backdrop-blur-md p-6 rounded-xl border border-indigo-500/50 max-w-lg mx-auto z-20 animate-fade-in text-right">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>نقطة فحص الفهم التفاعلية:</span>
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-white mb-4">
                    {activeCheckpoint.question}
                  </h4>

                  <div className="space-y-2">
                    {activeCheckpoint.options.map((opt, oIdx) => {
                      const isChosen = userAnswer === oIdx;
                      const isCorrect = oIdx === activeCheckpoint.correctIndex;
                      let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';

                      if (answeredFeedback) {
                        if (isCorrect) btnStyle = 'bg-emerald-600 text-white border-emerald-500';
                        else if (isChosen) btnStyle = 'bg-rose-600 text-white border-rose-500';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={answeredFeedback}
                          onClick={() => handleAnswerSubmit(oIdx)}
                          className={`w-full text-right p-3 rounded-lg text-xs md:text-sm font-medium border transition-all cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {answeredFeedback && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        <strong>التفسير العلمي: </strong> {activeCheckpoint.explanation}
                      </p>
                      <button
                        onClick={resumeVideoAfterCheckpoint}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        متابعة مشاهدة الدرس المرئي
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center my-auto px-4 z-10 animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {currentScene.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    {currentScene.visualAction}
                  </p>
                </div>
              )}

              {/* Live Subtitles Bar */}
              <div className="bg-black/75 backdrop-blur-sm p-3 rounded-lg border border-slate-800 text-xs md:text-sm text-center text-amber-200 font-medium z-10">
                "{currentScene.subtitles}"
              </div>
            </div>

            {/* Video Controls & Progress */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setCurrentSceneIndex(0);
                    setIsPlaying(true);
                    setActiveCheckpoint(null);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="إعادة التشغيل من البداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {isPlaying ? 'جارٍ التشغيل التفاعلي...' : 'متوقف مؤقتاً'}
                </span>
              </div>

              {/* Scene Stepper */}
              <div className="flex items-center gap-1.5">
                {selectedLesson.scenes.map((_, sIdx) => (
                  <button
                    key={`scene-${sIdx}`}
                    onClick={() => {
                      setCurrentSceneIndex(sIdx);
                      setActiveCheckpoint(null);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      sIdx === currentSceneIndex
                        ? 'w-8 bg-emerald-500'
                        : sIdx < currentSceneIndex
                        ? 'w-4 bg-emerald-700'
                        : 'w-4 bg-slate-700'
                    }`}
                    title={`المشهد ${sIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Details & Learning Outcomes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              الأهداف والمخرجات التعليمية لهذا المقطع:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedLesson.learningOutcomes.map((out, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{out}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>الفكرة الأساسية: {selectedLesson.keyConcept}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {completedLessons.includes(selectedLesson.id) ? '✓ تم إكمال الدرس' : 'غير مكتمل'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Playlist (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white px-1 flex items-center justify-between">
            <span>قائمة الفيديوهات القصيرة ({currentVideos.length}):</span>
            <span className="text-xs text-slate-500 font-normal">مدة المقطع: 2 دقيقة</span>
          </h3>

          <div className="space-y-2.5">
            {currentVideos.map((lesson) => {
              const isSelected = lesson.id === selectedLesson.id;
              const isCompleted = completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right flex flex-col gap-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {lesson.grade} · {lesson.durationSeconds} ثانية
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                        {lesson.title}
                      </h4>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {lesson.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { TopNavbar, ActiveNavTab } from './components/TopNavbar';
import { CurriculumBrowser } from './components/CurriculumBrowser';
import { InteractiveLabsHub } from './components/InteractiveLabsHub';
import { InteractiveVideoPlayer } from './components/InteractiveVideoPlayer';
import { AssessmentEngine } from './components/AssessmentEngine';
import { ForumSection } from './components/ForumSection';
import { ResourceHub } from './components/ResourceHub';
import { BemMethodologyGuide } from './components/BemMethodologyGuide';
import { GlossaryView } from './components/GlossaryView';
import { LeaderboardView } from './components/LeaderboardView';
import { DirectTeacherQuestionBox } from './components/DirectTeacherQuestionBox';
import { TeacherAdminDashboard } from './components/TeacherAdminDashboard';
import { AuthModal } from './components/AuthModal';

import { LESSONS_DATA } from './data/curriculumData';
import { COMPREHENSIVE_TESTS } from './data/assessmentData';
import { VIDEO_LESSONS, VideoLesson } from './data/videoData';
import { INITIAL_RANKINGS, INITIAL_DIRECT_MESSAGES } from './data/rankingsData';
import { LessonUnit, GradeLevel, TeacherExercise } from './types/science';
import { AssessmentTest, AssessmentQuestion } from './types/assessment';
import { UserProfile, StudentRanking, DirectTeacherMessage } from './types/user';

function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('curriculum');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [targetLabId, setTargetLabId] = useState<string>('amylase');
  const [methodologySubtab, setMethodologySubtab] = useState<'guide' | 'glossary'>('guide');
  const [curriculumSelectedGrade, setCurriculumSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [adminInitialSubtab, setAdminInitialSubtab] = useState<'lessons' | 'exercises' | 'videos' | 'questions_box' | 'student_levels'>('lessons');

  // Dynamic State managed by Teacher Admin
  const [lessons, setLessons] = useState<LessonUnit[]>(() =>
    safeJsonParse<LessonUnit[]>('science_platform_lessons', [])
  );

  const [exercises, setExercises] = useState<TeacherExercise[]>(() =>
    safeJsonParse<TeacherExercise[]>('science_platform_exercises', [])
  );

  const [tests, setTests] = useState<AssessmentTest[]>(() =>
    safeJsonParse<AssessmentTest[]>('science_platform_tests', COMPREHENSIVE_TESTS)
  );

  const [videos, setVideos] = useState<VideoLesson[]>(() =>
    safeJsonParse<VideoLesson[]>('science_platform_videos', VIDEO_LESSONS)
  );

  const [rankings, setRankings] = useState<StudentRanking[]>(() =>
    safeJsonParse<StudentRanking[]>('science_platform_rankings', [])
  );

  const [directMessages, setDirectMessages] = useState<DirectTeacherMessage[]>(() =>
    safeJsonParse<DirectTeacherMessage[]>('science_platform_direct_messages', [])
  );

  // User Profile - Obligatory on entry
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    safeJsonParse<UserProfile | null>('science_platform_user', null)
  );

  // If no user account is set, modal is obligatorily open
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(!currentUser);

  // Check if first-time visitor: open modal if no profile
  useEffect(() => {
    const hasVisited = localStorage.getItem('science_platform_has_visited');
    if (!hasVisited && !currentUser) {
      setIsAuthModalOpen(true);
      localStorage.setItem('science_platform_has_visited', 'true');
    }
  }, [currentUser]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('science_platform_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('science_platform_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('science_platform_tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('science_platform_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('science_platform_rankings', JSON.stringify(rankings));
  }, [rankings]);

  useEffect(() => {
    localStorage.setItem('science_platform_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('science_platform_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Handle Theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleNavigateToLesson = (_lessonId: string) => {
    setActiveTab('curriculum');
  };

  const handleNavigateToLab = (labId: string) => {
    setTargetLabId(labId);
    setActiveTab('labs');
  };

  const handleNavigateToLessons = (grade: GradeLevel | 'all' = 'all') => {
    setCurriculumSelectedGrade(grade);
    setActiveTab('curriculum');
  };

  const handleNavigateToExercises = () => {
    setActiveTab('assessments');
  };

  // Sync with Server on mount
  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((serverLessons) => {
        if (Array.isArray(serverLessons) && serverLessons.length > 0) {
          setLessons((prev) => {
            const merged = [...serverLessons];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Server lessons sync:', err));

    fetch('/api/exercises')
      .then((res) => res.json())
      .then((serverExercises) => {
        if (Array.isArray(serverExercises) && serverExercises.length > 0) {
          setExercises((prev) => {
            const merged = [...serverExercises];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Server exercises sync:', err));

    fetch('/api/videos')
      .then((res) => res.json())
      .then((serverVideos) => {
        if (Array.isArray(serverVideos) && serverVideos.length > 0) {
          setVideos((prev) => {
            const merged = [...serverVideos];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Server videos sync:', err));

    fetch('/api/rankings')
      .then((res) => res.json())
      .then((serverRankings) => {
        if (Array.isArray(serverRankings) && serverRankings.length > 0) {
          setRankings((prev) => {
            const merged = [...serverRankings];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Server rankings sync:', err));
  }, []);

  // Lesson Management (Teacher Admin)
  const handleAddLesson = (newLesson: LessonUnit) => {
    setLessons((prev) => [newLesson, ...prev]);
    fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson),
    }).catch((err) => console.error('Failed to sync lesson to server:', err));
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Failed to delete lesson on server:', err));
  };

  // Applied Exercise Management (Teacher Admin)
  const handleAddExercise = (newExercise: TeacherExercise) => {
    setExercises((prev) => [newExercise, ...prev]);
    fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise),
    }).catch((err) => console.error('Failed to sync exercise to server:', err));
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    fetch(`/api/exercises/${exerciseId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Failed to delete exercise on server:', err));
  };

  // Question Management (Teacher Admin)
  const handleAddQuestion = (testId: string, newQ: AssessmentQuestion, fallbackGrade: GradeLevel = '4AM') => {
    setTests((prev) => {
      const exists = prev.some((t) => t.id === testId);
      if (exists) {
        return prev.map((t) => (t.id === testId ? { ...t, questions: [newQ, ...t.questions] } : t));
      }
      const createdTest: AssessmentTest = {
        id: testId || `test-${fallbackGrade.toLowerCase()}-${Date.now()}`,
        title: `اختبار وتمارين ${fallbackGrade}`,
        subtitle: 'أسئلة وتمارين مضافة من أستاذ المادة',
        grade: fallbackGrade,
        trimester: 1,
        durationMinutes: 20,
        totalScore: 20,
        questions: [newQ],
      };
      return [createdTest, ...prev];
    });
  };

  const handleDeleteQuestion = (testId: string, questionId: string) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === testId ? { ...t, questions: t.questions.filter((q) => q.id !== questionId) } : t
      )
    );
  };

  // Video Management (Teacher Admin)
  const handleAddVideo = (newVideo: VideoLesson) => {
    setVideos((prev) => [newVideo, ...prev]);
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVideo),
    }).catch((err) => console.error('Failed to sync video to server:', err));
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    fetch(`/api/videos/${videoId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Failed to delete video on server:', err));
  };

  // Direct Teacher Question Box
  const handleSendMessageToTeacher = (newMsg: DirectTeacherMessage) => {
    setDirectMessages((prev) => [newMsg, ...prev]);
    // Award 20 points for asking a thoughtful scientific question
    if (currentUser) {
      setCurrentUser((prev) => prev ? { ...prev, points: prev.points + 20 } : null);
    }
  };

  const handleReplyDirectMessage = (messageId: string, replyText: string, teacherName: string) => {
    setDirectMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: 'answered',
              replyText,
              teacherName,
              answeredAt: 'الآن',
            }
          : m
      )
    );
  };

  // Profile Save
  const handleSaveProfile = (profile: UserProfile) => {
    setCurrentUser(profile);
    // Add to rankings if student
    if (profile.role === 'student') {
      const studentFirst = profile.firstName || profile.name || 'تلميذ';
      const newRankEntry: StudentRanking = {
        id: profile.id,
        firstName: studentFirst,
        name: studentFirst,
        grade: profile.grade || '4AM',
        points: profile.points,
        avatar: profile.avatar,
        rank: rankings.length + 1,
        badge: 'تلميذ مجتهد ⭐',
        testsCompleted: profile.testsCompleted,
      };
      setRankings((prev) => {
        const exists = prev.some((r) => r.id === profile.id || r.firstName === studentFirst);
        if (!exists) {
          return [...prev, newRankEntry];
        }
        return prev;
      });
      fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRankEntry),
      }).catch((err) => console.warn('Rankings sync:', err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        userName={currentUser?.name || 'إنشاء حساب'}
        userAvatar={currentUser?.avatar || '👨‍🎓'}
        userPoints={currentUser?.points || 150}
        onOpenProfile={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {activeTab === 'curriculum' && (
          <CurriculumBrowser
            selectedGradeProp={curriculumSelectedGrade}
            lessons={lessons}
            exercises={exercises}
            onOpenLab={handleNavigateToLab}
            onOpenAddLesson={() => {
              setAdminInitialSubtab('lessons');
              setActiveTab('admin');
            }}
            onDeleteLesson={handleDeleteLesson}
          />
        )}

        {activeTab === 'labs' && (
          <InteractiveLabsHub initialLab={targetLabId} />
        )}

        {activeTab === 'videos' && (
          <InteractiveVideoPlayer videos={videos} />
        )}

        {activeTab === 'assessments' && (
          <AssessmentEngine
            tests={tests}
            exercises={exercises}
            onOpenAddExercise={() => {
              setAdminInitialSubtab('exercises');
              setActiveTab('admin');
            }}
            onNavigateToLesson={handleNavigateToLesson}
            onNavigateToLab={handleNavigateToLab}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView currentUser={currentUser} rankings={rankings} />
        )}

        {activeTab === 'teacher_box' && (
          <DirectTeacherQuestionBox
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            messages={directMessages}
            onSendMessage={handleSendMessageToTeacher}
          />
        )}

        {activeTab === 'forum' && (
          <ForumSection />
        )}

        {activeTab === 'resources' && (
          <ResourceHub />
        )}

        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
              <button
                onClick={() => setMethodologySubtab('guide')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  methodologySubtab === 'guide'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                دليل منهجية BEM والأفعال السلوكية
              </button>
              <button
                onClick={() => setMethodologySubtab('glossary')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  methodologySubtab === 'glossary'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                المعجم والمصطلحات العلمية (عربي / فرنسي)
              </button>
            </div>

            {methodologySubtab === 'guide' ? (
              <BemMethodologyGuide />
            ) : (
              <GlossaryView />
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <TeacherAdminDashboard
            lessons={lessons}
            onAddLesson={handleAddLesson}
            onDeleteLesson={handleDeleteLesson}
            exercises={exercises}
            onAddExercise={handleAddExercise}
            onDeleteExercise={handleDeleteExercise}
            tests={tests}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            videos={videos}
            onAddVideo={handleAddVideo}
            onDeleteVideo={handleDeleteVideo}
            directMessages={directMessages}
            onReplyDirectMessage={handleReplyDirectMessage}
            rankings={rankings}
            currentUser={currentUser}
            initialSubtab={adminInitialSubtab}
            onNavigateToLessons={handleNavigateToLessons}
            onNavigateToExercises={handleNavigateToExercises}
          />
        )}
      </main>

      {/* Account / Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        currentProfile={currentUser}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">منصة علوم الطبيعة والحياة</span>
            <span>·</span>
            <span>الطور المتوسط (1AM, 2AM, 3AM, 4AM BEM)</span>
            <span>·</span>
            <span>لوحة الأستاذ المعتمدة برمز المرور (0542836997)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="hover:text-amber-500 transition-colors cursor-pointer"
            >
              ترتيب الأوائل والنقاط
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('teacher_box')}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              صندوق التساؤلات مع الأستاذ
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-emerald-500 font-bold transition-colors cursor-pointer"
            >
              فضاء إدارة الأستاذ 🔒
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

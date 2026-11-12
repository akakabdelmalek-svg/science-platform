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
import { LessonUnit } from './types/science';
import { AssessmentTest, AssessmentQuestion } from './types/assessment';
import { UserProfile, StudentRanking, DirectTeacherMessage } from './types/user';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('curriculum');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [targetLabId, setTargetLabId] = useState<string>('amylase');
  const [methodologySubtab, setMethodologySubtab] = useState<'guide' | 'glossary'>('guide');

  // Dynamic State managed by Teacher Admin (Clean slate: all lessons and accounts deleted)
  const [lessons, setLessons] = useState<LessonUnit[]>(() => {
    const saved = localStorage.getItem('science_platform_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const [tests, setTests] = useState<AssessmentTest[]>(() => {
    const saved = localStorage.getItem('science_platform_tests');
    return saved ? JSON.parse(saved) : COMPREHENSIVE_TESTS;
  });

  const [videos, setVideos] = useState<VideoLesson[]>(() => {
    const saved = localStorage.getItem('science_platform_videos');
    return saved ? JSON.parse(saved) : VIDEO_LESSONS;
  });

  const [rankings, setRankings] = useState<StudentRanking[]>(() => {
    const saved = localStorage.getItem('science_platform_rankings');
    return saved ? JSON.parse(saved) : [];
  });

  const [directMessages, setDirectMessages] = useState<DirectTeacherMessage[]>(() => {
    const saved = localStorage.getItem('science_platform_direct_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // User Profile - Obligatory on entry
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('science_platform_user');
    return saved ? JSON.parse(saved) : null;
  });

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
    localStorage.setItem('science_platform_tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('science_platform_videos', JSON.stringify(videos));
  }, [videos]);

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

  // Question Management (Teacher Admin)
  const handleAddQuestion = (testId: string, newQ: AssessmentQuestion) => {
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, questions: [newQ, ...t.questions] } : t))
    );
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
      setRankings((prev) => {
        const studentFirst = profile.firstName || profile.name || 'تلميذ';
        const exists = prev.some((r) => r.id === profile.id || r.firstName === studentFirst);
        if (!exists) {
          return [
            ...prev,
            {
              id: profile.id,
              firstName: studentFirst,
              name: studentFirst,
              grade: profile.grade || '4AM',
              points: profile.points,
              avatar: profile.avatar,
              rank: prev.length + 1,
              badge: 'تلميذ مجتهد ⭐',
              testsCompleted: profile.testsCompleted,
            },
          ];
        }
        return prev;
      });
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
            lessons={lessons}
            onOpenLab={handleNavigateToLab}
            onOpenAddLesson={() => setActiveTab('admin')}
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
            onNavigateToLesson={handleNavigateToLesson}
            onNavigateToLab={handleNavigateToLab}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView currentUser={currentUser} />
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

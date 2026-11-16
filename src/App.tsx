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
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { LessonUnit, GradeLevel, TeacherExercise } from './types/science';
import { AssessmentTest, AssessmentQuestion } from './types/assessment';
import { UserProfile, StudentRanking, DirectTeacherMessage } from './types/user';
import { saveLessonFile, getLessonFile, deleteLessonFile } from './utils/fileStorage';
import {
  auth,
  signInWithGoogle,
  signOutFirebase,
  upsertStudentRankingInFirestore,
  subscribeToClassmentRankings,
} from './firebase';

async function fetchJsonSafe(url: string): Promise<any[] | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

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

  // Firebase Auth & Classment state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);
  const [firebaseSyncError, setFirebaseSyncError] = useState<string | null>(null);

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

  // Save changes to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('science_platform_lessons', JSON.stringify(lessons));
    } catch {
      try {
        const lightweight = lessons.map((l) =>
          l.attachment ? { ...l, attachment: { ...l.attachment, dataUrl: '' } } : l
        );
        localStorage.setItem('science_platform_lessons', JSON.stringify(lightweight));
      } catch {
        // Ignore quota limits; server memory keeps full attachments
      }
    }
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem('science_platform_exercises', JSON.stringify(exercises));
    } catch {}
  }, [exercises]);

  useEffect(() => {
    try {
      localStorage.setItem('science_platform_tests', JSON.stringify(tests));
    } catch {}
  }, [tests]);

  useEffect(() => {
    try {
      localStorage.setItem('science_platform_videos', JSON.stringify(videos));
    } catch {}
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem('science_platform_rankings', JSON.stringify(rankings));
    } catch {}
  }, [rankings]);

  useEffect(() => {
    try {
      localStorage.setItem('science_platform_direct_messages', JSON.stringify(directMessages));
    } catch {}
  }, [directMessages]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('science_platform_user', JSON.stringify(currentUser));
      } catch {}
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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setIsFirebaseReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firebase Firestore live classment rankings when authenticated
  useEffect(() => {
    if (!isFirebaseReady || !firebaseUser) return;

    const unsubscribe = subscribeToClassmentRankings(
      (cloudRankings) => {
        setFirebaseSyncError(null);
        setRankings((prev) => {
          const merged = [...cloudRankings];
          prev.forEach((localItem) => {
            const exists = merged.some(
              (m) =>
                m.id === localItem.id ||
                (m.firstName === localItem.firstName && m.grade === localItem.grade)
            );
            if (!exists) {
              merged.push(localItem);
            }
          });
          return merged
            .sort((a, b) => b.points - a.points)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));
        });
      },
      (err) => {
        if (err.message.includes('Quota exceeded')) {
          setFirebaseSyncError('تم تجاوز الحصة اليومية لـ Firebase، سيتم استعادة المزامنة غداً.');
        } else {
          setFirebaseSyncError('تعذرت مزامنة الترتيب عبر Firebase، تحقق من الاتصال أو الصلاحيات.');
        }
      }
    );

    return () => unsubscribe();
  }, [isFirebaseReady, firebaseUser]);

  // Sync student points updates automatically to Firebase Firestore
  useEffect(() => {
    if (!isFirebaseReady || !firebaseUser || !currentUser || currentUser.role !== 'student') {
      return;
    }
    upsertStudentRankingInFirestore({
      firstName: currentUser.firstName || currentUser.name || 'تلميذ',
      grade: currentUser.grade || '4AM',
      points: currentUser.points,
      avatar: currentUser.avatar,
      badge: 'تلميذ مجتهد ⭐',
      testsCompleted: currentUser.testsCompleted,
    }).catch((err) => {
      console.warn('Firebase classment sync:', err);
    });
  }, [isFirebaseReady, firebaseUser, currentUser?.points, currentUser?.testsCompleted, currentUser?.firstName, currentUser?.grade, currentUser?.avatar]);

  const handleGoogleSignIn = async (): Promise<FirebaseUser | null> => {
    try {
      setFirebaseSyncError(null);
      const user = await signInWithGoogle();
      if (currentUser && currentUser.role === 'student') {
        await upsertStudentRankingInFirestore({
          firstName: currentUser.firstName || currentUser.name || 'تلميذ',
          grade: currentUser.grade || '4AM',
          points: currentUser.points,
          avatar: currentUser.avatar,
          badge: 'تلميذ مجتهد ⭐',
          testsCompleted: currentUser.testsCompleted,
        });
      }
      return user;
    } catch (err) {
      setFirebaseSyncError('تعذر تسجيل الدخول عبر Google. تأكد من السماح بالنوافذ المنبثقة.');
      return null;
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutFirebase();
    } catch {}
  };

  // Sync with IndexedDB & optional Server on mount
  useEffect(() => {
    let active = true;

    // 1. Hydrate any attachment dataUrls from IndexedDB (critical for static Vercel hosting)
    const hydrateFromIndexedDb = async () => {
      const hydrated = await Promise.all(
        lessons.map(async (l) => {
          if (l.attachment && !l.attachment.dataUrl) {
            const storedDataUrl = await getLessonFile(l.id);
            if (storedDataUrl) {
              return { ...l, attachment: { ...l.attachment, dataUrl: storedDataUrl } };
            }
          }
          return l;
        })
      );
      if (active) {
        const changed = hydrated.some((l, i) => l !== lessons[i]);
        if (changed) setLessons(hydrated);
      }
    };
    hydrateFromIndexedDb();

    // 2. Sync with backend if running full-stack server.ts
    fetchJsonSafe('/api/lessons').then((serverLessons) => {
      if (active && serverLessons && serverLessons.length > 0) {
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
    });

    fetchJsonSafe('/api/exercises').then((serverExercises) => {
      if (active && serverExercises && serverExercises.length > 0) {
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
    });

    fetchJsonSafe('/api/videos').then((serverVideos) => {
      if (active && serverVideos && serverVideos.length > 0) {
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
    });

    fetchJsonSafe('/api/rankings').then((serverRankings) => {
      if (active && serverRankings && serverRankings.length > 0) {
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
    });

    return () => {
      active = false;
    };
  }, []);

  // Lesson Management (Teacher Admin)
  const handleAddLesson = (newLesson: LessonUnit) => {
    setLessons((prev) => [newLesson, ...prev]);
    if (newLesson.attachment?.dataUrl) {
      saveLessonFile(newLesson.id, newLesson.attachment.dataUrl);
    }
    fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson),
    }).catch(() => {});
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    deleteLessonFile(lessonId);
    fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    }).catch(() => {});
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
        id: firebaseUser?.uid || profile.id,
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
        const exists = prev.some((r) => r.id === newRankEntry.id || r.firstName === studentFirst);
        if (!exists) {
          return [...prev, newRankEntry];
        }
        return prev.map((r) =>
          r.id === newRankEntry.id || r.firstName === studentFirst
            ? { ...r, ...newRankEntry, points: Math.max(r.points, newRankEntry.points) }
            : r
        );
      });

      if (firebaseUser) {
        upsertStudentRankingInFirestore({
          firstName: studentFirst,
          grade: profile.grade || '4AM',
          points: profile.points,
          avatar: profile.avatar,
          badge: 'تلميذ مجتهد ⭐',
          testsCompleted: profile.testsCompleted,
        }).catch((err) => {
          console.warn('Firestore ranking save failed:', err);
        });
      }

      fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRankEntry),
      }).catch(() => {});
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
          <LeaderboardView
            currentUser={currentUser}
            rankings={rankings}
            firebaseUser={firebaseUser}
            firebaseSyncError={firebaseSyncError}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
          />
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
        firebaseUser={firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
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

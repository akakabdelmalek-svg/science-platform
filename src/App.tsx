import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  resolveGoogleRedirectResult,
  signOutFirebase,
  upsertStudentRankingInFirestore,
  subscribeToClassmentRankings,
  formatFirebaseErrorMessage,
} from './firebase';
import {
  isTeacherCloudAdmin,
  saveLessonInFirestore,
  deleteLessonInFirestore,
  subscribeToLessons,
  saveExerciseInFirestore,
  deleteExerciseInFirestore,
  subscribeToExercises,
  saveVideoInFirestore,
  deleteVideoInFirestore,
  subscribeToVideos,
  saveCustomTestInFirestore,
  subscribeToCustomTests,
  saveDirectMessageInFirestore,
  replyDirectMessageInFirestore,
  subscribeToDirectMessages,
} from './firebaseWebData';

interface ServerSyncState {
  lessons?: LessonUnit[];
  exercises?: TeacherExercise[];
  videos?: VideoLesson[];
  tests?: AssessmentTest[];
  rankings?: StudentRanking[];
  directMessages?: DirectTeacherMessage[];
}

async function fetchSyncSafe(): Promise<ServerSyncState | null> {
  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const data = await res.json();
    return data && typeof data === 'object' ? (data as ServerSyncState) : null;
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
  const syncedCloudIdsRef = useRef<Set<string>>(new Set());

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

  // Listen to Firebase Auth state (+ resolve redirect sign-in if triggered on Vercel/mobile)
  useEffect(() => {
    resolveGoogleRedirectResult().catch(() => {});
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
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      }
    );

    return () => unsubscribe();
  }, [isFirebaseReady, firebaseUser]);

  // Subscribe to Firestore Web Data collections (lessons, exercises, videos, custom_tests, direct_messages)
  useEffect(() => {
    if (!isFirebaseReady || !firebaseUser) return;

    const unsubLessons = subscribeToLessons(
      (cloudLessons) => {
        cloudLessons.forEach((cl) => syncedCloudIdsRef.current.add(`lesson:${cl.id}`));
        if (cloudLessons.length === 0) return;
        setLessons((prev) => {
          const prevMap = new Map(prev.map((l) => [l.id, l]));
          const merged = cloudLessons.map((cl) => {
            const localMatch = prevMap.get(cl.id);
            if (cl.attachment && !cl.attachment.dataUrl && localMatch?.attachment?.dataUrl) {
              return {
                ...cl,
                attachment: { ...cl.attachment, dataUrl: localMatch.attachment.dataUrl },
              };
            }
            return cl;
          });
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      },
      (err) => setFirebaseSyncError(formatFirebaseErrorMessage(err))
    );

    const unsubExercises = subscribeToExercises(
      (cloudEx) => {
        cloudEx.forEach((ce) => syncedCloudIdsRef.current.add(`ex:${ce.id}`));
        if (cloudEx.length === 0) return;
        setExercises((prev) => {
          const merged = [...cloudEx];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      },
      (err) => setFirebaseSyncError(formatFirebaseErrorMessage(err))
    );

    const unsubVideos = subscribeToVideos(
      (cloudVids) => {
        cloudVids.forEach((cv) => syncedCloudIdsRef.current.add(`vid:${cv.id}`));
        if (cloudVids.length === 0) return;
        setVideos((prev) => {
          const merged = [...cloudVids];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      },
      (err) => setFirebaseSyncError(formatFirebaseErrorMessage(err))
    );

    const unsubTests = subscribeToCustomTests(
      (cloudTests) => {
        cloudTests.forEach((ct) => syncedCloudIdsRef.current.add(`test:${ct.id}`));
        if (cloudTests.length === 0) return;
        setTests((prev) => {
          const cloudMap = new Map(cloudTests.map((t) => [t.id, t]));
          const merged = prev.map((t) => cloudMap.get(t.id) || t);
          cloudTests.forEach((ct) => {
            if (!merged.some((m) => m.id === ct.id)) merged.unshift(ct);
          });
          return merged;
        });
      },
      (err) => setFirebaseSyncError(formatFirebaseErrorMessage(err))
    );

    const unsubMsgs = subscribeToDirectMessages(
      (cloudMsgs) => {
        if (cloudMsgs.length === 0) return;
        setDirectMessages((prev) => {
          const merged = [...cloudMsgs];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      },
      (err) => setFirebaseSyncError(formatFirebaseErrorMessage(err))
    );

    return () => {
      unsubLessons();
      unsubExercises();
      unsubVideos();
      unsubTests();
      unsubMsgs();
    };
  }, [isFirebaseReady, firebaseUser]);

  // Auto-upload any locally created lessons/exercises/videos to Firestore once teacher signs into Google
  useEffect(() => {
    if (!isFirebaseReady || !firebaseUser || !isTeacherCloudAdmin(firebaseUser.email)) return;

    const timer = setTimeout(() => {
      lessons.forEach((l) => {
        const key = `lesson:${l.id}`;
        if (!syncedCloudIdsRef.current.has(key)) {
          syncedCloudIdsRef.current.add(key);
          saveLessonInFirestore(l).catch(() => {
            syncedCloudIdsRef.current.delete(key);
          });
        }
      });

      exercises.forEach((ex) => {
        const key = `ex:${ex.id}`;
        if (!syncedCloudIdsRef.current.has(key)) {
          syncedCloudIdsRef.current.add(key);
          saveExerciseInFirestore(ex).catch(() => {
            syncedCloudIdsRef.current.delete(key);
          });
        }
      });

      videos.forEach((vid) => {
        if (!vid.id.startsWith('vid-')) return;
        const key = `vid:${vid.id}`;
        if (!syncedCloudIdsRef.current.has(key)) {
          syncedCloudIdsRef.current.add(key);
          saveVideoInFirestore(vid).catch(() => {
            syncedCloudIdsRef.current.delete(key);
          });
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [isFirebaseReady, firebaseUser, lessons, exercises, videos]);

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
    })
      .then(() => setFirebaseSyncError(null))
      .catch((err) => {
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
  }, [isFirebaseReady, firebaseUser, currentUser?.points, currentUser?.testsCompleted, currentUser?.firstName, currentUser?.grade, currentUser?.avatar]);

  const handleGoogleSignIn = async (): Promise<FirebaseUser | null> => {
    try {
      setFirebaseSyncError(null);
      const user = await signInWithGoogle();
      if (user && currentUser && currentUser.role === 'student') {
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
      setFirebaseSyncError(formatFirebaseErrorMessage(err));
      return null;
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutFirebase();
    } catch {}
  };

  const syncWithBackendServer = useCallback(async () => {
    const syncData = await fetchSyncSafe();
    if (!syncData) return;

    if (Array.isArray(syncData.lessons) && syncData.lessons.length > 0) {
      setLessons((prev) => {
        const prevMap = new Map(prev.map((l) => [l.id, l]));
        const merged = syncData.lessons!.map((sl) => {
          const localMatch = prevMap.get(sl.id);
          if (sl.attachment && !sl.attachment.dataUrl && localMatch?.attachment?.dataUrl) {
            return {
              ...sl,
              attachment: { ...sl.attachment, dataUrl: localMatch.attachment.dataUrl },
            };
          }
          return sl;
        });
        prev.forEach((p) => {
          if (!merged.some((m) => m.id === p.id)) merged.push(p);
        });
        return merged;
      });
    }

    if (Array.isArray(syncData.exercises) && syncData.exercises.length > 0) {
      setExercises((prev) => {
        const merged = [...syncData.exercises!];
        prev.forEach((p) => {
          if (!merged.some((m) => m.id === p.id)) merged.push(p);
        });
        return merged;
      });
    }

    if (Array.isArray(syncData.videos) && syncData.videos.length > 0) {
      setVideos((prev) => {
        const merged = [...syncData.videos!];
        prev.forEach((p) => {
          if (!merged.some((m) => m.id === p.id)) merged.push(p);
        });
        return merged;
      });
    }

    if (Array.isArray(syncData.tests) && syncData.tests.length > 0) {
      setTests((prev) => {
        const serverMap = new Map(syncData.tests!.map((t) => [t.id, t]));
        const merged = prev.map((t) => serverMap.get(t.id) || t);
        syncData.tests!.forEach((st) => {
          if (!merged.some((m) => m.id === st.id)) merged.unshift(st);
        });
        return merged;
      });
    }

    if (Array.isArray(syncData.rankings) && syncData.rankings.length > 0) {
      setRankings((prev) => {
        const merged = [...syncData.rankings!];
        prev.forEach((p) => {
          if (!merged.some((m) => m.id === p.id || (m.firstName === p.firstName && m.grade === p.grade))) {
            merged.push(p);
          }
        });
        return merged
          .sort((a, b) => b.points - a.points)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }

    if (Array.isArray(syncData.directMessages) && syncData.directMessages.length > 0) {
      setDirectMessages((prev) => {
        const merged = [...syncData.directMessages!];
        prev.forEach((p) => {
          if (!merged.some((m) => m.id === p.id)) merged.push(p);
        });
        return merged;
      });
    }
  }, []);

  // Sync with IndexedDB & persistent Backend Server on mount, window focus, and periodic refresh
  useEffect(() => {
    let active = true;

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
    syncWithBackendServer();

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        syncWithBackendServer();
      }
    };
    window.addEventListener('focus', syncWithBackendServer);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncWithBackendServer();
      }
    }, 15000);

    return () => {
      active = false;
      window.removeEventListener('focus', syncWithBackendServer);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      clearInterval(interval);
    };
  }, [syncWithBackendServer]);

  // Lesson Management (Teacher Admin)
  const handleAddLesson = (newLesson: LessonUnit) => {
    setLessons((prev) => [newLesson, ...prev]);
    if (newLesson.attachment?.dataUrl) {
      saveLessonFile(newLesson.id, newLesson.attachment.dataUrl);
    }
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      syncedCloudIdsRef.current.add(`lesson:${newLesson.id}`);
      saveLessonInFirestore(newLesson).catch((err) => {
        syncedCloudIdsRef.current.delete(`lesson:${newLesson.id}`);
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
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
    syncedCloudIdsRef.current.delete(`lesson:${lessonId}`);
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      deleteLessonInFirestore(lessonId).catch((err) => {
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Applied Exercise Management (Teacher Admin)
  const handleAddExercise = (newExercise: TeacherExercise) => {
    setExercises((prev) => [newExercise, ...prev]);
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      syncedCloudIdsRef.current.add(`ex:${newExercise.id}`);
      saveExerciseInFirestore(newExercise).catch((err) => {
        syncedCloudIdsRef.current.delete(`ex:${newExercise.id}`);
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise),
    }).catch(() => {});
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    syncedCloudIdsRef.current.delete(`ex:${exerciseId}`);
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      deleteExerciseInFirestore(exerciseId).catch((err) => {
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch(`/api/exercises/${exerciseId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Question Management (Teacher Admin)
  const handleAddQuestion = (testId: string, newQ: AssessmentQuestion, fallbackGrade: GradeLevel = '4AM') => {
    setTests((prev) => {
      const exists = prev.some((t) => t.id === testId);
      let targetTest: AssessmentTest;
      let nextTests: AssessmentTest[];
      if (exists) {
        nextTests = prev.map((t) => {
          if (t.id === testId) {
            targetTest = { ...t, questions: [newQ, ...t.questions] };
            return targetTest;
          }
          return t;
        });
      } else {
        targetTest = {
          id: testId || `test-${fallbackGrade.toLowerCase()}-${Date.now()}`,
          title: `اختبار وتمارين ${fallbackGrade}`,
          subtitle: 'أسئلة وتمارين مضافة من أستاذ المادة',
          grade: fallbackGrade,
          trimester: 1,
          durationMinutes: 20,
          totalScore: 20,
          questions: [newQ],
        };
        nextTests = [targetTest, ...prev];
      }
      if (targetTest!) {
        if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
          saveCustomTestInFirestore(targetTest).catch((err) => {
            setFirebaseSyncError(formatFirebaseErrorMessage(err));
          });
        }
        fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetTest),
        }).catch(() => {});
      }
      return nextTests;
    });
  };

  const handleDeleteQuestion = (testId: string, questionId: string) => {
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          const updated = { ...t, questions: t.questions.filter((q) => q.id !== questionId) };
          if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
            saveCustomTestInFirestore(updated).catch((err) => {
              setFirebaseSyncError(formatFirebaseErrorMessage(err));
            });
          }
          fetch('/api/tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(() => {});
          return updated;
        }
        return t;
      })
    );
  };

  // Video Management (Teacher Admin)
  const handleAddVideo = (newVideo: VideoLesson) => {
    setVideos((prev) => [newVideo, ...prev]);
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      syncedCloudIdsRef.current.add(`vid:${newVideo.id}`);
      saveVideoInFirestore(newVideo).catch((err) => {
        syncedCloudIdsRef.current.delete(`vid:${newVideo.id}`);
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVideo),
    }).catch(() => {});
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    syncedCloudIdsRef.current.delete(`vid:${videoId}`);
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      deleteVideoInFirestore(videoId).catch((err) => {
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch(`/api/videos/${videoId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Direct Teacher Question Box
  const handleSendMessageToTeacher = (newMsg: DirectTeacherMessage) => {
    setDirectMessages((prev) => [newMsg, ...prev]);
    if (firebaseUser) {
      saveDirectMessageInFirestore(newMsg).catch((err) => {
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch(() => {});
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
    if (firebaseUser && isTeacherCloudAdmin(firebaseUser.email)) {
      replyDirectMessageInFirestore(messageId, replyText, teacherName).catch((err) => {
        setFirebaseSyncError(formatFirebaseErrorMessage(err));
      });
    }
    fetch(`/api/messages/${messageId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText, teacherName }),
    }).catch(() => {});
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
        })
          .then(() => setFirebaseSyncError(null))
          .catch((err) => {
            setFirebaseSyncError(formatFirebaseErrorMessage(err));
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
            firebaseUser={firebaseUser}
            firebaseSyncError={firebaseSyncError}
            onGoogleSignIn={handleGoogleSignIn}
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
          <ForumSection firebaseUser={firebaseUser} />
        )}

        {activeTab === 'resources' && (
          <ResourceHub firebaseUser={firebaseUser} />
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
            firebaseUser={firebaseUser}
            firebaseSyncError={firebaseSyncError}
            onGoogleSignIn={handleGoogleSignIn}
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
        firebaseSyncError={firebaseSyncError}
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

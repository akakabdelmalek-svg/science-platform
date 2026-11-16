import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { StudentRanking } from './types/user';
import { GradeLevel } from './types/science';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export function formatFirebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const msg = err instanceof Error ? err.message : String(err);

  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    return `النطاق غير مصرح به في Firebase Auth (${host}). أضفه في Authorized domains ثم أعد المحاولة.`;
  }
  if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
    return 'تم حظر النافذة المنبثقة من المتصفح. يرجى السماح بالنوافذ المنبثقة (Pop-ups) لهذا الموقع.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'تم إغلاق نافذة تسجيل الدخول قبل إتمام الربط.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'تسجيل الدخول عبر Google غير مفعل في مشروع Firebase.';
  }
  if (msg.includes('Quota exceeded')) {
    return 'تم تجاوز الحصة اليومية لـ Firebase، سيتم استعادة المزامنة غداً.';
  }
  if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
    return 'صلاحيات Firestore مرفوضة للعملية الحالية. تأكد من تسجيل الدخول بحساب Google موثق.';
  }
  return `خطأ Firebase${code ? ` (${code})` : ''}: ${msg}`;
}

export async function resolveGoogleRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const res = await getRedirectResult(auth);
    return res?.user || null;
  } catch {
    return null;
  }
}

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    const isStandaloneTopWindow = typeof window !== 'undefined' && window.self === window.top;
    if (err?.code === 'auth/popup-blocked' && isStandaloneTopWindow) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

const VALID_GRADES: GradeLevel[] = ['1AM', '2AM', '3AM', '4AM'];

function sanitizeRankingPayload(input: {
  ownerUid: string;
  firstName: string;
  grade?: GradeLevel;
  points: number;
  avatar?: string;
  badge?: string;
  testsCompleted?: number;
}) {
  const rawFirst = String(input.firstName || 'تلميذ').trim().split(/\s+/)[0] || 'تلميذ';
  const cleanFirst = rawFirst.slice(0, 60);
  const validGrade: GradeLevel = VALID_GRADES.includes(input.grade as GradeLevel)
    ? (input.grade as GradeLevel)
    : '4AM';
  const safePoints = Math.max(0, Math.min(1000000, Math.round(Number(input.points) || 0)));
  const safeAvatar = String(input.avatar || '👨‍🎓').trim().slice(0, 16) || '👨‍🎓';
  const safeBadge = String(input.badge || 'تلميذ مجتهد ⭐').trim().slice(0, 80) || 'تلميذ مجتهد ⭐';
  const safeTests = Math.max(0, Math.min(10000, Math.round(Number(input.testsCompleted) || 0)));

  return {
    ownerUid: input.ownerUid,
    firstName: cleanFirst,
    name: cleanFirst,
    grade: validGrade,
    points: safePoints,
    avatar: safeAvatar,
    badge: safeBadge,
    testsCompleted: safeTests,
  };
}

export async function upsertStudentRankingInFirestore(input: {
  firstName: string;
  grade?: GradeLevel;
  points: number;
  avatar?: string;
  badge?: string;
  testsCompleted?: number;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const docPath = `rankings/${user.uid}`;
  const docRef = doc(db, 'rankings', user.uid);
  const payload = sanitizeRankingPayload({
    ownerUid: user.uid,
    ...input,
  });

  let existingSnap;
  try {
    existingSnap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  if (existingSnap && existingSnap.exists()) {
    const prevData = existingSnap.data();
    const mergedPoints = Math.max(Number(prevData?.points) || 0, payload.points);
    const mergedTests = Math.max(Number(prevData?.testsCompleted) || 0, payload.testsCompleted);
    try {
      await updateDoc(docRef, {
        firstName: payload.firstName,
        name: payload.name,
        grade: payload.grade,
        points: mergedPoints,
        avatar: payload.avatar,
        badge: payload.badge,
        testsCompleted: mergedTests,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  } else {
    try {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }
}

export async function deleteStudentRankingInFirestore(rankingId: string): Promise<void> {
  if (!auth.currentUser) return;
  const docPath = `rankings/${rankingId}`;
  try {
    await deleteDoc(doc(db, 'rankings', rankingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeToClassmentRankings(
  onData: (items: StudentRanking[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }

  const path = 'rankings';
  const q = query(
    collection(db, path),
    where('points', '>=', 0),
    orderBy('points', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: StudentRanking[] = snapshot.docs.map((d, idx) => {
        const data = d.data();
        const firstName = String(data.firstName || data.name || 'تلميذ');
        return {
          id: d.id,
          firstName,
          name: firstName,
          grade: (VALID_GRADES.includes(data.grade) ? data.grade : '4AM') as GradeLevel,
          points: Number(data.points) || 0,
          avatar: String(data.avatar || '👨‍🎓'),
          rank: idx + 1,
          badge: String(data.badge || 'تلميذ مجتهد ⭐'),
          testsCompleted: Number(data.testsCompleted) || 0,
        };
      });
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

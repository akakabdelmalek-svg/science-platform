import React, { useState } from 'react';
import { UserProfile } from '../types/user';
import { GradeLevel } from '../types/science';
import { School, GraduationCap, User, Sparkles, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
  isObligated?: boolean;
}

const AVATARS = ['👨‍🎓', '👩‍🎓', '👦', '👧', '👨‍🏫', '👩‍🏫', '🧬', '🔬', '🌱', '🌍'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  currentProfile,
  isObligated = true,
}) => {
  const [firstName, setFirstName] = useState<string>(currentProfile?.firstName || currentProfile?.name || '');
  const [role, setRole] = useState<'student' | 'teacher'>(currentProfile?.role || 'student');
  const [grade, setGrade] = useState<GradeLevel>(currentProfile?.grade || '4AM');
  const [avatar, setAvatar] = useState<string>(currentProfile?.avatar || '👨‍🎓');
  const [teacherPasscode, setTeacherPasscode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = firstName.trim().split(/\s+/)[0]; // Strictly first name only

    if (!cleanFirstName) {
      setErrorMsg('يرجى إدخال الاسم الأول.');
      return;
    }

    if (role === 'teacher') {
      const pass = teacherPasscode.trim();
      if (pass !== '0542836997' && pass !== 'prof2026' && pass !== 'admin') {
        setErrorMsg('رمز المرور غير صحيح. يرجى إدخال رمز الأستاذ (0542836997).');
        return;
      }
    }

    const profile: UserProfile = {
      id: currentProfile?.id || `user-${Date.now()}`,
      firstName: cleanFirstName,
      name: cleanFirstName,
      role,
      grade: role === 'student' ? grade : undefined,
      avatar,
      points: currentProfile?.points || 150, // Initial bonus points
      completedLessons: currentProfile?.completedLessons || [],
      testsCompleted: currentProfile?.testsCompleted || 0,
      joinedDate: currentProfile?.joinedDate || 'اليوم',
    };

    onSaveProfile(profile);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl space-y-5 animate-fade-in text-right">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
            <School className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {currentProfile ? 'تعديل بيانات الحساب' : 'إنشاء حسابك للدخول إلى المنصة'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            التسجيل إلزامي للمتابعة والمشاركة في الترتيب والمختبر والتواصل مع الأستاذ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First name only input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                الاسم الأول فقط (First Name Only):
              </label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                مخصص لترتيب النقاط (Classment)
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="مثال: أمين أو مريم أو ياسين (اسمك الأول فقط)..."
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
              صفتك في المنصة:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setErrorMsg(null);
                  if (avatar === '👨‍🏫' || avatar === '👩‍🏫') setAvatar('👨‍🎓');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>تلميذ (طالب علم)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('teacher');
                  setAvatar('👨‍🏫');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'teacher'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>أستاذ المادة</span>
              </button>
            </div>
          </div>

          {/* If teacher, ask for passcode 0542836997 */}
          {role === 'teacher' && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/80 space-y-1.5">
              <label className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>رمز المرور السري للأستاذ:</span>
              </label>
              <input
                type="password"
                required
                placeholder="أدخل رمز الأستاذ (0542836997)..."
                value={teacherPasscode}
                onChange={(e) => {
                  setTeacherPasscode(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full text-xs p-2 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Grade selection (if student) */}
          {role === 'student' && (
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                المستوى الدراسي المسجل فيه:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: '1AM', name: '1 متوسط' },
                  { id: '2AM', name: '2 متوسط' },
                  { id: '3AM', name: '3 متوسط' },
                  { id: '4AM', name: '4 متوسط (BEM)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGrade(g.id as GradeLevel)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      grade === g.id
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white border-slate-900 dark:border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Avatar selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
              اختر رمزك التعبيري (الأفاتار):
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 text-lg rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-emerald-500/30 ring-2 ring-emerald-500 scale-110'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          {/* Submit (Mandatory) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>تأكيد الحساب والدخول إلى المنصة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

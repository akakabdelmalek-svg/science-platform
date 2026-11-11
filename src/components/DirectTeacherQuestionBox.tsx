import React, { useState } from 'react';
import { 
  MessageCircle, Send, CheckCircle2, Clock, User, 
  Sparkles, HelpCircle, AlertCircle, ArrowLeft, X 
} from 'lucide-react';
import { DirectTeacherMessage, UserProfile } from '../types/user';
import { INITIAL_DIRECT_MESSAGES } from '../data/rankingsData';
import { GradeLevel } from '../types/science';

interface DirectTeacherQuestionBoxProps {
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  messages: DirectTeacherMessage[];
  onSendMessage: (msg: DirectTeacherMessage) => void;
}

export const DirectTeacherQuestionBox: React.FC<DirectTeacherQuestionBoxProps> = ({
  currentUser,
  onOpenAuthModal,
  messages,
  onSendMessage,
}) => {
  const [topic, setTopic] = useState<string>('الهضم والامتصاص');
  const [questionText, setQuestionText] = useState<string>('');
  const [grade, setGrade] = useState<GradeLevel>(currentUser?.grade || '4AM');
  const [studentName, setStudentName] = useState<string>(currentUser?.name || '');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (txt: string) => {
    setToast(txt);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newMsg: DirectTeacherMessage = {
      id: `msg-${Date.now()}`,
      studentId: currentUser?.id || `anon-${Date.now()}`,
      studentName: studentName.trim() || currentUser?.name || 'تلميذ مجتهد',
      studentGrade: grade,
      topic,
      questionText: questionText.trim(),
      status: 'pending',
      createdAt: 'الآن',
    };

    onSendMessage(newMsg);
    setQuestionText('');
    showToast('تم إرسال استفسارك إلى صندوق الأستاذ بنجاح! سيتم الرد عليك قريباً.');
  };

  // Filter messages related to this student or sample
  const myMessages = messages;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
            <MessageCircle className="w-4 h-4 text-indigo-400" />
            <span>صندوق المراسلة والاستفسار المباشر مع أستاذ المادة</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            صندوق التساؤلات والتواصل الشخصي مع الأستاذ
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            هل استعصى عليك فهم تمرين أو ظاهرة علمية؟ اكتب سؤالك مباشرة هنا لأساتذة المادة لتلقي توجيهات منهجية مخصصة وإجابات علمية موثوقة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Question Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>إرسال استفسار جديد للأستاذ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              يطلع الأستاذ على رسالتك في لوحة التحكم الإدارية ويجيب عليها بالتفصيل.
            </p>
          </div>

          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                اسم التلميذ:
              </label>
              <input
                type="text"
                placeholder="اسمك الكامل..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  المستوى الدراسي:
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="4AM">4 متوسط (BEM)</option>
                  <option value="3AM">3 متوسط</option>
                  <option value="2AM">2 متوسط</option>
                  <option value="1AM">1 متوسط</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  محور السؤال:
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="الهضم والامتصاص">الهضم والامتصاص</option>
                  <option value="الاتصال العصبي والمنعكسات">الاتصال العصبي</option>
                  <option value="المناعة والزمر الدموية">المناعة والزمر</option>
                  <option value="الوراثة والصبغيات">الوراثة والصبغيات</option>
                  <option value="الجيولوجيا والزلازل">الجيولوجيا وتكتونية الصفائح</option>
                  <option value="الوسط الحي والسلاسل">الوسط الحي والكتلة الحية</option>
                  <option value="التغذية عند النبات">التغذية النباتية ومحلول كنوب</option>
                  <option value="منهجية حل وضعية BEM">منهجية حل وضعية BEM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                نص السؤال أو الإشكال العلمي:
              </label>
              <textarea
                rows={4}
                required
                placeholder="اشرح للأستاذ بالتحديد ما الذي لم تفهمه أو سياق التمرين الذي أشكل عليك..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال السؤال إلى الأستاذ</span>
            </button>
          </form>
        </div>

        {/* Right Side: Conversation History & Teacher Responses (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              سجل استفسارات التلاميذ وإجابات الأساتذة ({myMessages.length}):
            </h3>
            <span className="text-xs text-slate-500">
              إجابات تربوية معتمدة
            </span>
          </div>

          <div className="space-y-3">
            {myMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm text-right"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.studentName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {msg.studentGrade}
                    </span>
                    <span className="text-xs text-slate-400">· {msg.createdAt}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    msg.status === 'answered'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                  }`}>
                    {msg.status === 'answered' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تمت الإجابة من الأستاذ</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>قيد المراجعة</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Body */}
                <div>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    الموضوع: {msg.topic}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {msg.questionText}
                  </p>
                </div>

                {/* Teacher's Reply Box (if answered) */}
                {msg.status === 'answered' && msg.replyText && (
                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <span>👨‍🏫 {msg.teacherName || 'أستاذ المادة'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.answeredAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {msg.replyText}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Award, Trophy, Medal, Crown, Star, Sparkles, Filter, ChevronLeft } from 'lucide-react';
import { StudentRanking, UserProfile } from '../types/user';
import { INITIAL_RANKINGS } from '../data/rankingsData';
import { GradeLevel } from '../types/science';

interface LeaderboardViewProps {
  currentUser?: UserProfile | null;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [rankings, setRankings] = useState<StudentRanking[]>(INITIAL_RANKINGS);

  // If currentUser is a student, incorporate their current points into the view
  const displayRankings = [...rankings];
  if (currentUser && currentUser.role === 'student') {
    const studentFirst = currentUser.firstName || currentUser.name || 'تلميذ';
    const existingIndex = displayRankings.findIndex((r) => r.id === currentUser.id || r.firstName === studentFirst);
    if (existingIndex >= 0) {
      displayRankings[existingIndex].points = currentUser.points;
    } else {
      displayRankings.push({
        id: currentUser.id,
        firstName: studentFirst,
        name: studentFirst,
        grade: currentUser.grade || '4AM',
        points: currentUser.points,
        avatar: currentUser.avatar,
        rank: 99,
        badge: 'تلميذ مجتهد ⭐',
        testsCompleted: currentUser.testsCompleted,
      });
    }
  }

  // Filter and sort by points descending
  const filtered = displayRankings
    .filter((r) => selectedGrade === 'all' || r.grade === selectedGrade)
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const top3 = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  // Find user rank
  const myRankItem = currentUser
    ? filtered.find((r) => r.name === currentUser.name)
    : null;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-l from-amber-950 via-slate-900 to-amber-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-2">
              <Trophy className="w-4 h-4" />
              <span>لوحة الشرف وتصنيف النقاط للمستويات الأربعة</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ترتيب المتفوقين في علوم الطبيعة والحياة
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              تحصل على النقاط والأوسمة عبر إكمال الاختبارات بنجاح، حل أسئلة الفيديوهات التفاعلية، والتفاعل الإيجابي مع زملائك في المنتدى.
            </p>
          </div>

          {/* Current User Standing Card */}
          {currentUser && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shrink-0 min-w-[200px]">
              <span className="text-xs text-amber-200 block">رصيدك ونقاطك الحالية</span>
              <div className="text-3xl font-black text-white font-mono my-1">
                {currentUser.points} <span className="text-xs font-normal">نقطة</span>
              </div>
              <div className="text-xs text-slate-200">
                {myRankItem ? `المرتبة رقم #${myRankItem.rank} في التصنيف` : 'واصل حل الاختبارات لترقية رتبتك'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grade Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'الترتيب العام لكافة السنوات' },
            { id: '4AM', label: '4 متوسط (BEM)' },
            { id: '3AM', label: '3 متوسط' },
            { id: '2AM', label: '2 متوسط' },
            { id: '1AM', label: '1 متوسط' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGrade(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedGrade === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 hidden md:block">
          يتم تحديث الترتيب تلقائياً بعد كل اختبار
        </span>
      </div>

      {/* Top 3 Podium (منصة التتويج) */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 md:gap-6 pt-4 max-w-2xl mx-auto items-end">
          {/* Silver #2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-4 text-center space-y-2 shadow-sm order-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
              {top3[1].avatar}
            </div>
            <div className="text-xl">🥈</div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {top3[1].name}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
              {top3[1].points} نقطة
            </div>
            <span className="text-[10px] text-slate-500 block">
              {top3[1].grade}
            </span>
          </div>

          {/* Gold #1 */}
          <div className="bg-gradient-to-b from-amber-100 to-white dark:from-amber-950/60 dark:to-slate-900 rounded-2xl border-2 border-amber-400 p-5 text-center space-y-2 shadow-md order-2 -mt-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-3xl shadow-md border-2 border-amber-400">
              {top3[0].avatar}
            </div>
            <div className="text-2xl">👑 🥇</div>
            <div className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
              {top3[0].name}
            </div>
            <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
              {top3[0].points} نقطة
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
              {top3[0].badge}
            </span>
          </div>

          {/* Bronze #3 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-800/40 p-4 text-center space-y-2 shadow-sm order-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
              {top3[2].avatar}
            </div>
            <div className="text-xl">🥉</div>
            <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {top3[2].name}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
              {top3[2].points} نقطة
            </div>
            <span className="text-[10px] text-slate-500 block">
              {top3[2].grade}
            </span>
          </div>
        </div>
      )}

      {/* Rankings List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            قائمة الترتيب العام ({filtered.length} تلميذ):
          </span>
          <span className="text-xs text-slate-400">
            تمنح شهادات تفوق شرفية لأصحاب المراكز الأولى
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((item) => {
            const isMe = currentUser?.name === item.name;
            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isMe
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-r-4 border-amber-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    item.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : item.rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : item.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.rank}
                  </span>

                  <span className="text-2xl">{item.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                          أنت
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>المستوى: {item.grade}</span>
                      <span>·</span>
                      <span>الشارة: {item.badge}</span>
                      <span>·</span>
                      <span>الاختبارات المنجزة: {item.testsCompleted}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-sm md:text-base font-extrabold text-amber-600 dark:text-amber-400">
                    {item.points}
                  </span>
                  <span className="text-xs text-slate-400 mr-1">نقطة</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

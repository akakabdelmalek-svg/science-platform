import React from 'react';
import { Moon, Sun } from 'lucide-react';

export type ActiveNavTab = 
  | 'curriculum' 
  | 'labs' 
  | 'videos' 
  | 'assessments' 
  | 'leaderboard'
  | 'teacher_box'
  | 'forum' 
  | 'resources' 
  | 'methodology'
  | 'admin';

interface TopNavbarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userName?: string;
  userAvatar?: string;
  userPoints?: number;
  onOpenProfile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  userName = 'حسابي',
  userAvatar = '👨‍🎓',
  userPoints = 150,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark (Single text element, 1 line) */}
        <button
          onClick={() => onSelectTab('curriculum')}
          className="text-base md:text-lg font-black tracking-tight text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
        >
          علوم الطبيعة والحياة
        </button>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectTab('curriculum')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'curriculum'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الدروس
          </button>
          <button
            onClick={() => onSelectTab('labs')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'labs'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المختبر
          </button>
          <button
            onClick={() => onSelectTab('videos')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'videos'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الفيديوهات
          </button>
          <button
            onClick={() => onSelectTab('assessments')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'assessments'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الاختبارات
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ترتيب النقاط 🏆
          </button>
          <button
            onClick={() => onSelectTab('teacher_box')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'teacher_box'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            صندوق الأستاذ ✉️
          </button>
          <button
            onClick={() => onSelectTab('forum')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'forum'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المنتدى
          </button>
          <button
            onClick={() => onSelectTab('resources')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'resources'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الموارد (PPT/Word/Excel)
          </button>
          <button
            onClick={() => onSelectTab('methodology')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'methodology'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            دليل BEM
          </button>
        </nav>

        {/* Zone 3: Profile Chip, Admin Button, Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Account Chip */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-500 transition-all text-right cursor-pointer"
            title="تعديل حسابي وعرض نقاطي"
          >
            <span className="text-base">{userAvatar}</span>
            <div className="hidden sm:block">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {userName}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                {userPoints} نقطة
              </div>
            </div>
          </button>

          {/* Teacher Admin Portal Button */}
          <button
            onClick={() => onSelectTab('admin')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800'
            }`}
            title="فضاء إدارة الأستاذ (كلمة السر 0542836997)"
          >
            إدارة الأستاذ 🔒
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'التبديل إلى الوضع المضيء' : 'التبديل إلى الوضع الليلي'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => onSelectTab('curriculum')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'curriculum' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          الدروس
        </button>
        <button
          onClick={() => onSelectTab('labs')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'labs' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          المختبر
        </button>
        <button
          onClick={() => onSelectTab('videos')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'videos' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          الفيديوهات
        </button>
        <button
          onClick={() => onSelectTab('assessments')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'assessments' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          الاختبارات
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'leaderboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
        >
          الترتيب 🏆
        </button>
        <button
          onClick={() => onSelectTab('teacher_box')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'teacher_box' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          صندوق الأستاذ ✉️
        </button>
        <button
          onClick={() => onSelectTab('forum')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'forum' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          المنتدى
        </button>
        <button
          onClick={() => onSelectTab('resources')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'resources' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          الموارد
        </button>
        <button
          onClick={() => onSelectTab('methodology')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${activeTab === 'methodology' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
        >
          المنهجية
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 font-bold ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-indigo-600 dark:text-indigo-400'}`}
        >
          الإدارة 🔒
        </button>
      </div>
    </header>
  );
};

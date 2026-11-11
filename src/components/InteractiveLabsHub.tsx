import React, { useState } from 'react';
import { TestTube, Zap, Droplet, Sun, Mountain, Sparkles, CheckCircle2 } from 'lucide-react';
import { AmylaseStarchLab } from './labs/AmylaseStarchLab';
import { ReflexArcLab } from './labs/ReflexArcLab';
import { BloodTransfusionLab } from './labs/BloodTransfusionLab';

type LabKey = 'amylase' | 'reflex' | 'blood';

interface InteractiveLabsHubProps {
  initialLab?: string;
}

export const InteractiveLabsHub: React.FC<InteractiveLabsHubProps> = ({ initialLab = 'amylase' }) => {
  const [activeLab, setActiveLab] = useState<LabKey>(
    initialLab === 'reflex_arc' ? 'reflex' : initialLab === 'blood_transfusion' ? 'blood' : 'amylase'
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-l from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
            <span>المختبر العلمي الافتراضي التفاعلي</span>
            <span>·</span>
            <span>تجارب حية ومحاكاة دقيقة</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            مختبر التجارب الاستكشافية في علوم الطبيعة والحياة
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            محاكاة تفاعلية للتجارب المخبرية المقررة في الطور المتوسط: تغيير الشروط الفيزيائية والكيميائية، رصد التفاعلات اللحظية، وتثبيت منهجية التفسير والاستنتاج.
          </p>
        </div>
      </div>

      {/* Lab Selector Segmented Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveLab('amylase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeLab === 'amylase'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <TestTube className="w-4 h-4" />
          <span>1. تجربة الهضم الإنزيمي للنشاء (الأميلاز والحرارة)</span>
        </button>

        <button
          onClick={() => setActiveLab('reflex')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeLab === 'reflex'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. محاكاة القوس الانعكاسي الشوكي (المنعكس الفطري)</span>
        </button>

        <button
          onClick={() => setActiveLab('blood')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeLab === 'blood'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>3. محاكاة فصائل الدم والتوافق المناعي (ABO & Rh)</span>
        </button>
      </div>

      {/* Active Lab Component */}
      <div className="animate-fade-in">
        {activeLab === 'amylase' && <AmylaseStarchLab />}
        {activeLab === 'reflex' && <ReflexArcLab />}
        {activeLab === 'blood' && <BloodTransfusionLab />}
      </div>
    </div>
  );
};

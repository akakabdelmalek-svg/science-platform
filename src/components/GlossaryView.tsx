import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Filter } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/curriculumData';
import { GradeLevel } from '../types/science';

export const GlossaryView: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');

  const filtered = GLOSSARY_TERMS.filter((t) => {
    const matchesGrade = selectedGrade === 'all' || t.grade === selectedGrade;
    const matchesSearch =
      t.termAr.toLowerCase().includes(search.toLowerCase()) ||
      t.termFr.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-slate-900 to-emerald-950 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-2">
            <span>القاموس العلمي المعتمد</span>
            <span>·</span>
            <span>عربي / فرنسي (Arabe & Français)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            معجم مصطلحات علوم الطبيعة والحياة للطور المتوسط
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            تعاريف علمية دقيقة، شواهد حية من المنهاج، والمصطلح العلمي المطابق باللغة الفرنسية لضبط صياغة الإجابات وتفادي اللبس في المصطلحات.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['all', '4AM', '3AM', '2AM', '1AM'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedGrade === g
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {g === 'all' ? 'جميع المستويات' : g === '4AM' ? '4 متوسط (BEM)' : `${g.replace('AM', '')} متوسط`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث بالاسم العربي أو الفرنسي (مثال: Synapse, هضم)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 hover:border-emerald-500 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.termAr}
                </h3>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t.termFr}
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {t.grade}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {t.definition}
            </p>

            <div className="pt-2 text-xs space-y-1 text-slate-500 dark:text-slate-400">
              <div>
                <strong>مثال تطبيقي: </strong> {t.example}
              </div>
              <div className="text-emerald-700 dark:text-emerald-300">
                <strong>الأهمية في الامتحانات: </strong> {t.importance}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

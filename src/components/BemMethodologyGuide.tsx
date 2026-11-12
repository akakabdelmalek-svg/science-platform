import React, { useState } from 'react';
import { 
  CheckCircle2, Compass, FileText, Sparkles, AlertCircle, 
  HelpCircle, ChevronDown, ChevronUp, BookOpen, Target
} from 'lucide-react';
import { BEM_EXERCISES } from '../data/curriculumData';

export const BemMethodologyGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'action_verbs' | 'situation_rubric' | 'sample_exercises'>('action_verbs');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(BEM_EXERCISES[0].id);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
            <span>دليل التميز والمنهجية العلمية</span>
            <span>·</span>
            <span>شهادة التعليم المتوسط (BEM)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            منهجية الإجابة وحل مواضيع علوم الطبيعة والحياة
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            المرجع الشامل لفهم وتطبيق أفعال الأداء (حَلِّلْ، فَسِّرْ، اسْتَنْتِجْ، عَلِّلْ)، استغلال السندات العلمية، ومعايير تقويم الوضعية الإدماجية (الوجاهة، الاستعمال السليم لأدوات المادة، والانسجام).
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('action_verbs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'action_verbs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          1. قاموس أفعال الأداء (Verbes d'action)
        </button>
        <button
          onClick={() => setActiveTab('situation_rubric')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'situation_rubric'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          2. شبكة تقييم الوضعية الإدماجية (8 نقاط)
        </button>
        <button
          onClick={() => setActiveTab('sample_exercises')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'sample_exercises'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          3. نماذج تمارين محلولة وفق شبكة المعايير
        </button>
      </div>

      {/* Tab 1: Action Verbs */}
      {activeTab === 'action_verbs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* حَلِّلْ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                فعل الأداء: حَلِّلْ (Analyser)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                منهجية ثلاثية
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              التحليل هو قراءة موضوعية للوثيقة أو المنحنى دون تقديم أسباب خفية. يتطلب إلزاماً ثلاث خطوات متتالية:
            </p>
            <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-decimal list-inside pr-1">
              <li><strong>التعريف بالوثيقة: </strong> يمثل المنحنى (أو الجدول) تغيرات [المتغير على محور التراتيب] بدلالة [المتغير على محور الفواصل] حيث نلاحظ...</li>
              <li><strong>تفكيك الملاحظات وتقسيم المجالات: </strong> ذكر الأرقام والنسب بدقة وتحديد فترات التزايد، التناقص، أو الثبات.</li>
              <li><strong>دلالة التغير واستخلاص الفكرة: </strong> ما الذي يعنيه هذا التغير بشكل مباشر.</li>
            </ol>
          </div>

          {/* فَسِّرْ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                فعل الأداء: فَسِّرْ (Expliquer / Interpréter)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                ربط السبب بالنتيجة
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              التفسير هو الإجابة عن السؤال <strong>(لماذا؟ أو كيف حدث ذلك؟)</strong> بالاعتماد على المكتسبات القبلية وربط الأسباب بالنتائج عبر روابط منطقية مثل (يعود ذلك إلى...، بفضل تدخل إنزيم...، مما يدل على...).
            </p>
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-300">
              <strong>مثال: </strong> نفسر تناقص النشاء في الفم بتفكيكه وتحوله إلى مالتوز بفعل إنزيم الأميلاز اللعابي في درجة حرارة 37°م.
            </div>
          </div>

          {/* قَارِنْ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                فعل الأداء: قَارِنْ (Comparer)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                أوجه الشبه والاختلاف
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              المقارنة ليست مجرد سرد عشوائي، بل استخراج نقاط التشابه أولاً، ثم نقاط الاختلاف ثانياً، وتختم باستنتاج يوضح العلاقة بين العنصرين المقارنين (يفضل وضعها في جدول منظم لتسهيل التصحيح).
            </p>
          </div>

          {/* اسْتَنْتِجْ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                فعل الأداء: اسْتَنْتِجْ (Déduire / Conclure)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                الفكرة العلمية المركزة
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              الاستنتاج هو خلاصة تركيبية مركزة ونهائية تم التوصل إليها من خلال التجربة أو التحليل السابق، تمثل قاعدة أو خاصية بيولوجية تنطبق على الظاهرة المدروسة.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Situation Rubric */}
      {activeTab === 'situation_rubric' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              شبكة المعايير المعتمدة في تصحيح الوضعية الإدماجية (BEM):
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              الوضعية الإدماجية تنقط على 8 نقاط كاملة وتعتمد حصراً على استغلال السندات المقدمة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                المعيار 1: الوجاهة (Pertinence)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                أن تجيب بدقة عن المطلوب دون خروج عن الموضوع. إذا طُلب منك تفسير المرض فلا تتحدث عن الوقاية في ذلك السؤال.
              </p>
              <div className="text-[11px] text-slate-400">العلامة: حوالي 2 إلى 2.5 نقطة</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                المعيار 2: الاستعمال السليم لأدوات المادة
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                استغلال أرقام ومعطيات السندات مع ذكر رقم السند إلزامياً: <strong>(بالاعتماد على السند 1 والسياق ومكتسباتي...)</strong> واستخدام مصطلحات علمية دقيقة.
              </p>
              <div className="text-[11px] text-slate-400">العلامة: حوالي 3 إلى 3.5 نقطة</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                المعيار 3: الانسجام وسلامة التعبير
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                التسلسل المنطقي للأفكار، نظافة ورقة الإجابة، وضوح الخط، وخلو النص من التناقضات العلمية والأخطاء اللغوية.
              </p>
              <div className="text-[11px] text-slate-400">العلامة: حوالي 1 إلى 2 نقطة</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>نصيحة ذهبية تضمن لك العلامة الكاملة:</span>
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-1 leading-relaxed">
              ابدأ كل إجابة في الوضعية الإدماجية بعبارة مفتاحية: "انطلاقاً من معطيات السند (1) الذي يبين (...) ومن مكتسباتي القبلية، فإن (...)". فالمصحح يبحث أولاً عن استثمارك للسندات قبل قراءة تحليلك!
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Sample Exercises */}
      {activeTab === 'sample_exercises' && (
        <div className="space-y-4 animate-fade-in">
          {BEM_EXERCISES.map((ex) => {
            const isExpanded = expandedExerciseId === ex.id;
            return (
              <div
                key={ex.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                <div
                  onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {ex.theme}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {ex.title}
                    </h4>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                {isExpanded && (
                  <div className="p-5 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {/* Context & Document */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        السياق والسند المقترح:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ex.context}
                      </p>

                      {ex.document.dataPoints && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {ex.document.dataPoints.map((dp, idx) => (
                            <div key={idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                {dp.label}:
                              </span>
                              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                                {dp.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Questions & Model Answers */}
                    <div className="space-y-3 pt-2">
                      {ex.questions.map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              التعليمة {idx + 1}: {q.instruction}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                              فعل: {q.actionVerb}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                            <strong>الإجابة النموذجية المنهجية: </strong>
                            {q.sampleAnswer}
                          </div>

                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            <strong>شبكة التقويم (سلم التنقيط): </strong> {q.criteriaRubric}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

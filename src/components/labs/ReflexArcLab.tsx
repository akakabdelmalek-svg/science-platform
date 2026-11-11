import React, { useState } from 'react';
import { Zap, Play, RotateCcw, AlertCircle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

type ExperimentalCondition = 
  | 'normal'               // حالة طبيعية سليمة
  | 'cut_dorsal_root'      // قطع الجذر الخلفي (الحسي الحامل للعقدة الشوكية)
  | 'cut_ventral_root'     // قطع الجذر الأمامي (الحركي)
  | 'anesthetized_skin'    // تخدير المستقبلات الحسية في الجلد بالإيثر
  | 'spinal_decerebrate';  // ضفدع شوكي (تخريب الدماغ وسالمة النخاع)

export const ReflexArcLab: React.FC = () => {
  const [condition, setCondition] = useState<ExperimentalCondition>('normal');
  const [stimulusIntensity, setStimulusIntensity] = useState<number>(65); // 0-100%
  const [isStimulating, setIsStimulating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [resultMessage, setResultMessage] = useState<string>('اضغط على "تطبيق التنبيه" لبدء مراقبة مسار السيالة العصبية');
  const [didKicked, setDidKicked] = useState<boolean>(false);

  const applyStimulus = () => {
    if (isStimulating) return;
    setIsStimulating(true);
    setDidKicked(false);
    setActiveStep(1); // Receptor

    const isAboveThreshold = stimulusIntensity >= 30;

    // Simulation steps progression
    setTimeout(() => {
      if (!isAboveThreshold) {
        setActiveStep(0);
        setIsStimulating(false);
        setResultMessage('التنبيه غير فعال (أقل من العتبة الأدنى للاستجابة) - لم تتولد أي سيالة عصبية.');
        return;
      }

      if (condition === 'anesthetized_skin') {
        setActiveStep(0);
        setIsStimulating(false);
        setResultMessage('توقف عند المستقبل: الجلد مخدر، المستقبل الحسي عاجز عن توليد كمون عمل.');
        return;
      }

      setActiveStep(2); // Sensory nerve fiber
      setTimeout(() => {
        if (condition === 'cut_dorsal_root') {
          setActiveStep(2);
          setIsStimulating(false);
          setResultMessage('انقطاع في الجذر الخلفي! السيالة الحسية لا تصل إلى النخاع الشوكي (فقدان الإحساس وانعدام المنعكس).');
          return;
        }

        setActiveStep(3); // Spinal Cord Grey Matter & Synapse
        setTimeout(() => {
          setActiveStep(4); // Motor Nerve Fiber
          setTimeout(() => {
            if (condition === 'cut_ventral_root') {
              setActiveStep(4);
              setIsStimulating(false);
              setResultMessage('انقطاع في الجذر الأمامي الحركي! السيالة العصبية الحركية عاجزة عن الوصول إلى العضلة (بقاء الإحساس مع شلل حركي).');
              return;
            }

            setActiveStep(5); // Muscle Effector
            setDidKicked(true);
            setIsStimulating(false);

            if (condition === 'spinal_decerebrate') {
              setResultMessage('استجابة منعكسة كاملة وسريعة! يثبت أن النخاع الشوكي هو المركز الحصري للأفعال الانعكاسية دون الحاجة للمخ.');
            } else {
              setResultMessage('استجابة طبيعية: تقلص فوري للعضلة وانثناء/تمدد الطرف في زمن يقارب 35 ميلي ثانية.');
            }
          }, 400);
        }, 400);
      }, 400);
    }, 400);
  };

  const resetLab = () => {
    setIsStimulating(false);
    setActiveStep(0);
    setDidKicked(false);
    setResultMessage('تمت إعادة ضبط التجربة. اختر حالة تجريبية وطبق التنبيه.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <span>محاكاة فيزيولوجية تفاعلية</span>
            <span>·</span>
            <span>التنسيق الوظيفي العصبي (4AM)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            محاكاة قوس الانعكاس الشوكي (Arc Réflexe) وتجارب بيل وماجندي
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            تتبع مسار السيالة العصبية الحسية والحركية عبر جذور النخاع الشوكي واختبار القطع والتخدير
          </p>
        </div>

        <button
          onClick={resetLab}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Visual Diagram Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-xl p-6 flex flex-col justify-between relative overflow-hidden border border-slate-800">
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>المسار العصبي: قوس الانعكاس الشوكي</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>الحالة: {condition}</span>
            </span>
          </div>

          {/* Interactive Flow Schematic */}
          <div className="my-6 space-y-4">
            {/* Step 1: Sensory Receptor */}
            <div
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                activeStep === 1
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-md ring-2 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <div>
                  <div className="text-xs font-bold">المستقبل الحسي (الجلد / المغزل العصبي العضلي)</div>
                  <div className="text-[11px] text-slate-400">يلتقط التنبيه ويولد رسالة عصبية حسية</div>
                </div>
              </div>
              {condition === 'anesthetized_skin' && (
                <span className="text-[11px] text-red-400 font-bold px-2 py-0.5 bg-red-950/60 rounded border border-red-800">
                  مخدر بالإيثر ⛔
                </span>
              )}
            </div>

            {/* Step 2: Sensory Nerve / Dorsal Root */}
            <div
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                activeStep === 2
                  ? 'border-sky-400 bg-sky-500/20 text-sky-200 shadow-md ring-2 ring-sky-400/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <div>
                  <div className="text-xs font-bold">الليف الحسي الجابذ (الجذر الخلفي + العقدة الشوكية)</div>
                  <div className="text-[11px] text-slate-400">ينقل السيالة الحسية نحو النخاع الشوكي</div>
                </div>
              </div>
              {condition === 'cut_dorsal_root' && (
                <span className="text-[11px] text-red-400 font-bold px-2 py-0.5 bg-red-950/60 rounded border border-red-800">
                  مقطوع جراحياً ✂️
                </span>
              )}
            </div>

            {/* Step 3: Spinal Cord Grey Matter */}
            <div
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                activeStep === 3
                  ? 'border-purple-400 bg-purple-500/20 text-purple-200 shadow-md ring-2 ring-purple-400/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <div>
                  <div className="text-xs font-bold">المركز العصبي: النخاع الشوكي (المادة الرمادية والمشبك)</div>
                  <div className="text-[11px] text-slate-400">عصبون جامع يحوّل الرسالة الحسية لأمر حركي</div>
                </div>
              </div>
              {condition === 'spinal_decerebrate' && (
                <span className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-800">
                  دماغ مخرب / نخاع سليم 100%
                </span>
              )}
            </div>

            {/* Step 4: Motor Nerve / Ventral Root */}
            <div
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                activeStep === 4
                  ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-md ring-2 ring-indigo-400/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                  4
                </span>
                <div>
                  <div className="text-xs font-bold">الليف الحركي النابذ (الجذر الأمامي البطني)</div>
                  <div className="text-[11px] text-slate-400">ينقل الأمر بالتقلص إلى العضلة</div>
                </div>
              </div>
              {condition === 'cut_ventral_root' && (
                <span className="text-[11px] text-red-400 font-bold px-2 py-0.5 bg-red-950/60 rounded border border-red-800">
                  مقطوع جراحياً ✂️
                </span>
              )}
            </div>

            {/* Step 5: Effector Muscle */}
            <div
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                activeStep === 5 || didKicked
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-md ring-2 ring-emerald-400/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                  5
                </span>
                <div>
                  <div className="text-xs font-bold">العضو المنفذ: العضلة الهيكلية</div>
                  <div className="text-[11px] text-slate-400">تستجيب بالتقلص وسحب الساق/الطرف فوراً</div>
                </div>
              </div>
              {didKicked && (
                <span className="text-xs font-bold text-emerald-400 animate-bounce">
                  تقلص وانعكاس حركي! 🦵⚡
                </span>
              )}
            </div>
          </div>

          {/* Diagnostic status banner */}
          <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">الملاحظة السريرية: </span>
            <span className="text-slate-200 font-medium">{resultMessage}</span>
          </div>
        </div>

        {/* Controls Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Select Condition */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-white mb-2 block">
              الحالة التجريبية (تجارب الفصل والقطع):
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setCondition('normal'); resetLab(); }}
                className={`p-2 rounded-lg text-xs font-medium text-right border transition-all cursor-pointer ${
                  condition === 'normal'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                1. عضوية سليمة وطبيعية (شاهد)
              </button>
              <button
                onClick={() => { setCondition('cut_dorsal_root'); resetLab(); }}
                className={`p-2 rounded-lg text-xs font-medium text-right border transition-all cursor-pointer ${
                  condition === 'cut_dorsal_root'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                2. قطع الجذر الخلفي (الحسي ذو العقدة الشوكية)
              </button>
              <button
                onClick={() => { setCondition('cut_ventral_root'); resetLab(); }}
                className={`p-2 rounded-lg text-xs font-medium text-right border transition-all cursor-pointer ${
                  condition === 'cut_ventral_root'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                3. قطع الجذر الأمامي (الحركي)
              </button>
              <button
                onClick={() => { setCondition('anesthetized_skin'); resetLab(); }}
                className={`p-2 rounded-lg text-xs font-medium text-right border transition-all cursor-pointer ${
                  condition === 'anesthetized_skin'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                4. تخدير المستقبلات الحسية بالجلد
              </button>
              <button
                onClick={() => { setCondition('spinal_decerebrate'); resetLab(); }}
                className={`p-2 rounded-lg text-xs font-medium text-right border transition-all cursor-pointer ${
                  condition === 'spinal_decerebrate'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                5. حيوان شوكي (دماغ مخرب وسالمة النخاع)
              </button>
            </div>
          </div>

          {/* Stimulus slider */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                شدة المنبه الميكانيكي (وخز إبرة / ضربة مطرقة طبية):
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {stimulusIntensity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stimulusIntensity}
              onChange={(e) => setStimulusIntensity(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (بدون لمس)</span>
              <span>عتبة التنبيه (~30%)</span>
              <span>100% (تنبيه قوي فعال)</span>
            </div>

            <button
              onClick={applyStimulus}
              disabled={isStimulating}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isStimulating ? 'السيالة تسري عبر المسار العصبي...' : 'تطبيق التنبيه الفعال'}</span>
            </button>
          </div>

          {/* Key BEM Takeaway */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>خلاصة قانون ماجندي (تجارب الجذور):</span>
            </h4>
            <p className="text-xs text-indigo-900/90 dark:text-indigo-200/90 mt-1.5 leading-relaxed">
              الجذر الخلفي حسي حصراً؛ ينقل الإحساس من المحيط إلى المركز. وقطعه يؤدي إلى <strong>فقدان الحساسية مع بقاء الحركة</strong>. أما الجذر الأمامي فهو حركي حصراً؛ ينقل الأمر بالتقلص إلى العضلة، وقطعه يسبب <strong>شلالاً حركياً مع بقاء الحساسية</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

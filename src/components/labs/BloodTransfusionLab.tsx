import React, { useState } from 'react';
import { Droplet, AlertTriangle, CheckCircle2, RotateCcw, HeartHandshake, ShieldAlert } from 'lucide-react';

type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

interface GroupDetails {
  antigens: string[]; // Antigens on RBC membrane
  antibodies: string[]; // Antibodies in plasma
  label: string;
}

const BLOOD_PROPERTIES: Record<BloodGroup, GroupDetails> = {
  'O-': { antigens: [], antibodies: ['Anti-A', 'Anti-B', 'Anti-D (إذا تحسس)'], label: 'معطي عام مطلق (O-)' },
  'O+': { antigens: ['Rh (D)'], antibodies: ['Anti-A', 'Anti-B'], label: 'معطي لجميع الفصائل الموجبة' },
  'A-': { antigens: ['A'], antibodies: ['Anti-B', 'Anti-D (إذا تحسس)'], label: 'زمرة A سالبة' },
  'A+': { antigens: ['A', 'Rh (D)'], antibodies: ['Anti-B'], label: 'زمرة A موجبة شائعة' },
  'B-': { antigens: ['B'], antibodies: ['Anti-A', 'Anti-D (إذا تحسس)'], label: 'زمرة B سالبة' },
  'B+': { antigens: ['B', 'Rh (D)'], antibodies: ['Anti-A'], label: 'زمرة B موجبة' },
  'AB-': { antigens: ['A', 'B'], antibodies: ['Anti-D (إذا تحسس)'], label: 'زمرة AB سالبة' },
  'AB+': { antigens: ['A', 'B', 'Rh (D)'], antibodies: ['لا توجد أجسام مضادة في البلازما'], label: 'مستقبل عام مطلق (AB+)' },
};

export const BloodTransfusionLab: React.FC = () => {
  const [donor, setDonor] = useState<BloodGroup>('O+');
  const [recipient, setRecipient] = useState<BloodGroup>('A+');
  const [isTested, setIsTested] = useState<boolean>(false);

  // Check transfusion compatibility
  const checkCompatibility = (d: BloodGroup, r: BloodGroup): { compatible: boolean; reason: string } => {
    const dGroup = d.replace(/[+-]/, '');
    const dRh = d.includes('+');
    const rGroup = r.replace(/[+-]/, '');
    const rRh = r.includes('+');

    // ABO compatibility: donor RBC antigens must not clash with recipient plasma antibodies
    let aboOk = false;
    if (dGroup === 'O') aboOk = true;
    else if (dGroup === 'A' && (rGroup === 'A' || rGroup === 'AB')) aboOk = true;
    else if (dGroup === 'B' && (rGroup === 'B' || rGroup === 'AB')) aboOk = true;
    else if (dGroup === 'AB' && rGroup === 'AB') aboOk = true;

    // Rh compatibility: Rh- cannot receive Rh+ blood
    const rhOk = !(dRh && !rRh);

    if (!aboOk && !rhOk) {
      return {
        compatible: false,
        reason: `خطر مزدوج! وجود تعارض حاد في نظام ABO (أجسام مضادة في مصل المستقبل ضد مستضدات المتبرع) مع عدم توافق عامل الريزوس (نقل دم موجب ${d} لمستقبل سالب ${r}).`,
      };
    }
    if (!aboOk) {
      return {
        compatible: false,
        reason: `تعارض في نظام ABO! بلازما المستقبل (${r}) تحتوي على أجسام مضادة تهاجم فوراً مولدات الضد المتواجدة على غشاء كريات المتبرع (${d})، مسببة ارتصاصاً وتكتلاً دموياً خانقاً.`,
      };
    }
    if (!rhOk) {
      return {
        compatible: false,
        reason: `تعارض عامل الريزوس (Rh)! المتبرع يحمل مستضد D الإيجابي بينما المستقبل (${r}) سالب الريزوس وسيصنع أجساماً مضادة Anti-D تؤدي لتحلل الدم.`,
      };
    }

    return {
      compatible: true,
      reason: `عملية نقل دم متوافقة وآمنة 100%! لا تلتقي مولدات ضد كريات المتبرع مع أية أجسام مضادة في بلازما دم المستقبل.`,
    };
  };

  const result = checkCompatibility(donor, recipient);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <span>مختبر المناعة ونظام ABO & Rh</span>
            <span>·</span>
            <span>برنامج 4 متوسط BEM</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            محاكاة التوافق المناعي لنقل الدم وظاهرة الارتصاص (Agglutination)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            اختبار التوافق بين مختلف فصائل الدم، فحص مولدات الضد الغشائية والأجسام المضادة البلازمية
          </p>
        </div>

        <button
          onClick={() => { setDonor('O-'); setRecipient('AB+'); setIsTested(false); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Side: Simulation Vessel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            {/* Donor Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-950 text-center">
              <span className="text-[11px] font-bold text-slate-400">دم المتبرع المعطي (Donneur)</span>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 my-2 font-mono">
                {donor}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong>مولدات الضد على الكرية:</strong>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {BLOOD_PROPERTIES[donor].antigens.length > 0 ? (
                    BLOOD_PROPERTIES[donor].antigens.map((ag) => (
                      <span key={ag} className="text-[10px] px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 rounded">
                        مستضد {ag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">لا توجد مستضدات (كرية ملساء)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-950 text-center">
              <span className="text-[11px] font-bold text-slate-400">دم المستقبل المحتاج (Receveur)</span>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 my-2 font-mono">
                {recipient}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong>أجسام مضادة في البلازما:</strong>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {BLOOD_PROPERTIES[recipient].antibodies.length > 0 ? (
                    BLOOD_PROPERTIES[recipient].antibodies.map((ab) => (
                      <span key={ab} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 rounded">
                        {ab}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">لا توجد أجسام مضادة</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Microscopic Capillary Vessel Simulation */}
          <div className="my-6 p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-white min-h-[160px] flex flex-col justify-center items-center">
            <span className="text-xs font-semibold text-slate-400 mb-3">
              المعاينة المجهرية داخل الوريد الدموي:
            </span>

            {isTested ? (
              result.compatible ? (
                <div className="flex flex-col items-center gap-2 text-center animate-fade-in">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500 shadow-lg animate-pulse" />
                    <div className="w-6 h-6 rounded-full bg-rose-500 shadow-lg" />
                    <div className="w-6 h-6 rounded-full bg-rose-500 shadow-lg" />
                  </div>
                  <div className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>سريان طبيعي للدم دون أي ارتصاص أو تجلط!</span>
                  </div>
                  <span className="text-xs text-slate-300 max-w-md">
                    المغذيات والأكسجين تصل بسلاسة إلى جميع خلايا الجسم.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center animate-shake">
                  <div className="flex items-center gap-1 p-2 bg-red-950/80 border border-red-700 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-red-700 border-2 border-white flex items-center justify-center text-xs font-bold">
                      X
                    </div>
                    <div className="w-7 h-7 rounded-full bg-red-700 border-2 border-white flex items-center justify-center text-xs font-bold">
                      X
                    </div>
                    <div className="w-7 h-7 rounded-full bg-red-700 border-2 border-white flex items-center justify-center text-xs font-bold">
                      X
                    </div>
                  </div>
                  <div className="text-rose-400 font-bold text-sm flex items-center gap-1 mt-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>تكتل وارتصاص مناعي شديد (Agglutination)!</span>
                  </div>
                  <span className="text-xs text-rose-200 max-w-md">
                    تشكل خثرات دموية تسد الشعيرات وتمنع التروية مؤدية لمضاعفات خطيرة.
                  </span>
                </div>
              )
            ) : (
              <div className="text-center text-slate-400 text-xs py-4">
                اضغط على زر "فحص التوافق وحقن الدم" لمشاهدة الاستجابة المناعية في المجهر
              </div>
            )}
          </div>

          <button
            onClick={() => setIsTested(true)}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Droplet className="w-4 h-4" />
            <span>فحص التوافق وحقن عينة الدم</span>
          </button>
        </div>

        {/* Right Side: Blood Picker Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Donor Selection */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 block">
              اختر فصيلة دم المتبرع:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((g) => (
                <button
                  key={`donor-${g}`}
                  onClick={() => { setDonor(g); setIsTested(false); }}
                  className={`py-1.5 text-xs font-bold rounded-md font-mono transition-all cursor-pointer ${
                    donor === g
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 block">
              اختر فصيلة دم المستقبل:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((g) => (
                <button
                  key={`recip-${g}`}
                  onClick={() => { setRecipient(g); setIsTested(false); }}
                  className={`py-1.5 text-xs font-bold rounded-md font-mono transition-all cursor-pointer ${
                    recipient === g
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Diagnosis Card */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              {result.compatible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>التعليل العلمي المناعي:</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.reason}
            </p>
          </div>

          {/* BEM Rule Box */}
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block mb-1">
              قاعدة ذهبية لامتحان شهادة التعليم المتوسط:
            </span>
            <p className="text-xs text-rose-800/90 dark:text-rose-200/90 leading-relaxed">
              <strong>O-</strong> هو المعطي العام لأنه لا يحمل أي مولد ضد غشائي، بينما <strong>AB+</strong> هو المستقبل العام لأنه مصل دمه خالٍ من جميع الأجسام المضادة (Anti-A, Anti-B, Anti-Rh).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

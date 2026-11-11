import React, { useState } from 'react';
import { Play, RotateCcw, Thermometer, TestTube, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface TubeState {
  id: number;
  name: string;
  contents: string;
  hasSaliva: boolean;
  isBoiledSaliva: boolean;
  reagentAdded: 'none' | 'iodine' | 'fehling';
  isHeated: boolean;
  digestionProgress: number; // 0 to 100%
  color: string;
  resultText: string;
}

export const AmylaseStarchLab: React.FC = () => {
  const [temperature, setTemperature] = useState<number>(37); // 37°C default
  const [isIncubating, setIsIncubating] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number>(0);

  const [tubes, setTubes] = useState<TubeState[]>([
    {
      id: 1,
      name: 'الأنبوب (1): مطبوخ النشاء + لعابين طازج',
      contents: 'نشاء (1%) + إنزيم الأميلاز اللعابي',
      hasSaliva: true,
      isBoiledSaliva: false,
      reagentAdded: 'none',
      isHeated: false,
      digestionProgress: 0,
      color: 'bg-amber-50/60 border-slate-200',
      resultText: 'محلول معلق أبيض شبه شفاف قبل التفاعل',
    },
    {
      id: 2,
      name: 'الأنبوب (2): مطبوخ النشاء + ماء مقطر (أنبوب شاهد)',
      contents: 'نشاء (1%) + ماء مقطر فقط (غياب الإنزيم)',
      hasSaliva: false,
      isBoiledSaliva: false,
      reagentAdded: 'none',
      isHeated: false,
      digestionProgress: 0,
      color: 'bg-amber-50/60 border-slate-200',
      resultText: 'محلول نشاء نقي بدون إنزيم',
    },
    {
      id: 3,
      name: 'الأنبوب (3): مطبوخ النشاء + لعاب مغلى في 100°م',
      contents: 'نشاء (1%) + إنزيم مخرب بالحرارة العالية',
      hasSaliva: true,
      isBoiledSaliva: true,
      reagentAdded: 'none',
      isHeated: false,
      digestionProgress: 0,
      color: 'bg-amber-50/60 border-slate-200',
      resultText: 'لعاب تم تسخينه لدرجة الغليان قبل إضافته',
    },
  ]);

  // Incubate simulation
  const startIncubation = () => {
    setIsIncubating(true);
    let sec = 0;
    const interval = setInterval(() => {
      sec += 5;
      setTimerSeconds(sec);

      setTubes((prev) =>
        prev.map((t) => {
          let progress = t.digestionProgress;
          if (t.id === 1) {
            // Active if temp around 37°C
            if (temperature >= 30 && temperature <= 42) {
              progress = Math.min(100, progress + 35);
            } else if (temperature <= 10) {
              progress = Math.min(10, progress + 2); // Inactive/inhibited by cold
            } else if (temperature >= 70) {
              progress = 0; // Denatured
            }
          } else {
            progress = 0; // Tube 2 has no enzyme, Tube 3 has denatured enzyme
          }
          return { ...t, digestionProgress: progress };
        })
      );

      if (sec >= 15) {
        clearInterval(interval);
        setIsIncubating(false);
      }
    }, 600);
  };

  const addReagent = (reagent: 'iodine' | 'fehling') => {
    setTubes((prev) =>
      prev.map((t, index) => {
        if (index !== selectedTubeIndex) return t;

        let color = '';
        let resultText = '';

        if (reagent === 'iodine') {
          // Iodine test
          if (t.digestionProgress >= 90) {
            color = 'bg-amber-200/80 border-amber-400 text-amber-900';
            resultText = 'بقاء لون ماء اليود بني مصفر (غياب النشاء كلياً - تفكك بالكامل إلى مالتوز)';
          } else if (t.digestionProgress > 20) {
            color = 'bg-purple-300/80 border-purple-500 text-purple-950';
            resultText = 'لون بنفسجي محمر فاتح (تفكك جزئي للنشاء مع بقاء دكسترينات)';
          } else {
            color = 'bg-indigo-950 text-indigo-100 border-indigo-700';
            resultText = 'ظهور لون أزرق بنفسجي شديد وداكن (إيجابي: النشاء ما زال سليماً ولم يتفكك)';
          }
        } else if (reagent === 'fehling') {
          // Fehling test
          if (t.digestionProgress >= 80) {
            color = 'bg-red-600 text-white border-red-700 shadow-inner';
            resultText = 'تشكل راسب أحمر آجوري كثيف بعد التسخين (إيجابي: وجود سكر مرجع كـ المالتوز)';
          } else if (t.digestionProgress > 0) {
            color = 'bg-orange-500 text-white border-orange-600';
            resultText = 'ظهور راسب أحمر آجوري خفيف (كمية قليلة من السكر المرجع)';
          } else {
            color = 'bg-blue-600 text-white border-blue-700';
            resultText = 'بقاء المحلول أزرق ناصع دون تشكل راسب (سلبي: غياب السكريات المرجعة)';
          }
        }

        return {
          ...t,
          reagentAdded: reagent,
          color,
          resultText,
          isHeated: reagent === 'fehling',
        };
      })
    );
  };

  const resetExperiment = () => {
    setTimerSeconds(0);
    setIsIncubating(false);
    setTubes([
      {
        id: 1,
        name: 'الأنبوب (1): مطبوخ النشاء + لعابين طازج',
        contents: 'نشاء (1%) + إنزيم الأميلاز اللعابي',
        hasSaliva: true,
        isBoiledSaliva: false,
        reagentAdded: 'none',
        isHeated: false,
        digestionProgress: 0,
        color: 'bg-amber-50/60 border-slate-200',
        resultText: 'محلول معلق أبيض شبه شفاف قبل التفاعل',
      },
      {
        id: 2,
        name: 'الأنبوب (2): مطبوخ النشاء + ماء مقطر (أنبوب شاهد)',
        contents: 'نشاء (1%) + ماء مقطر فقط (غياب الإنزيم)',
        hasSaliva: false,
        isBoiledSaliva: false,
        reagentAdded: 'none',
        isHeated: false,
        digestionProgress: 0,
        color: 'bg-amber-50/60 border-slate-200',
        resultText: 'محلول نشاء نقي بدون إنزيم',
      },
      {
        id: 3,
        name: 'الأنبوب (3): مطبوخ النشاء + لعاب مغلى في 100°م',
        contents: 'نشاء (1%) + إنزيم مخرب بالحرارة العالية',
        hasSaliva: true,
        isBoiledSaliva: true,
        reagentAdded: 'none',
        isHeated: false,
        digestionProgress: 0,
        color: 'bg-amber-50/60 border-slate-200',
        resultText: 'لعاب تم تسخينه لدرجة الغليان قبل إضافته',
      },
    ]);
  };

  const currentTube = tubes[selectedTubeIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <span>تجربة مخبرية تفاعلية</span>
            <span>·</span>
            <span>برنامج 4 متوسط BEM & 1 متوسط</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            مختبر الهضم الإنزيمي للنشاء وتأثير درجة الحرارة
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            دراسة التفكك الجزيئي للنشاء المعقد بفعل الأميلاز اللعابي في حمام مائي ومقارنة الكواشف الكيميائية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetExperiment}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة التجربة</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Zone: Interactive Test Tubes Visual (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              حوض الحمام المائي (Bain-marie): {temperature}° مئوية
            </span>
            <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>الزمن المخبري: {timerSeconds} دقيقة</span>
            </div>
          </div>

          {/* Test Tubes Rack Visual */}
          <div className="grid grid-cols-3 gap-4 my-6">
            {tubes.map((tube, idx) => {
              const isSelected = idx === selectedTubeIndex;
              return (
                <div
                  key={tube.id}
                  onClick={() => setSelectedTubeIndex(idx)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    الأنبوب ({tube.id})
                  </span>

                  {/* Physical Tube Vessel */}
                  <div className="relative w-14 h-48 rounded-b-full border-4 border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 overflow-hidden flex flex-col justify-end p-1">
                    {/* Liquid fill */}
                    <div
                      className={`w-full rounded-b-full transition-all duration-700 border-t ${tube.color}`}
                      style={{
                        height: `${Math.max(45, 45 + tube.digestionProgress * 0.4)}%`,
                      }}
                    >
                      {/* Molecules simulation */}
                      <div className="flex flex-wrap gap-1 p-1 justify-center opacity-70">
                        {tube.digestionProgress >= 90 ? (
                          <div className="text-[9px] text-center font-bold text-slate-700 dark:text-slate-200">
                            مالتوز (ثنائي)
                          </div>
                        ) : (
                          <div className="text-[9px] text-center font-bold">
                            نشاء (معقد)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 text-center line-clamp-1">
                    {tube.reagentAdded === 'none'
                      ? 'بدون كاشف'
                      : tube.reagentAdded === 'iodine'
                      ? 'ماء اليود'
                      : 'فهلنك + تسخين'}
                  </span>

                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    تفكك: {tube.digestionProgress}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Tube Status Box */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  نتيجة فحص {currentTube.name}:
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {currentTube.resultText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone: Controls & Chemical Reagents Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Temperature Controls */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                درجة حرارة الحمام المائي:
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {temperature}°C
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => setTemperature(0)}
                className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  temperature === 0
                    ? 'bg-sky-500 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                0°C (جليد - تجميد النشاط)
              </button>
              <button
                onClick={() => setTemperature(37)}
                className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  temperature === 37
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                37°C (حرارة الجسم المثلى)
              </button>
              <button
                onClick={() => setTemperature(100)}
                className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  temperature === 100
                    ? 'bg-rose-600 text-white border-rose-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                100°C (غليان - تخريب دائم)
              </button>
            </div>

            <button
              onClick={startIncubation}
              disabled={isIncubating}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isIncubating ? 'جارٍ التحضين في الحمام المائي...' : 'بدء التحضين الزمني (15 دقيقة)'}</span>
            </button>
          </div>

          {/* Reagents Injection */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              إضافة الكواشف إلى الأنبوب المحدد ({currentTube.id}):
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => addReagent('iodine')}
                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 transition-all text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      قطرات من ماء اليود
                    </div>
                    <div className="text-[11px] text-slate-500">
                      يكشف عن سكر النشاء المعقد (أزرق بنفسجي = إيجابي)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  حقن الكاشف
                </span>
              </button>

              <button
                onClick={() => addReagent('fehling')}
                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-red-400 transition-all text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      محلول فهلنك (A+B) مع التسخين
                    </div>
                    <div className="text-[11px] text-slate-500">
                      يكشف عن السكريات المرجعة البسيطة كالمالتوز (أحمر آجوري)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                  تسخين واختبار
                </span>
              </button>
            </div>
          </div>

          {/* Scientific Conclusion Callout */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>الاستنتاج المنهجي لاختبار شهادة BEM:</span>
            </h4>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 mt-1.5 leading-relaxed">
              يتميز إنزيم اللعابين (الأميلاز) بـ <strong>التخصص النوعي</strong> حيث يفكك جزيئة النشاء المعقدة إلى سكر شعير (مالتوز) في درجة حرارة الجسم (37°م). في درجة 0°م يثبط مؤقتاً ويمكن استرجاع نشاطه بالتدفئة، أما في 100°م فيخرب نهائياً لأن الإنزيم بروتين يتلف بالحرارة المرتفعة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

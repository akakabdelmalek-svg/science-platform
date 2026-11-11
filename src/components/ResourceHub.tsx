import React, { useState } from 'react';
import { 
  FileText, Upload, Download, Search, Filter, CheckCircle2, 
  Sparkles, FileSpreadsheet, Presentation, FileCode, Clock, User, X
} from 'lucide-react';
import { EducationalResource, FileCategory } from '../types/resources';
import { INITIAL_RESOURCES } from '../data/resourcesData';
import { GradeLevel } from '../types/science';

export const ResourceHub: React.FC = () => {
  const [resources, setResources] = useState<EducationalResource[]>(INITIAL_RESOURCES);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newFormat, setNewFormat] = useState<'pptx' | 'docx' | 'xlsx' | 'pdf'>('pptx');
  const [newCategory, setNewCategory] = useState<FileCategory>('lesson_ppt');
  const [newGrade, setNewGrade] = useState<GradeLevel>('4AM');
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newAuthorRole, setNewAuthorRole] = useState<string>('أستاذ مادة علوم الطبيعة والحياة');
  const [previewPoint1, setPreviewPoint1] = useState<string>('');
  const [previewPoint2, setPreviewPoint2] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownload = (res: EducationalResource) => {
    // Simulate instant download with feedback
    showToast(`جارٍ تحميل الملف: ${res.title} (${res.format.toUpperCase()})`);
    
    // Create a client-side simulated blob file download
    const blob = new Blob([
      `منصة علوم الطبيعة والحياة - الطور المتوسط\n\nالعنوان: ${res.title}\nالمستوى: ${res.grade}\nالأستاذ المعد: ${res.author}\n\nأهم محاور الملف:\n${res.previewPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nتم التحميل من منصة علوم الطبيعة والحياة للطور المتوسط.`
    ], { type: 'text/plain;charset=utf-8' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.title.replace(/[\s/\\:]/g, '_')}.${res.format === 'pptx' ? 'ppt' : res.format === 'docx' ? 'doc' : res.format === 'xlsx' ? 'xls' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Increment downloads count locally
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('يرجى ملء عنوان الملف والوصف المختصر.');
      return;
    }

    const created: EducationalResource = {
      id: `res-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      format: newFormat,
      fileCategory: newCategory,
      grade: newGrade,
      trimester: 1,
      author: newAuthor.trim() || 'أستاذ مساهم',
      authorRole: newAuthorRole.trim(),
      fileSize: newFormat === 'pptx' ? '3.5 MB' : newFormat === 'docx' ? '850 KB' : '220 KB',
      downloadsCount: 1,
      uploadedDate: new Date().toISOString().split('T')[0],
      previewPoints: [
        previewPoint1.trim() || 'ملخص شامل للمفاهيم الأساسية المقررة',
        previewPoint2.trim() || 'تطبيقات وتمارين داعمة لمنهاج علوم الطبيعة والحياة',
      ],
    };

    setResources([created, ...resources]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewDesc('');
    setPreviewPoint1('');
    setPreviewPoint2('');
    showToast('تم إرسال ونشر الملف التعليمي بنجاح في المنصة!');
  };

  const filteredResources = resources.filter((res) => {
    const matchesFormat = selectedFormat === 'all' || res.format === selectedFormat;
    const matchesGrade = selectedGrade === 'all' || res.grade === selectedGrade;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFormat && matchesGrade && matchesSearch;
  });

  const getFormatBadge = (fmt: string) => {
    switch (fmt) {
      case 'pptx':
        return { label: 'PowerPoint', color: 'bg-orange-500 text-white', icon: Presentation };
      case 'docx':
        return { label: 'Word', color: 'bg-blue-600 text-white', icon: FileText };
      case 'xlsx':
        return { label: 'Excel', color: 'bg-emerald-600 text-white', icon: FileSpreadsheet };
      case 'pdf':
        return { label: 'PDF', color: 'bg-rose-600 text-white', icon: FileCode };
      default:
        return { label: fmt.toUpperCase(), color: 'bg-slate-700 text-white', icon: FileText };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
              <span>مستودع الموارد الرقمية والملفات التعليمية</span>
              <span>·</span>
              <span>PowerPoint · Word · Excel · PDF</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              بنك الدروس والعروض التقديمية وملفات الحساب
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              تحميل وإرسال مذكرات الدروس بصيغ Word، عروض PowerPoint التفاعلية، جداول Excel لحساب الكتلة الحية والرواتب الغذائية، ونماذج الفروض الرسمية المعتمدة في الطور المتوسط.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>إرسال ومشاركة درس جديد (PPT / Word / Excel)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Formats Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'جميع الصيغ' },
            { id: 'pptx', label: 'PowerPoint (.pptx)' },
            { id: 'docx', label: 'Word (.docx)' },
            { id: 'xlsx', label: 'Excel (.xlsx)' },
            { id: 'pdf', label: 'PDF (.pdf)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedFormat === f.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grade Filter & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as any)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">كل المستويات</option>
            <option value="4AM">4 متوسط (BEM)</option>
            <option value="3AM">3 متوسط</option>
            <option value="2AM">2 متوسط</option>
            <option value="1AM">1 متوسط</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث في أسماء الملفات والأساتذة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const badge = getFormatBadge(res.format);
          const IconComponent = badge.icon;

          return (
            <div
              key={res.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${badge.color}`}>
                    <IconComponent className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {res.grade === '4AM' ? '4 متوسط (BEM)' : `${res.grade.replace('AM', '')} متوسط`}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Preview Points */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    أهم محاور هذا الملف:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    {res.previewPoints.slice(0, 3).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500">·</span>
                        <span className="line-clamp-1">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer info & Download button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <div>{res.author}</div>
                  <div>الحجم: {res.fileSize} · {res.downloadsCount} تحميلاً</div>
                </div>

                <button
                  onClick={() => handleDownload(res)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الملف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>إرسال ومشاركة درس أو مذكرة جديدة</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان الملف التعليمي:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عرض PowerPoint لمراحل تشكل الأمشاج والانقسام المنصف"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    صيغة الملف (Format):
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="pptx">PowerPoint Presentation (.pptx)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                    <option value="pdf">Document PDF (.pdf)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المستوى المستهدف:
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="4AM">4 متوسط (BEM)</option>
                    <option value="3AM">3 متوسط</option>
                    <option value="2AM">2 متوسط</option>
                    <option value="1AM">1 متوسط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم الأستاذ أو المعد:
                </label>
                <input
                  type="text"
                  placeholder="مثال: الأستاذ بن عيسى رابح"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  وصف الملف وأهدافه التعليمية:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="اشرح محتوى الملف وما يميزه عن غيره..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  نقاط المعاينة الرئيسية في الملف:
                </label>
                <input
                  type="text"
                  placeholder="النقطة 1: مخطط تفصيلي عالي الدقة..."
                  value={previewPoint1}
                  onChange={(e) => setPreviewPoint1(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="النقطة 2: أسئلة استرجاع معارف واستدلال..."
                  value={previewPoint2}
                  onChange={(e) => setPreviewPoint2(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                >
                  إرسال ونشر الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

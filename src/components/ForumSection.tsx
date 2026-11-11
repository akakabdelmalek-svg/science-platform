import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Search, ShieldCheck, ThumbsUp, CheckCircle, 
  Paperclip, FileText, Send, AlertTriangle, Eye, User, Sparkles, Filter, 
  Download, HelpCircle, X, ShieldAlert, Award
} from 'lucide-react';
import { ForumTopic, ForumReply, ForumAttachment } from '../types/forum';
import { INITIAL_FORUM_TOPICS, MODERATION_RULES } from '../data/forumData';
import { GradeLevel } from '../types/science';

export const ForumSection: React.FC = () => {
  const [topics, setTopics] = useState<ForumTopic[]>(INITIAL_FORUM_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewTopicModal, setShowNewTopicModal] = useState<boolean>(false);
  const [showModerationModal, setShowModerationModal] = useState<boolean>(false);

  // New Topic Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('4AM');
  const [newDomain, setNewDomain] = useState<string>('human_health');
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('BEM, العلوم');
  const [newAttachmentName, setNewAttachmentName] = useState<string>('');
  const [newAttachmentType, setNewAttachmentType] = useState<'powerpoint' | 'word' | 'excel' | 'pdf'>('powerpoint');

  // Reply Form State
  const [replyText, setReplyText] = useState<string>('');
  const [replyAuthor, setReplyAuthor] = useState<string>('');
  const [replyRole, setReplyRole] = useState<'student' | 'teacher'>('student');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upvote Topic
  const handleUpvoteTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic((prev) => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    }
    showToast('شكراً لتفاعلك! تم تسجيل تصويتك الإيجابي.');
  };

  // Upvote Reply
  const handleUpvoteReply = (replyId: string) => {
    if (!selectedTopic) return;
    const updatedReplies = selectedTopic.replies.map((r) =>
      r.id === replyId ? { ...r, upvotes: r.upvotes + 1 } : r
    );
    const updatedTopic = { ...selectedTopic, replies: updatedReplies };
    setSelectedTopic(updatedTopic);
    setTopics((prev) => prev.map((t) => (t.id === selectedTopic.id ? updatedTopic : t)));
    showToast('تم تسجيل تصويتك للإجابة.');
  };

  // Report Topic
  const handleReportTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, isReported: true } : t))
    );
    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic((prev) => prev ? { ...prev, isReported: true } : null);
    }
    showToast('تم إرسال البلاغ لفريق الإشراف التربوي للمراجعة والتدقيق.');
  };

  // Submit New Topic
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('يرجى ملء عنوان السؤال والمحتوى العلمي.');
      return;
    }

    const attachments: ForumAttachment[] = [];
    if (newAttachmentName.trim()) {
      attachments.push({
        id: `att-${Date.now()}`,
        name: newAttachmentName.trim(),
        type: newAttachmentType,
        size: '1.5 MB',
        uploadedAt: 'الآن',
      });
    }

    const created: ForumTopic = {
      id: `topic-${Date.now()}`,
      title: newTitle.trim(),
      grade: newGrade,
      domain: newDomain,
      authorName: newAuthor.trim() || 'تلميذ مجتهد',
      authorRole: 'student',
      authorAvatar: '👨‍🎓',
      content: newContent.trim(),
      createdAt: 'الآن',
      views: 1,
      upvotes: 0,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      attachments,
      replies: [],
    };

    setTopics([created, ...topics]);
    setShowNewTopicModal(false);
    setNewTitle('');
    setNewContent('');
    setNewAttachmentName('');
    showToast('تم نشر سؤالك بنجاح في منتدى العلوم!');
  };

  // Submit Reply
  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !replyText.trim()) return;

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      topicId: selectedTopic.id,
      authorName: replyAuthor.trim() || (replyRole === 'teacher' ? 'الأستاذ المشرف' : 'تلميذ مشارك'),
      authorRole: replyRole,
      authorAvatar: replyRole === 'teacher' ? '👨‍🏫' : '👩‍🎓',
      content: replyText.trim(),
      createdAt: 'الآن',
      upvotes: 0,
      isTeacherVerified: replyRole === 'teacher',
    };

    const updatedReplies = [...selectedTopic.replies, newReply];
    const updatedTopic = { ...selectedTopic, replies: updatedReplies };

    setSelectedTopic(updatedTopic);
    setTopics((prev) => prev.map((t) => (t.id === selectedTopic.id ? updatedTopic : t)));
    setReplyText('');
    showToast('تمت إضافة إجابتك ومشاركتها في الموضوع.');
  };

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchesGrade = selectedGrade === 'all' || t.grade === selectedGrade;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner with Moderation Notice */}
      <div className="bg-gradient-to-l from-indigo-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>منتدى علوم الطبيعة والحياة للطور المتوسط · بيئة تعليمية آمنة ومراقبة</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              مجتمع التساؤلات العلمية وتبادل الموارد التعليمية
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              اطرح أسئلتك، شارك استفساراتك حول الدروس والتجارب، تفاعل مع إجابات زملائك، وتبادل عروض PowerPoint وملفات Word و Excel الخاصة بالمنهاج تحت إشراف نخبة من أساتذة المادة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowModerationModal(true)}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>ميثاق الأمان والإشراف</span>
            </button>
            <button
              onClick={() => setShowNewTopicModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>طرح سؤال أو مشاركة مورد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Forum View: Master / Detail */}
      {selectedTopic ? (
        /* Single Topic Thread View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              <span>← العودة لجميع المناقشات</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleReportTopic(selectedTopic.id, e)}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>إبلاغ المشرف</span>
              </button>
              <button
                onClick={(e) => handleUpvoteTopic(selectedTopic.id, e)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-md cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>إعجاب ({selectedTopic.upvotes})</span>
              </button>
            </div>
          </div>

          {/* Original Question Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTopic.authorAvatar || '👨‍🎓'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedTopic.authorName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {selectedTopic.authorRole === 'teacher' ? 'أستاذ المادة' : 'تلميذ'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{selectedTopic.createdAt}</span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                {selectedTopic.grade}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-4">
              {selectedTopic.title}
            </h3>

            <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
              {selectedTopic.content}
            </p>

            {/* Attachments Section (PowerPoint, Word, Excel) */}
            {selectedTopic.attachments && selectedTopic.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الموارد والملفات التعليمية المرفقة ({selectedTopic.attachments.length}):</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTopic.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-[10px] shrink-0 ${
                          att.type === 'powerpoint' ? 'bg-orange-600' : att.type === 'word' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}>
                          {att.type === 'powerpoint' ? 'PPT' : att.type === 'word' ? 'DOC' : 'XLS'}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {att.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {att.size} · تم الرفع {att.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => showToast(`جارٍ تحميل الملف: ${att.name}`)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors shrink-0 cursor-pointer"
                        title="تحميل الملف"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Replies Section */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>الإجابات والمناقشات العلمية ({selectedTopic.replies.length}):</span>
              <span className="text-xs font-normal text-slate-500">
                إجابات الأساتذة معتمدة وتتبع منهجية التصحيح
              </span>
            </h4>

            {selectedTopic.replies.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
                لا توجد إجابات بعد. كن أول من يجيب ويساعد زميلك!
              </div>
            ) : (
              selectedTopic.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    reply.isTeacherVerified
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{reply.authorAvatar || '👤'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {reply.authorName}
                          </span>
                          {reply.isTeacherVerified && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>إجابة أستاذ معتمدة</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{reply.createdAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpvoteReply(reply.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{reply.upvotes}</span>
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pr-10">
                    {reply.content}
                  </p>
                </div>
              ))
            )}

            {/* Add Reply Input */}
            <form onSubmit={handleAddReply} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  أضف إجابتك أو تعقيبك العلمي:
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={replyRole === 'student'}
                      onChange={() => setReplyRole('student')}
                      className="accent-emerald-600"
                    />
                    <span>تلميذ</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={replyRole === 'teacher'}
                      onChange={() => setReplyRole('teacher')}
                      className="accent-emerald-600"
                    />
                    <span>أستاذ المادة</span>
                  </label>
                </div>
              </div>

              <input
                type="text"
                placeholder="اسمك أو لقبك الدراسي (اختياري)..."
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />

              <textarea
                rows={3}
                placeholder="اكتب إجابتك بالتفصيل مع التعليل العلمي ومنهجية المادة..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full text-xs md:text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-400">
                  تخضع جميع الإجابات للمراجعة الإشرافية لضمان الدقة والأمان.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر الإجابة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Forum Topics Master List */
        <div className="space-y-4">
          {/* Controls Bar: Filters and Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Grade Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto w-full md:w-auto">
              {(['all', '1AM', '2AM', '3AM', '4AM'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedGrade === grade
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {grade === 'all'
                    ? 'جميع المستويات'
                    : grade === '4AM'
                    ? '4 متوسط (BEM)'
                    : `${grade.replace('AM', '')} متوسط`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="ابحث في الأسئلة والموارد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Topics Grid / Cards */}
          <div className="space-y-3">
            {filteredTopics.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                لم يتم العثور على أية تساؤلات مطابقة لبحثك. يمكنك طرح سؤال جديد الآن!
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm ${
                    topic.isPinned ? 'border-amber-300/80 dark:border-amber-700/60' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {topic.grade === 'all' ? 'عام' : topic.grade}
                        </span>
                        <span>·</span>
                        <span>{topic.authorName}</span>
                        <span>·</span>
                        <span>{topic.createdAt}</span>
                        {topic.isPinned && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 font-bold">📌 مثبت من الأستاذ</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {topic.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {topic.content}
                      </p>

                      {/* Attachments pills and tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        {topic.attachments && topic.attachments.length > 0 && (
                          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>مرفقات:</span>
                            {topic.attachments.map((att) => (
                              <span key={att.id} className="underline">
                                {att.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-r border-slate-100 dark:border-slate-800 md:pr-4">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-bold">{topic.replies.length} إجابة</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold">{topic.upvotes} إعجاب</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>طرح سؤال علمي جديد أو إرفاق مورد</span>
              </h3>
              <button
                onClick={() => setShowNewTopicModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان السؤال أو الموضوع:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كيف أفسر منحنى هضم النشاء في الفم والمعي؟"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المستوى الدراسي:
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as GradeLevel)}
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
                    اسم السائل:
                  </label>
                  <input
                    type="text"
                    placeholder="اسمك أو لقبك..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  نص السؤال والمشكلة العلمية:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اشرح استفسارك بالتفصيل وسياق التجربة أو التمرين..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Attach File Section */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  إرفاق ملف تعليمي (PowerPoint, Word, Excel, PDF):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="اسم الملف (مثال: ملخص_الهضم.pptx)"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    className="col-span-2 text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <select
                    value={newAttachmentType}
                    onChange={(e) => setNewAttachmentType(e.target.value as any)}
                    className="text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="powerpoint">PowerPoint (.pptx)</option>
                    <option value="word">Word (.docx)</option>
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF (.pdf)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                >
                  نشر السؤال في المنتدى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Rules Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>ميثاق الأمان والإشراف التربوي للمنتدى</span>
              </h3>
              <button
                onClick={() => setShowModerationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {MODERATION_RULES.map((rule) => (
                <div key={rule.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowModerationModal(false)}
                className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                فهمت وأوافق على ميثاق الأمان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  User,
  Info,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { useAuth } from '@/src/features/auth';
import {
  CONSULTATION_TOPICS,
  getInitialChatMessages,
  ChatMessage,
  ConsultationTopic,
} from '../index';
import { askGeminiConsultationAction } from '@/src/lib/gemini';
import { MarkdownRenderer } from '@/src/shared/components/markdown';

const createMsgId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
const getFormattedTimestamp = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

export default function ConsultationView() {
  const { user } = useAuth();
  const userName = user?.name || '';
  const storageKey = `femory_chat_history_${user?.id || 'guest'}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`femory_chat_history_${user?.id || 'guest'}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse chat from localStorage', e);
      }
    }
    return getInitialChatMessages(userName);
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync with localStorage when user changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat from localStorage', e);
    }
    setMessages(getInitialChatMessages(user?.name));
  }, [storageKey, user?.name]);

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to localStorage', e);
    }
  }, [messages, storageKey]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleCopyText = (text: string, id: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: createMsgId('usr'),
      sender: 'user',
      text,
      timestamp: getFormattedTimestamp(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      // Call Real Gemini API Server Action with sanitized user context
      const res = await askGeminiConsultationAction(
        text,
        updatedHistory.map(m => ({ sender: m.sender, text: m.text })),
        { name: user?.name },
      );

      const assistantMsg: ChatMessage = {
        id: createMsgId(res.success ? 'ai' : 'ai_warn'),
        sender: 'assistant',
        text: res.answer,
        timestamp: getFormattedTimestamp(),
        errorType: res.errorType,
        isError: !res.success,
        references: res.references,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Gemini Consultation Error:', err);
      const errorMsg: ChatMessage = {
        id: createMsgId('ai_err'),
        sender: 'assistant',
        text: 'Asisten TTD sedang tidak tersedia untuk sementara karena batas penggunaan telah tercapai atau kendala jaringan. Silakan coba kembali nanti. Anda tetap dapat membaca artikel dan informasi Tablet Tambah Darah yang tersedia di aplikasi.',
        timestamp: getFormattedTimestamp(),
        isError: true,
        errorType: 'SERVER_ERROR',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('Failed to remove chat from localStorage', e);
      }
    }
    setMessages(getInitialChatMessages(user?.name));
  };

  return (
    <div className='flex flex-col gap-2 sm:gap-3 w-full h-[calc(100dvh-120px)] md:h-[calc(100dvh-140px)] -mb-20 md:mb-0 overflow-hidden'>
      {/* Screen Title Header (Shrink-0) */}
      <div className='shrink-0 flex items-center justify-between gap-2 pb-0.5'>
        <div>
          <h2 className='text-base sm:text-xl md:text-2xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-1.5'>
            <span>Konsultasi AI TTD</span>
            <span className='text-sm sm:text-base'>🌸</span>
          </h2>
          <p className='text-[11px] sm:text-xs text-[#64748b] leading-none mt-0.5'>
            Tanya jawab seputar Tablet Tambah Darah, nutrisi zat besi, & cegah anemia
          </p>
        </div>

        <button
          type='button'
          onClick={handleResetChat}
          className='inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#e11d48] rounded-xl hover:bg-rose-50 transition-colors border border-[#fce7f3] bg-white cursor-pointer shadow-2xs shrink-0 active:scale-95'
          title='Reset Percakapan'
          aria-label='Reset Chat'
        >
          <RotateCcw size={13} />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Main Responsive Grid Layout (Flex-1 Min-h-0) */}
      <div className='flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5 items-stretch h-full overflow-hidden'>
        {/* LEFT PANEL: Suggested Questions & Topics (Visible on md+) */}
        <div className='hidden md:flex md:col-span-4 flex-col gap-3.5 h-full min-h-0 overflow-y-auto pr-1'>
          <Card padding='md' className='shrink-0 bg-gradient-to-br from-[#fff5f7] to-[#ffe4e6]'>
            <div className='flex items-center gap-2.5 mb-2'>
              <div className='w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20'>
                <Bot size={20} />
              </div>
              <div>
                <h4 className='text-xs font-bold text-[#1e293b]'>Asisten Cerdas TTD</h4>
                <span className='text-[10px] text-[#059669] font-semibold'>
                  ● Terhubung Database Edukasi
                </span>
              </div>
            </div>
            <p className='text-xs text-[#475569] leading-relaxed'>
              Siap memberikan edukasi resmi seputar cara minum TTD, tips adaptasi efek samping mual,
              dan nutrisi penambah zat besi.
            </p>
          </Card>

          <Card
            padding='md'
            className='flex-1 min-h-0 flex flex-col justify-between overflow-y-auto'
          >
            <div>
              <h4 className='text-xs font-bold text-[#1e293b] mb-2.5 flex items-center gap-1.5'>
                <Sparkles size={13} className='text-[#e11d48]' />
                <span>Pertanyaan Populer TTD:</span>
              </h4>

              <div className='space-y-2'>
                {CONSULTATION_TOPICS.map((topic: ConsultationTopic) => (
                  <button
                    key={topic.id}
                    type='button'
                    onClick={() => handleTopicClick(topic.prompt)}
                    className='w-full text-left p-2.5 bg-[#fff5f7] hover:bg-[#ffe4e6] rounded-xl border border-[#fce7f3] transition-all text-xs font-medium text-[#1e293b] flex items-center justify-between group cursor-pointer'
                  >
                    <div className='flex items-center gap-2 pr-2'>
                      <span className='text-base'>{topic.icon}</span>
                      <span className='line-clamp-2'>{topic.title}</span>
                    </div>
                    <ChevronRight
                      size={14}
                      className='text-[#94a3b8] group-hover:text-[#e11d48] shrink-0'
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className='mt-3 pt-2.5 border-t border-[#fce7f3] flex items-start gap-1.5 text-[10px] text-[#64748b] shrink-0'>
              <Info size={13} className='text-rose-500 shrink-0 mt-0.5' />
              <span>
                Diselaraskan dengan pedoman Kemenkes RI & artikel resmi FEMORY untuk suplementasi
                remaja putri.
              </span>
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: Chat Conversation (md:col-span-8) */}
        <div className='md:col-span-8 h-full min-h-0 flex flex-col overflow-hidden'>
          {/* Mobile-Only Horizontal Chips Bar (Shrink-0) */}
          <div className='shrink-0 flex md:hidden items-center gap-1.5 overflow-x-auto pb-1.5 mb-1 no-scrollbar overscroll-x-contain'>
            {CONSULTATION_TOPICS.map((topic: ConsultationTopic) => (
              <button
                key={topic.id}
                type='button'
                onClick={() => handleTopicClick(topic.prompt)}
                className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-[#475569] text-[11px] font-medium rounded-full border border-[#fce7f3] hover:bg-[#fff1f2] hover:text-[#e11d48] transition-all shrink-0 cursor-pointer shadow-2xs whitespace-nowrap active:scale-95'
              >
                <span>{topic.icon}</span>
                <span>{topic.title}</span>
              </button>
            ))}
          </div>

          <Card
            padding='none'
            className='flex-1 min-h-0 flex flex-col overflow-hidden bg-[#fffdfd] shadow-sm border border-[#fce7f3] p-2.5 sm:p-4 rounded-2xl'
          >
            {/* Scrollable Message List */}
            <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-3 pb-2 overscroll-contain'>
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                const hasError = Boolean(msg.isError);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                        isUser
                          ? 'bg-rose-500'
                          : hasError
                            ? 'bg-amber-500 shadow-xs'
                            : 'bg-gradient-to-tr from-rose-600 to-rose-400 shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <User size={14} className='sm:w-4 sm:h-4' />
                      ) : hasError ? (
                        <AlertTriangle size={14} className='sm:w-4 sm:h-4' />
                      ) : (
                        <Bot size={14} className='sm:w-4 sm:h-4' />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
                        isUser
                          ? 'bg-[#e11d48] text-white rounded-tr-none'
                          : hasError
                            ? 'bg-rose-50/90 text-[#1e293b] border border-rose-200 rounded-tl-none'
                            : 'bg-white text-[#1e293b] border border-[#fce7f3] rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className='whitespace-pre-wrap break-words'>{msg.text}</p>
                      ) : (
                        <MarkdownRenderer
                          content={msg.text}
                          className='text-xs sm:text-sm [&_p]:text-xs [&_p]:sm:text-sm [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:text-xs [&_li]:sm:text-sm [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h1]:my-2 [&_h2]:my-1.5 [&_h3]:my-1.5 break-words overflow-hidden'
                        />
                      )}

                      {/* Rujukan artikel sederhana (link saja) */}
                      {!isUser && msg.references && msg.references.length > 0 && (
                        <div className='mt-2.5 pt-2 border-t border-rose-100 flex flex-wrap items-center gap-1.5 text-xs'>
                          <span className='text-[11px] font-semibold text-rose-700 flex items-center gap-1 shrink-0'>
                            <BookOpen size={11} className='text-rose-500' />
                            <span>Rujukan:</span>
                          </span>
                          {msg.references.map(ref => (
                            <Link
                              key={ref.id}
                              to={`/user/education/${ref.id}`}
                              className='inline-flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-900 font-medium hover:underline bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200/60 transition-colors'
                            >
                              <span className='line-clamp-1 max-w-[200px]'>{ref.title}</span>
                              <ChevronRight size={10} className='text-rose-400 shrink-0' />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Error Banner with Direct Education Link */}
                      {hasError && (
                        <div className='mt-2.5 pt-2 border-t border-rose-200/80 flex flex-wrap items-center justify-between gap-1.5'>
                          <span className='text-[10px] text-rose-700 font-medium flex items-center gap-1'>
                            <AlertTriangle size={11} className='text-rose-600 shrink-0' />
                            <span>
                              {msg.errorType === 'QUOTA_EXCEEDED'
                                ? 'Batas kuota layanan tercapai'
                                : 'Layanan asisten sementara tidak tersedia'}
                            </span>
                          </span>
                          <Link
                            to={
                              msg.references && msg.references.length > 0
                                ? `/user/education/${msg.references[0].id}`
                                : '/user/education'
                            }
                            className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md border border-rose-200 transition-colors shrink-0'
                          >
                            <BookOpen size={10} />
                            <span>Buka Artikel Terkait</span>
                          </Link>
                        </div>
                      )}

                      {/* Bubble Footer: Timestamp & Copy Button */}
                      <div className='flex items-center justify-between mt-1.5 pt-1 text-[10px]'>
                        <span className={isUser ? 'text-rose-100' : 'text-[#94a3b8]'}>
                          {msg.timestamp}
                        </span>
                        {!isUser && (
                          <button
                            type='button'
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            title='Salin jawaban'
                            className='inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#e11d48] transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-rose-50/50'
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={11} className='text-emerald-500' />
                                <span className='text-emerald-600 font-medium'>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0'>
                    <Bot size={14} className='sm:w-4 sm:h-4' />
                  </div>
                  <div className='bg-white border border-[#fce7f3] rounded-2xl rounded-tl-none px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs text-[#94a3b8] flex items-center gap-1.5 shadow-2xs'>
                    <span className='w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce' />
                    <span className='w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce delay-150' />
                    <span className='w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce delay-300' />
                    <span className='text-[11px] sm:text-xs font-medium ml-1'>
                      Asisten sedang mencari artikel & menyusun jawaban...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Message Form (Shrink-0) */}
            <div className='shrink-0 pt-2 border-t border-[#fce7f3] flex flex-col gap-1.5'>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className='flex items-center gap-2 sm:gap-2.5'
              >
                <input
                  type='text'
                  placeholder='Ketik pertanyaan seputar Tablet Tambah Darah (TTD)...'
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={isTyping}
                  className='flex-1 bg-[#fff5f7] text-[#1e293b] placeholder-[#94a3b8] text-xs sm:text-sm rounded-full border border-[#fce7f3] focus:border-[#e11d48] px-4 py-2.5 sm:py-3 outline-none touch-manipulation disabled:opacity-60'
                />

                <button
                  type='submit'
                  disabled={!inputText.trim() || isTyping}
                  className='w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#e11d48] text-white hover:bg-[#be123c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20 transition-all cursor-pointer touch-manipulation'
                  aria-label='Kirim Pesan'
                >
                  <Send size={16} className='sm:w-[17px] sm:h-[17px]' />
                </button>
              </form>

              {/* Integrated Explicit Medical Disclaimer Footer */}
              <div className='flex items-center justify-center gap-1.5 text-[10px] text-[#64748b] text-center pt-0.5 px-2'>
                <AlertCircle size={11} className='text-[#e11d48] shrink-0' />
                <span>AI dapat membuat kekeliruan. Selalu verifikasi informasi penting dengan tenaga kesehatan.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

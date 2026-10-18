import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { useAuth } from '@/src/features/auth';
import {
  CONSULTATION_TOPICS,
  getInitialChatMessages,
  ChatMessage,
} from '../index';
import { askGeminiConsultationAction } from '@/src/lib/gemini';
import { MarkdownRenderer } from '@/src/shared/components/markdown';

const createMsgId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
const getFormattedTimestamp = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

export default function ConsultationView() {
  const { user } = useAuth();
  const userName = user?.name || '';
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialChatMessages(userName));
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      const res = await askGeminiConsultationAction(
        text,
        updatedHistory.map(m => ({ sender: m.sender, text: m.text })),
        {
          name: user?.name,
          schoolOrOrg: user?.schoolOrOrg,
          hbLevel: user?.hbLevel,
          gender: user?.gender,
        },
      );

      const displayName = user?.name?.trim() ? user.name.trim().split(' ')[0] : 'Calon Pengantin';
      const answer =
        res.success && res.answer
          ? res.answer
          : `Halo ${displayName}! Terima kasih atas pertanyaannya. Imunisasi Tetanus Toxoid (TT) pranikah sangat penting untuk mencegah infeksi tetanus maternal dan neonatal. Pastikan vaksin TT2 telah selesai minimal 1 bulan sebelum hari pernikahan Anda di Puskesmas terdekat!`;

      const assistantMsg: ChatMessage = {
        id: createMsgId('ai'),
        sender: 'assistant',
        text: answer,
        timestamp: getFormattedTimestamp(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Gemini Consultation Error:', err);
      const errorMsg: ChatMessage = {
        id: createMsgId('ai_err'),
        sender: 'assistant',
        text: 'Mohon maaf, terjadi gangguan koneksi ke asisten AI. Silakan tanyakan kembali sesaat lagi.',
        timestamp: getFormattedTimestamp(),
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
    setMessages(getInitialChatMessages(userName));
  };

  return (
    <div className='flex flex-col gap-3.5 sm:gap-5 w-full pb-4 sm:pb-8 max-w-4xl mx-auto'>
      {/* Top Header Card */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200'>
        <div className='flex items-center gap-3'>
          <div className='w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#aa294d] to-[#cb4364] text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-950/20'>
            <Bot size={24} className='sm:w-[26px] sm:h-[26px]' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-base sm:text-xl font-bold text-slate-900 tracking-tight'>
                Luna — Konselor AI Pranikah
              </h2>
              <span className='inline-flex items-center gap-1 text-[10px] font-bold text-[#2a6950] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#aff1d0]'>
                <Sparkles size={10} /> Online
              </span>
            </div>
            <p className='text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none'>
              Asisten Cerdas Imunisasi TT & Kesehatan Calon Pengantin (Standar Kemenkes RI)
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={handleResetChat}
          className='inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full border border-stone-200 bg-white text-slate-600 hover:text-[#aa294d] hover:border-[#ffd9de] active:scale-95 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer shadow-2xs'
          title='Mulai Ulang Percakapan'
        >
          <RotateCcw size={13} />
          <span>Percakapan Baru</span>
        </button>
      </div>

      {/* Recommended Topics / Horizontal Swipeable Chips */}
      <div>
        <div className='flex items-center justify-between mb-1.5'>
          <span className='text-[11px] sm:text-xs font-bold text-slate-700 block'>
            Topik Konsultasi Cepat:
          </span>
          <span className='text-[10px] text-slate-400 sm:hidden'>Geser &rarr;</span>
        </div>
        <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0'>
          {CONSULTATION_TOPICS.map(topic => (
            <button
              key={topic.id}
              type='button'
              onClick={() => handleTopicClick(topic.prompt)}
              className='shrink-0 px-3.5 py-2 rounded-2xl border border-stone-200 bg-white hover:bg-[#fff0f2] hover:border-[#ffd9de] text-left transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 group'
            >
              <span className='text-base'>{topic.icon}</span>
              <div className='min-w-0'>
                <span className='text-[9px] font-bold text-[#aa294d] block uppercase tracking-wider'>
                  {topic.category}
                </span>
                <span className='text-xs font-semibold text-slate-800 group-hover:text-[#aa294d] leading-tight whitespace-nowrap'>
                  {topic.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box Container - Dynamic Viewport Height */}
      <Card padding='none' className='flex flex-col h-[calc(100dvh-280px)] sm:h-[580px] border border-[#ffd9de]/80 rounded-3xl shadow-sm overflow-hidden bg-white'>
        {/* Messages Scroll Area */}
        <div className='flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 bg-stone-50/40'>
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                    isUser
                      ? 'bg-[#aa294d] text-white'
                      : 'bg-white border border-[#ffd9de] text-[#aa294d]'
                  }`}
                >
                  {isUser ? <User size={15} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#aa294d] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-[#ffd9de] rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className='whitespace-pre-wrap font-medium'>{msg.text}</p>
                  ) : (
                    <div className='markdown-content'>
                      <MarkdownRenderer content={msg.text} />
                    </div>
                  )}
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isUser ? 'text-rose-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className='flex items-start gap-2.5 sm:gap-3'>
              <div className='w-8 h-8 rounded-full bg-white border border-[#ffd9de] text-[#aa294d] flex items-center justify-center shrink-0 shadow-2xs'>
                <Bot size={16} />
              </div>
              <div className='bg-white border border-[#ffd9de] rounded-2xl rounded-tl-xs p-3 shadow-2xs flex items-center gap-1.5 text-xs text-slate-500'>
                <span className='w-1.5 h-1.5 rounded-full bg-[#aa294d] animate-pulse' />
                <span className='w-1.5 h-1.5 rounded-full bg-[#aa294d] animate-pulse delay-150' />
                <span className='w-1.5 h-1.5 rounded-full bg-[#aa294d] animate-pulse delay-300' />
                <span className='ml-1 text-[11px] font-medium text-slate-600'>Luna sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className='p-2.5 sm:p-3.5 bg-white border-t border-stone-200'>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className='flex items-center gap-2'
          >
            <input
              type='text'
              placeholder='Tanya jadwal suntik TT, persiapan lab catin, atau efek samping...'
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isTyping}
              className='flex-1 min-h-[46px] bg-stone-50 text-slate-900 placeholder-slate-400 text-base sm:text-sm rounded-full border border-stone-200 focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 px-4 py-2.5 outline-none transition-colors'
            />
            <button
              type='submit'
              disabled={!inputText.trim() || isTyping}
              className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#aa294d] hover:bg-[#8c0f39] disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-rose-950/20 cursor-pointer disabled:cursor-not-allowed active:scale-95'
              aria-label='Kirim Pesan'
            >
              <Send size={16} className='ml-0.5' />
            </button>
          </form>
          <div className='mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400'>
            <ShieldCheck size={12} className='text-[#2a6950]' />
            <span>Luna berpedoman pada standar Kementerian Kesehatan RI. Bukan pengganti diagnosis dokter.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

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
    <div className='flex flex-col gap-5 w-full pb-8 max-w-4xl mx-auto'>
      {/* Top Header Card */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/15'>
            <Bot size={26} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-lg sm:text-xl font-bold text-slate-900 tracking-tight'>
                Luna — Konselor AI Pranikah
              </h2>
              <span className='inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
                <Sparkles size={10} /> Online
              </span>
            </div>
            <p className='text-xs text-slate-500 mt-0.5'>
              Asisten Cerdas Imunisasi TT & Kesehatan Calon Pengantin (Standar Kemenkes RI)
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={handleResetChat}
          className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white text-slate-600 hover:text-emerald-700 hover:border-emerald-200 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer shadow-2xs'
          title='Mulai Ulang Percakapan'
        >
          <RotateCcw size={13} />
          <span>Percakapan Baru</span>
        </button>
      </div>

      {/* Recommended Topics / Quick Chips */}
      <div>
        <span className='text-xs font-bold text-slate-700 block mb-2'>
          Topik Konsultasi Populer:
        </span>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {CONSULTATION_TOPICS.map(topic => (
            <button
              key={topic.id}
              type='button'
              onClick={() => handleTopicClick(topic.prompt)}
              className='p-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-emerald-50/60 hover:border-emerald-300 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs'
            >
              <div className='flex items-center gap-2.5 pr-2'>
                <span className='text-base'>{topic.icon}</span>
                <div>
                  <span className='text-[10px] font-bold text-emerald-800 block uppercase tracking-wider'>
                    {topic.category}
                  </span>
                  <span className='text-xs font-semibold text-slate-800 group-hover:text-emerald-800 leading-snug line-clamp-1'>
                    {topic.title}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={14}
                className='text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0'
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box Container */}
      <Card padding='none' className='flex flex-col h-[520px] sm:h-[580px] border-stone-200 shadow-sm overflow-hidden'>
        {/* Messages Scroll Area */}
        <div className='flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-stone-50/40'>
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
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-stone-200 text-emerald-700'
                  }`}
                >
                  {isUser ? <User size={15} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-stone-200 rounded-tl-xs'
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
                      isUser ? 'text-emerald-200' : 'text-slate-400'
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
              <div className='w-8 h-8 rounded-full bg-white border border-stone-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs'>
                <Bot size={16} />
              </div>
              <div className='bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-3 shadow-2xs flex items-center gap-1.5 text-xs text-slate-500'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse' />
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-150' />
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-300' />
                <span className='ml-1 text-[11px] font-medium'>Luna sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className='p-3 sm:p-3.5 bg-white border-t border-stone-200'>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className='flex items-center gap-2'
          >
            <input
              type='text'
              placeholder='Ketik pertanyaan seputar imunisasi TT, jadwal faskes, atau persiapan catin...'
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isTyping}
              className='flex-1 bg-stone-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-full border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 px-4 py-2.5 sm:py-3 outline-none transition-colors'
            />
            <button
              type='submit'
              disabled={!inputText.trim() || isTyping}
              className='w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-emerald-950/20 cursor-pointer disabled:cursor-not-allowed'
              aria-label='Kirim Pesan'
            >
              <Send size={16} className='ml-0.5' />
            </button>
          </form>
          <div className='mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400'>
            <ShieldCheck size={11} className='text-emerald-600' />
            <span>Luna memberikan edukasi resmi berpedoman pada Kemenkes RI. Bukan pengganti diagnosis dokter.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

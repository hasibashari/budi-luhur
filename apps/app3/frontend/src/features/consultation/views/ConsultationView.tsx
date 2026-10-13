import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  User,
  Info,
  ChevronRight,
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
      // Call Real Gemini API Server Action with User Context
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

      const displayName = user?.name?.trim() ? user.name.trim().split(' ')[0] : 'Sahabat FEMORY';
      const answer =
        res.success && res.answer
          ? res.answer
          : `Halo ${displayName}! Terima kasih atas pertanyaannya. Minum Tablet Tambah Darah secara rutin sangat penting untuk mencegah anemia. Pastikan diminum setelah makan dengan air putih atau jus buah ya! 🌸`;

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
    setMessages(getInitialChatMessages(user?.name));
  };

  return (
    <div className='flex flex-col gap-2 sm:gap-3 w-full h-[calc(100dvh-120px)] md:h-[calc(100dvh-140px)] -mb-20 md:mb-0 overflow-hidden'>
      {/* Screen Title Header (Shrink-0) */}
      <div className='shrink-0 flex items-center justify-between gap-2 pb-0.5'>
        <div>
          <h2 className='text-base sm:text-xl md:text-2xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-1.5'>
            <span>Konsultasi AI</span>
            <span className='text-sm sm:text-base'>🌸</span>
          </h2>
          <p className='text-[11px] sm:text-xs text-[#64748b] leading-none mt-0.5'>
            Tanya jawab seputar TTD, nutrisi zat besi, & cegah anemia
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
                <h4 className='text-xs font-bold text-[#1e293b]'>Asisten Pintar Fe</h4>
                <span className='text-[10px] text-[#059669] font-semibold'>● Online 24/7</span>
              </div>
            </div>
            <p className='text-xs text-[#475569] leading-relaxed'>
              Siap memberikan penjelasan medis edukatif seputar efek samping, cara minum, dan
              nutrisi penambah darah.
            </p>
          </Card>

          <Card
            padding='md'
            className='flex-1 min-h-0 flex flex-col justify-between overflow-y-auto'
          >
            <div>
              <h4 className='text-xs font-bold text-[#1e293b] mb-2.5 flex items-center gap-1.5'>
                <Sparkles size={13} className='text-[#e11d48]' />
                <span>Pertanyaan Populer:</span>
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
                Diselaraskan dengan pedoman Kemenkes RI untuk suplementasi TTD remaja putri.
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
            className='flex-1 min-h-0 flex flex-col overflow-hidden bg-[#fffdfd] shadow-sm border border-[#fce7f3] p-3 sm:p-4 rounded-2xl'
          >
            {/* Scrollable Message List (Fills full height!) */}
            <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-3 pb-2 overscroll-contain'>
              {messages.map(msg => {
                const isUser = msg.sender === 'user';

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
                          : 'bg-gradient-to-tr from-rose-600 to-rose-400 shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <User size={14} className='sm:w-4 sm:h-4' />
                      ) : (
                        <Bot size={14} className='sm:w-4 sm:h-4' />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
                        isUser
                          ? 'bg-[#e11d48] text-white rounded-tr-none'
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
                      <span
                        className={`text-[10px] block mt-1.5 ${
                          isUser ? 'text-rose-100 text-right' : 'text-[#94a3b8]'
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
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0'>
                    <Bot size={14} className='sm:w-4 sm:h-4' />
                  </div>
                  <div className='bg-white border border-[#fce7f3] rounded-2xl rounded-tl-none px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs text-[#94a3b8] flex items-center gap-1.5 shadow-2xs'>
                    <span className='w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce' />
                    <span className='w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce delay-150' />
                    <span className='w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce delay-300' />
                    <span className='text-[11px] sm:text-xs font-medium ml-1'>
                      Asisten sedang mengetik...
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
                  placeholder='Ketik pertanyaan seputar Tablet Tambah Darah...'
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className='flex-1 bg-[#fff5f7] text-[#1e293b] placeholder-[#94a3b8] text-xs sm:text-sm rounded-full border border-[#fce7f3] focus:border-[#e11d48] px-4 py-2.5 sm:py-3 outline-none touch-manipulation'
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

              {/* Integrated Compact Medical Disclaimer Footer */}
              <div className='flex items-center justify-center gap-1 text-[10px] text-[#94a3b8] text-center pt-0.5'>
                <AlertCircle size={11} className='text-[#e11d48] shrink-0' />
                <span>Edukasi umum • Bukan pengganti diagnosa medis dokter</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

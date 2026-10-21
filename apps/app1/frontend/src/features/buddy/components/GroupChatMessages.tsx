import React, { useRef, useEffect } from 'react';
import { Heart, Flame, Sparkles, MessageSquare, Zap, ThumbsUp } from 'lucide-react';
import { BuddyGroupMessage } from '../types';
import Avatar from '@/shared/components/ui/Avatar';

interface GroupChatMessagesProps {
  messages: BuddyGroupMessage[];
  currentUserId: string;
}

export default function GroupChatMessages({ messages, currentUserId }: GroupChatMessagesProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderCheerIcon = (cheerType?: string | null) => {
    switch (cheerType) {
      case 'HEART':
        return <Heart size={15} className='text-rose-500 fill-rose-500 shrink-0' />;
      case 'FLAME':
        return <Flame size={15} className='text-orange-500 fill-orange-500 shrink-0' />;
      case 'STAR':
        return <Sparkles size={15} className='text-amber-500 fill-amber-500 shrink-0' />;
      case 'POWER':
        return <Zap size={15} className='text-purple-500 fill-purple-500 shrink-0' />;
      default:
        return <ThumbsUp size={15} className='text-teal-500 shrink-0' />;
    }
  };

  return (
    <div className='flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 bg-slate-50/50 overscroll-contain'>
      {messages.length === 0 ? (
        <div className='h-full flex flex-col items-center justify-center text-center p-6 text-slate-400'>
          <div className='w-11 h-11 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2'>
            <MessageSquare size={20} />
          </div>
          <p className='text-xs sm:text-sm font-semibold text-slate-700'>Belum Ada Pesan</p>
          <p className='text-xs text-slate-400 max-w-xs mt-0.5'>
            Sapa kawan atau kirim stiker semangat untuk grup! 🌸
          </p>
        </div>
      ) : (
        messages.map(msg => {
          // 1. System Notification Message
          if (msg.messageType === 'system') {
            return (
              <div key={msg.id} className='flex justify-center my-1.5'>
                <div className='bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-medium px-3 py-1 rounded-full text-center max-w-[90%] sm:max-w-[75%]'>
                  {msg.content}
                </div>
              </div>
            );
          }

          const isSelf = msg.isSelf || msg.senderId === currentUserId;

          // 2. Regular Text & Cheer Message
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-2.5 ${
                isSelf ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Sender Avatar (Only for others) */}
              {!isSelf && (
                <Avatar
                  src={msg.senderAvatarUrl}
                  name={msg.senderName}
                  size='xs'
                  className='mt-0.5 shrink-0'
                  ringClassName='ring-1 ring-slate-200'
                />
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${
                  isSelf ? 'items-end' : 'items-start'
                }`}
              >
                {!isSelf && (
                  <span className='text-[10px] font-bold text-slate-500 mb-0.5 px-1'>
                    {msg.senderName}
                  </span>
                )}

                <div
                  className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isSelf
                      ? 'bg-rose-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
                  } ${
                    msg.messageType === 'cheer'
                      ? isSelf
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600'
                        : 'bg-rose-50/80 border border-rose-100 text-slate-800'
                      : ''
                  }`}
                >
                  {msg.messageType === 'cheer' ? (
                    <div className='flex items-center gap-1.5'>
                      {renderCheerIcon(msg.cheerType)}
                      <span className='font-semibold'>{msg.content}</span>
                    </div>
                  ) : (
                    <p className='whitespace-pre-wrap break-words'>{msg.content}</p>
                  )}
                </div>

                <span
                  className={`text-[9px] text-slate-400 mt-0.5 px-1 ${
                    isSelf ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={scrollEndRef} />
    </div>
  );
}

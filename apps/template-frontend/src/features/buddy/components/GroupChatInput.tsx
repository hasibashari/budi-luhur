'use client';

import React, { useState } from 'react';
import { Send, Heart, Flame, Zap, Sparkles } from 'lucide-react';
import { CheerType } from '../types';

interface GroupChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendCheer: (cheerType: CheerType, label: string) => Promise<void>;
  isSending?: boolean;
}

const QUICK_CHEERS: { label: string; type: CheerType; icon: React.ReactNode }[] = [
  {
    label: 'Semangat!',
    type: 'HEART',
    icon: <Heart size={12} className='text-rose-500 fill-rose-500' />,
  },
  {
    label: 'Kompak!',
    type: 'FLAME',
    icon: <Flame size={12} className='text-orange-500 fill-orange-500' />,
  },
  {
    label: 'Bisa!',
    type: 'POWER',
    icon: <Zap size={12} className='text-purple-500 fill-purple-500' />,
  },
  {
    label: 'Keren!',
    type: 'STAR',
    icon: <Sparkles size={12} className='text-amber-500 fill-amber-500' />,
  },
];

export default function GroupChatInput({
  onSendMessage,
  onSendCheer,
  isSending = false,
}: GroupChatInputProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='shrink-0 bg-white border-t border-rose-100/80 p-2.5 sm:p-3 flex flex-col gap-2'>
      {/* Quick Cheer Stickers */}
      <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5'>
        {QUICK_CHEERS.map(cheer => (
          <button
            key={cheer.type}
            type='button'
            onClick={() => onSendCheer(cheer.type, cheer.label)}
            disabled={isSending}
            className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100/80 active:scale-95 text-[11px] font-semibold text-rose-700 border border-rose-100 transition-all shrink-0 cursor-pointer disabled:opacity-50'
          >
            {cheer.icon}
            <span>{cheer.label}</span>
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <input
          type='text'
          placeholder='Ketik pesan...'
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className='flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-full border border-slate-200 focus:border-rose-500 focus:bg-white px-4 py-2 sm:py-2.5 outline-none transition-colors'
        />

        <button
          type='submit'
          disabled={!inputText.trim() || isSending}
          className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-600 text-white hover:bg-rose-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer'
          title='Kirim Pesan'
          aria-label='Kirim Pesan'
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

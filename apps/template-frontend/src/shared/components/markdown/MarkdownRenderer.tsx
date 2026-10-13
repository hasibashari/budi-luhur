'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        listType === 'ul' ? (
          <ul
            key={`list-${key}`}
            className='pl-5 my-3 text-[#334155] text-sm sm:text-base leading-relaxed list-disc space-y-1'
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        ) : (
          <ol
            key={`list-${key}`}
            className='pl-5 my-3 text-[#334155] text-sm sm:text-base leading-relaxed list-decimal space-y-1'
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        ),
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows;
      elements.push(
        <div
          key={`table-${key}`}
          className='overflow-x-auto my-4 rounded-xl border border-rose-200 shadow-xs'
        >
          <table className='w-full border-collapse text-left text-xs sm:text-sm'>
            {headerRow && (
              <thead className='bg-rose-50/80 border-b border-rose-200 text-[#9f1239] font-bold'>
                <tr>
                  {headerRow.map((h, i) => (
                    <th key={i} className='py-2.5 px-3.5'>
                      {renderInlineMarkdown(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className='divide-y divide-slate-100 text-[#334155]'>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#fffafb]' : 'bg-white'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className='py-2 px-3.5'>
                      {renderInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) return;
      flushList(idx);
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        flushList(idx);
        inList = true;
        listType = 'ul';
      }
      listItems.push(trimmed.slice(2));
      return;
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        flushList(idx);
        inList = true;
        listType = 'ol';
      }
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    } else if (inList) {
      flushList(idx);
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className='font-bold text-[#1e293b] mt-5 mb-2 text-base sm:text-lg'>
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>,
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={idx}
          className='font-extrabold text-[#0f172a] mt-6 mb-3 text-lg sm:text-xl border-b border-rose-100 pb-1.5'
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>,
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className='font-black text-[#e11d48] mt-6 mb-4 text-xl sm:text-2xl'>
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>,
      );
      return;
    }

    // Blockquote / Tip Callout Box
    if (trimmed.startsWith('> ')) {
      elements.push(
        <div
          key={idx}
          className='p-4 my-4 bg-rose-50 border-l-4 border-[#e11d48] rounded-r-xl flex items-start gap-3'
        >
          <Lightbulb size={20} className='text-[#e11d48] shrink-0 mt-0.5' />
          <div className='text-xs sm:text-sm text-[#881337] font-medium leading-relaxed'>
            {renderInlineMarkdown(trimmed.slice(2))}
          </div>
        </div>,
      );
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={idx} className='my-5 border-slate-200 border-dashed' />);
      return;
    }

    // Empty line
    if (trimmed.length === 0) {
      return;
    }

    // Regular Paragraph
    elements.push(
      <p key={idx} className='text-[#334155] my-2 text-sm sm:text-base leading-relaxed'>
        {renderInlineMarkdown(trimmed)}
      </p>,
    );
  });

  flushList(lines.length);
  flushTable(lines.length);

  return <div className={`markdown-content ${className}`}>{elements}</div>;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className='font-bold text-[#0f172a]'>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className='bg-slate-100 text-[#e11d48] px-1.5 py-0.5 rounded text-xs font-mono font-semibold'
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[#e11d48] underline font-semibold hover:text-[#be123c]'
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-[#2D2D3D] bg-[#12121A]/80 shadow-lg">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#20202C] text-[#C4B5FD] uppercase text-[10px] tracking-wider border-b border-[#2D2D3D]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#2D2D3D] text-[#F5F3FF]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#20202C]/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold text-[#A78BFA]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 leading-relaxed align-top">
              {children}
            </td>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 text-[#F5F3FF] leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-[#F5F3FF]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-2 text-[#F5F3FF]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed marker:text-[#A78BFA] pl-1">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#C4B5FD]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-[#A1A1AA] italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#A78BFA] pl-3 py-1 my-2 text-[#A1A1AA] italic bg-[#20202C]/40 rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-[#2D2D3D]" />,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-[#20202C] text-[#C4B5FD] text-xs font-mono border border-[#2D2D3D]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

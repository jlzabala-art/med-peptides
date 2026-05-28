import React, { useMemo } from 'react';
import { Message } from '../types';
import { BotIcon, UserIcon } from './Icons';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Parse markdown and sanitize HTML to prevent XSS
  const htmlContent = useMemo(() => {
    if (!message.text) return '';
    
    // Configure marked to break on newlines
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    
    const rawMarkup = marked.parse(message.text);
    // Ensure we are passing a string to DOMPurify
    const stringMarkup = typeof rawMarkup === 'string' ? rawMarkup : rawMarkup.toString();
    return DOMPurify.sanitize(stringMarkup);
  }, [message.text]);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isUser ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600 border border-slate-300'
        }`}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
        </div>

        {/* Message Bubble */}
        <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-teal-600 text-white rounded-tr-sm' 
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
        } ${message.isError ? 'border-red-300 bg-red-50 text-red-800' : ''}`}>
          
          {/* Content */}
          <div 
            className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'} 
              prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100
              prose-headings:font-semibold prose-a:text-teal-600`}
            dangerouslySetInnerHTML={{ __html: htmlContent || (message.isStreaming ? '<span class="animate-pulse">...</span>' : '') }}
          />
          
          {/* Streaming Indicator */}
          {message.isStreaming && message.text.length > 0 && (
            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-teal-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end w-full bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all overflow-hidden">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about peptides (e.g., 'What is BPC-157?')"
        disabled={disabled}
        className="w-full max-h-[200px] py-3.5 pl-4 pr-12 bg-transparent border-none resize-none focus:ring-0 text-slate-800 placeholder-slate-400 disabled:opacity-50"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="absolute right-2 bottom-2 p-2 text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex-shrink-0"
        aria-label="Send message"
      >
        <SendIcon />
      </button>
    </div>
  );
};

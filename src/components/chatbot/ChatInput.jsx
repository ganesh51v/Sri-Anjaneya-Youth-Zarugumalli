import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ChatInput = ({ onSendMessage, disabled }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const MAX_LENGTH = 500;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)] rounded-b-2xl">
      <div className="relative flex items-center">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={t('chatPlaceholder')}
          disabled={disabled}
          aria-label="Type your question for the AI Assistant"
          className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-2.5 pl-3 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all resize-none max-h-24 font-sans"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="absolute right-2 p-1.5 rounded-lg bg-saffron-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-saffron-600 transition-all cursor-pointer shadow-xs"
        >
          {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
      {text.length > 350 && (
        <div className="text-[9px] text-[var(--text-subtle)] text-right mt-1 font-mono">
          {text.length}/{MAX_LENGTH}
        </div>
      )}
    </form>
  );
};

export default ChatInput;

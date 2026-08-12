import React from 'react';
import { Sparkles, Calendar, Heart, Info, Phone } from 'lucide-react';

const SUGGESTIONS = [
  { text: 'What is Sri Anjaneya Youth?', icon: Info },
  { text: 'What are the upcoming events?', icon: Calendar },
  { text: 'How can I support & donate?', icon: Heart },
  { text: 'How to contact the association?', icon: Phone }
];

const SuggestedQuestions = ({ onSelectQuestion }) => {
  return (
    <div className="p-3 bg-[var(--bg-muted)]/50 border-t border-[var(--border)]">
      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
        <Sparkles className="w-3 h-3 text-saffron-500" />
        Suggested Questions
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map(({ text, icon: Icon }) => (
          <button
            key={text}
            type="button"
            onClick={() => onSelectQuestion(text)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-saffron-600 hover:border-saffron-500/40 hover:bg-saffron-500/5 transition-all shadow-xs text-left cursor-pointer"
          >
            <Icon className="w-3 h-3 text-gold-500 shrink-0" />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;

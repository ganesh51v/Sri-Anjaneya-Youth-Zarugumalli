import React from 'react';
import { Sparkles, Calendar, Heart, Info, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SuggestedQuestions = ({ onSelectQuestion }) => {
  const { language, t } = useLanguage();

  const suggestions = [
    { text: t('qWhatIsOrg'), icon: Info },
    { text: t('qUpcomingEvents'), icon: Calendar },
    { text: t('qSupportDonate'), icon: Heart },
    { text: t('qContactAssoc'), icon: Phone }
  ];

  return (
    <div className="p-3 bg-[var(--bg-muted)]/50 border-t border-[var(--border)]">
      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
        <Sparkles className="w-3 h-3 text-saffron-500" />
        {t('suggestedQuestions')}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map(({ text, icon: Icon }) => (
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

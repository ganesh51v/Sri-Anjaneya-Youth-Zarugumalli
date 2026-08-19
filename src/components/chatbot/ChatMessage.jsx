import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, User, Copy, Check } from 'lucide-react';

const ALLOWED_INTERNAL_ROUTES = new Set([
  '/',
  '/events',
  '/members',
  '/announcements',
  '/donate',
  '/expenditure',
  '/profile',
  '/signin',
  '/signup'
]);

const isSafeExternalUrl = (url) => /^https:\/\//i.test(url) || /^mailto:/i.test(url);

const ChatMessage = ({ message, onLinkClick }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const renderInlineText = (text, keyPrefix) => {
    const parts = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push(<strong key={`${keyPrefix}-bold-${match.index}`}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length ? parts : [text];
  };

  const renderTextWithLinks = (text) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(...renderInlineText(text.substring(lastIndex, match.index), `text-${match.index}`));
      }

      const label = match[1];
      const url = match[2];

      const route = url.split(/[?#]/, 1)[0];

      if (url.startsWith('/') && ALLOWED_INTERNAL_ROUTES.has(route)) {
        parts.push(
          <Link
            key={`link-${match.index}`}
            to={url}
            onClick={onLinkClick}
            className="font-bold underline text-saffron-600 dark:text-saffron-400 hover:text-saffron-500"
          >
            {label}
          </Link>
        );
      } else if (isSafeExternalUrl(url)) {
        parts.push(
          <a
            key={`external-link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-saffron-600 dark:text-saffron-400"
          >
            {label}
          </a>
        );
      } else {
        parts.push(...renderInlineText(label, `invalid-link-${match.index}`));
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(...renderInlineText(text.substring(lastIndex), `text-${lastIndex}`));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`flex gap-2.5 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border ${
          isUser
            ? 'bg-saffron-500 text-white border-saffron-600 shadow-xs'
            : 'bg-gradient-to-tr from-gold-500 to-saffron-500 text-white border-gold-400 shadow-xs'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Box */}
      <div className={`max-w-[82%] group relative ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3 rounded-2xl text-xs leading-relaxed ${
            isUser
              ? 'bg-saffron-500 text-white rounded-tr-xs shadow-xs font-medium'
              : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-xs shadow-xs'
          }`}
        >
          <div className="whitespace-pre-wrap">{renderTextWithLinks(message.text)}</div>
        </div>

        {/* Footer timestamp & copy */}
        <div className={`flex items-center gap-2 mt-1 px-1 text-[9px] text-[var(--text-subtle)] ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-saffron-600 cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Source links — only rendered for AI messages with verified sources */}
        {!isUser && Array.isArray(message.sources) && message.sources.length > 0 && (
          <div className="mt-1.5 px-1 flex flex-wrap gap-1">
            {message.sources.map((source, i) => {
              const url = source.url || '';
              const title = source.title || 'Source';
              const ALLOWED = new Set(['/', '/events', '/members', '/announcements', '/donate', '/expenditure', '/profile', '/signin', '/signup']);
              const route = url.split(/[?#]/, 1)[0];
              if (!ALLOWED.has(route)) return null;
              return (
                <Link
                  key={`src-${i}-${url}`}
                  to={url}
                  onClick={onLinkClick}
                  className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-saffron-500/10 text-saffron-600 dark:text-saffron-400 border border-saffron-500/20 hover:bg-saffron-500/20 transition-colors"
                >
                  📄 {title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

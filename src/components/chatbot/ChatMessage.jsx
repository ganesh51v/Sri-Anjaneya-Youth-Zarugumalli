import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, User, Copy, Check } from 'lucide-react';

const ChatMessage = ({ message, onLinkClick }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown link parser: [Label](/route)
  const renderTextWithLinks = (text) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const label = match[1];
      const url = match[2];

      if (url.startsWith('/')) {
        parts.push(
          <Link
            key={match.index}
            to={url}
            onClick={onLinkClick}
            className="font-bold underline text-saffron-600 dark:text-saffron-400 hover:text-saffron-500"
          >
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-saffron-600 dark:text-saffron-400"
          >
            {label}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
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
      </div>
    </div>
  );
};

export default ChatMessage;

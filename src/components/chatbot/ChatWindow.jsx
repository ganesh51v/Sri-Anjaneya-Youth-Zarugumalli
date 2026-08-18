import { useEffect, useRef } from 'react';
import { Bot, X, Trash2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestedQuestions from './SuggestedQuestions';

const ChatWindow = ({
  messages,
  loading,
  error,
  onSendMessage,
  onClearHistory,
  onRetry,
  onClose
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div
      id="sri-anjaneya-ai-chat"
      className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[420px] h-[520px] max-h-[80vh] bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-strong)] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-slide-up"
      role="dialog"
      aria-label="AI Chat Assistant Window"
    >
      <div className="h-1 bg-gradient-to-r from-saffron-500 via-gold-400 to-devored-600 w-full shrink-0" />

      <div className="px-4 py-3 bg-[var(--bg-muted)]/80 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-saffron-500 to-gold-500 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-[var(--text-primary)] tracking-tight">Sri Anjaneya AI</h3>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-saffron-500/10 text-saffron-600 dark:text-saffron-400 border border-saffron-500/20 uppercase">
                Assistant
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">Online - Ask about seva and events</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-devored-600 hover:bg-devored-500/10 transition-all cursor-pointer"
              title="Clear Conversation"
              aria-label="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all cursor-pointer"
            title="Close Chat"
            aria-label="Close Chat"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2" aria-live="polite">
        {messages.length === 0 ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400 flex items-center justify-center mx-auto border border-saffron-500/20 shadow-xs">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--text-primary)]">Namaste!</h4>
              <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto mt-1 leading-relaxed">
                Welcome to Sri Anjaneya Youth Association. How can I help you today?
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id || `${msg.sender}-${msg.time}-${msg.text}`} message={msg} onLinkClick={onClose} />
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] p-2">
            <Bot className="w-4 h-4 text-saffron-500 animate-bounce" />
            <span className="text-[11px] font-semibold italic">Anjaneya AI is typing...</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-xl bg-devored-500/10 border border-devored-500/20 text-devored-600 dark:text-devored-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn btn-sm btn-ghost py-1 px-2 text-[10px] shrink-0"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && <SuggestedQuestions onSelectQuestion={onSendMessage} />}
      <ChatInput onSendMessage={onSendMessage} disabled={loading} />
    </div>
  );
};

export default ChatWindow;

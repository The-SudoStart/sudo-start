'use client';

import { Send } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card shrink-0">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Root for help..."
          rows={1}
          className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-foreground
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-y-auto font-mono text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          title="Send message"
          aria-label="Send message"
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
            disabled:opacity-50 disabled:cursor-not-allowed transition-all h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import { ChatMessage } from '@/types';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';

interface ChatMessagesProps {
  messages: ChatMessage[];
  streamingContent: string;
  isLoading: boolean;
  getDisplayContent: (raw: string) => string;
}

export function ChatMessages({ messages, streamingContent, isLoading, getDisplayContent }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && (
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mr-2 shrink-0 mt-1">
              <Bot className="w-3 h-3 terminal-text" />
            </div>
          )}
          <div
            className={`max-w-[80%] p-3 rounded-lg text-sm markdown-content ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}

      {/* Streaming message */}
      {streamingContent && (
        <div className="flex justify-start">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mr-2 shrink-0 mt-1">
            <Bot className="w-3 h-3 terminal-text" />
          </div>
          <div className="max-w-[80%] p-3 rounded-lg text-sm bg-muted text-foreground markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {getDisplayContent(streamingContent)}
            </ReactMarkdown>
            <span className="cursor-blink terminal-text ml-0.5">▊</span>
          </div>
        </div>
      )}

      {isLoading && !streamingContent && (
        <div className="flex justify-start">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mr-2 shrink-0">
            <Bot className="w-3 h-3 terminal-text" />
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

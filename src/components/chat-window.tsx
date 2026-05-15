'use client';

import { useStore } from '@/lib/store';
import { appCatalog } from '@/lib/apps';
import { isValidPackageId, isValidVersion } from '@/lib/security';
import { ChatMessage } from '@/types';
import { Send, X, Minimize2, Maximize2, Bot } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatWindow() {
  const { isChatOpen, toggleChat, addToBucket, removeFromBucket, bucket, updatePackageVersion } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Root 🌳 I can see your current bucket and help you set up your development environment. What are you building?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isMinimized) scrollToBottom();
  }, [messages, streamingContent, isMinimized]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const parseAndExecuteAction = useCallback(
    (fullContent: string) => {
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { text: fullContent, executed: false };
        const parsed = JSON.parse(jsonMatch[0]);
        const text = parsed.response ?? fullContent;
        const action = parsed.action;

        if (action?.packageIds && Array.isArray(action.packageIds)) {
          action.packageIds.forEach((idWithVersion: string) => {
            // SECURITY: Validate the package ID against allowlist
            if (typeof idWithVersion !== 'string') return;
            
            const [id, versionId] = idWithVersion.split(':');
            
            // SECURITY: Strict allowlist validation - only accept valid package IDs from catalog
            if (!isValidPackageId(id)) {
              console.warn(`[Security] Rejected invalid package ID from AI: ${id}`);
              return;
            }
            
            // SECURITY: Validate version ID if provided
            if (versionId && !isValidVersion(versionId)) {
              console.warn(`[Security] Rejected invalid version ID from AI: ${versionId}`);
              return;
            }
            
            const pkg = appCatalog.find((p) => p.id === id);
            if (!pkg) return;
            
            if (action.type === 'add') {
              const existing = bucket.find((b) => b.id === pkg.id);
              if (!existing) {
                addToBucket({ ...pkg, selectedVersion: versionId || pkg.defaultVersion });
              } else if (versionId && existing.selectedVersion !== versionId) {
                updatePackageVersion(pkg.id, versionId);
              }
            } else if (action.type === 'remove') {
              removeFromBucket(pkg.id);
            }
          });
        }
        return { text, executed: true };
      } catch {
        return { text: fullContent, executed: false };
      }
    },
    [bucket, addToBucket, removeFromBucket, updatePackageVersion]
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Build bucket context for system prompt
    const bucketContext = bucket.map((p) => `${p.name}${p.selectedVersion && p.selectedVersion !== p.defaultVersion ? ` (${p.selectedVersion})` : ''}`);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], bucketContext }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Request failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.done) {
              // Final parse and action execution
              const { text } = parseAndExecuteAction(json.full ?? accumulated);
              setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
              setStreamingContent('');
            } else {
              accumulated += json.delta;
              setStreamingContent(accumulated);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') return;
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Check that your GROQ_API_KEY is configured in `.env.local`.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const getDisplayContent = (raw: string) => {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return parsed.response ?? raw;
      }
    } catch {}
    return raw;
  };

  if (!isChatOpen) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 terminal-card rounded-lg overflow-hidden shadow-2xl z-50 transition-all flex flex-col ${
        isMinimized ? 'h-14' : 'h-150'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary terminal-glow animate-pulse" />
          <span className="font-bold terminal-text">Root AI</span>
          {bucket.length > 0 && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {bucket.length} in bucket
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-accent rounded transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button type="button" onClick={toggleChat} title="Close chat" aria-label="Close chat" className="p-1 hover:bg-accent rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
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

          {/* Input */}
          <div className="p-4 border-t border-border bg-card shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Root for help..."
                rows={1}
                className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-foreground
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-y-auto font-mono text-sm"
                disabled={isLoading}
              />
              <button type="submit" title="Send message" aria-label="Send message"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all h-[38px] flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
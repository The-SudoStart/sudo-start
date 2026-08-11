'use client';

import { useStore } from '@/lib/store';
import { clientContainer } from '@/infrastructure/config/client-container';
import { ChatMessage } from '@/types';
import { Send, X, Minimize2, Maximize2, Bot } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { useFocusTrap, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

export function ChatWindow() {
  const { isChatOpen, toggleChat, addToBucket, removeFromBucket, bucket, updatePackageVersion } = useStore();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Root 🌳 I can see your current bucket and help you set up your development environment. What are you building?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasShownMinimizeToast = useRef(false);

  // Focus trap when chat is open and not minimized
  useFocusTrap(chatWindowRef, isChatOpen && !isMinimized);

  const handleMinimize = () => {
    setIsMinimized(true);
    if (!hasShownMinimizeToast.current) {
      toast.info('💬 Chat minimized');
      hasShownMinimizeToast.current = true;
    }
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    hasShownMinimizeToast.current = false;
  };

  const parseAndExecuteAction = useCallback(async (fullContent: string) => {
    const parsed = await clientContainer.parseAIActionUseCase.execute(fullContent);

    parsed.action?.packages.forEach(({ pkg, versionId }) => {
      if (parsed.action?.type === 'add') {
        const existing = bucket.find((b) => b.id === pkg.id);
        if (!existing) {
          addToBucket({ ...pkg, selectedVersion: versionId || pkg.defaultVersion });
        } else if (versionId && existing.selectedVersion !== versionId) {
          updatePackageVersion(pkg.id, versionId);
        }
      } else if (parsed.action?.type === 'remove') {
        removeFromBucket(pkg.id);
      }
    });

    return parsed;
  }, [bucket, addToBucket, removeFromBucket, updatePackageVersion]);

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
              const { text } = await parseAndExecuteAction(json.full ?? accumulated);
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

  // Chat keyboard shortcuts
  const chatShortcuts = [
    {
      key: 'Escape',
      description: 'Close chat',
      action: () => {
        // Only close if textarea is not focused or input is empty
        if (document.activeElement?.tagName !== 'TEXTAREA' || !input.trim()) {
          toggleChat();
        }
      },
      preventDefault: false,
    },
  ];

  useKeyboardShortcuts(chatShortcuts, isChatOpen && !isMinimized);

  if (!isChatOpen) return null;

  return (
    <div
      ref={chatWindowRef}
      className={`fixed bottom-6 right-6 w-96 terminal-card rounded-lg overflow-hidden shadow-2xl z-50 transition-all flex flex-col ${
        isMinimized ? 'h-14' : 'h-150'
      }`}
      role="dialog"
      aria-label="AI Chat"
      aria-modal={!isMinimized}
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
          <button
            onClick={isMinimized ? handleMaximize : handleMinimize}
            className="p-1 hover:bg-accent rounded transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            title={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={toggleChat}
            title="Close chat (Esc)"
            aria-label="Close chat"
            className="p-1 hover:bg-accent rounded transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ChatMessages
            messages={messages}
            streamingContent={streamingContent}
            isLoading={isLoading}
            getDisplayContent={getDisplayContent}
          />
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}

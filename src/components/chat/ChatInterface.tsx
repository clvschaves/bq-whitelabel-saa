'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { submitChatMessage } from '@/app/actions/chat';
import { useAuth } from '@/lib/auth/AuthContext';

export function ChatInterface() {
    const { tenant } = useAuth();
    const [messages, setMessages] = useState<ChatMessageType[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your AI Data Assistant. Ask me anything about your BigQuery schemas or request a chart for visualization.',
            createdAt: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessageType = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Call the Server Action
            const response = await submitChatMessage(userMessage.content, tenant?.id || 'unknown');

            const assistantMessage: ChatMessageType = {
                id: (Date.now() + 1).toString(),
                role: response.role || 'assistant',
                content: response.content || 'No response context provided.',
                chart: response.chart,
                table: response.table,
                createdAt: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to submit message:', error);
            // Fallback message
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error communicating with the agent.',
                createdAt: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto rounded-xl border bg-card/50 shadow-sm overflow-hidden">
            {/* Scrollable Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0" ref={scrollRef}>
                <div className="flex flex-col gap-4 pb-4">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex w-full gap-4 p-4 justify-start bg-muted/30">
                            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Loader2 size={18} className="animate-spin" />
                            </div>
                            <div className="flex flex-col justify-center max-w-[85%] items-start">
                                <p className="text-sm text-muted-foreground animate-pulse">Consulting BigQuery Agent...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-end gap-2 relative bg-muted/50 rounded-xl border p-2 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data... Try 'Show me a chart' or 'Show me a table'"
                        className="flex-1 max-h-32 min-h-12 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none p-2 rounded-md"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="h-10 w-10 shrink-0 rounded-lg mb-1"
                    >
                        <Send size={18} />
                    </Button>
                </form>
            </div>
        </div>
    );
}

import React from 'react';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { VegaChart } from '@/components/charts/VegaChart';
import { DataTable } from '@/components/charts/DataTable';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatMessage({ message }: { message: ChatMessageType }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full gap-4 p-4 ${isUser ? 'justify-end' : 'justify-start bg-muted/30'}`}>
            {!isUser && (
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot size={18} />
                </div>
            )}

            <div className={`flex flex-col gap-3 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Text Content */}
                {message.content && (
                    <div
                        className={`px-4 py-3 rounded-2xl ${isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border text-card-foreground rounded-tl-sm prose prose-sm dark:prose-invert max-w-none'
                            }`}
                    >
                        {isUser ? (
                            <p className="whitespace-pre-wrap leading-relaxed m-0">{message.content}</p>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}

                {/* Visualizations (only for assistant) */}
                {!isUser && (
                    <div className="w-full flex flex-col gap-4 mt-2">
                        {message.chart && (
                            <div className="w-full min-w-[300px] lg:min-w-[600px] bg-card border rounded-lg shadow-sm">
                                <VegaChart spec={message.chart.spec} data={message.chart.data} />
                            </div>
                        )}

                        {message.table && (
                            <div className="w-full min-w-[300px] lg:min-w-[600px] shadow-sm">
                                <DataTable data={message.table} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-muted border">
                    <User size={18} className="text-muted-foreground" />
                </div>
            )}
        </div>
    );
}

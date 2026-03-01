export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChartData {
    spec: any; // Vega-Lite specification
    data?: any[]; // Raw data
}

export interface TableData {
    headers: string[];
    rows: any[][];
}

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    chart?: ChartData;
    table?: TableData;
    createdAt: Date;
}

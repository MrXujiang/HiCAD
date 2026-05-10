export type AiEventType = 'code_delta' | 'thinking' | 'done' | 'error';
export interface AiEvent {
    type: AiEventType;
    data?: string;
    message?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}
export interface SessionMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        model: string;
        inputTokens: number;
        outputTokens: number;
        renderSuccess: boolean;
    };
}
export interface Session {
    id: string;
    userId: string;
    modelId?: string;
    messages: SessionMessage[];
    createdAt: string;
    updatedAt: string;
}
export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

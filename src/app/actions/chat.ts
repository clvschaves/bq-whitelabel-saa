'use server';

import type { ChatMessage } from '@/types/chat';
import { ConversationalAnalyticsService } from '@/lib/services/ConversationalAnalyticsService';

// Fallback session generation. In a real app with sessions, we'd pass this from the client or auth token.
import { randomUUID } from 'crypto';

// In a real application, this file would initialize the Google Cloud Vertex AI SDK
// or BigQuery SDK based on the tenant's Service Account credentials.
// For now, we simulate the interaction to prove the architecture.

export async function submitChatMessage(
    messageContent: string,
    tenantId: string
): Promise<Partial<ChatMessage>> {
    if (!messageContent.trim()) {
        throw new Error('Message cannot be empty');
    }

    console.log(`[BigQuery Agent] Received query from Tenant: ${tenantId}`);

    // NOTE: In a full White-Label scenario, we would lookup the specific Project/AgentID mapped to this Tenant
    // Since we only have one right now, we hardcode the customer variables provided:
    const service = new ConversationalAnalyticsService({
        projectId: 'universal-team-401112',
        location: 'global',
        agentId: 'agent_40d3cf01-1635-4a93-a758-edb2b35df80e'
    });

    try {
        const sessionId = `tenant-${tenantId}-session-${randomUUID()}`;
        const agentResponse = await service.askQuestion(messageContent, sessionId);

        // Provide the dynamic data back. Force JSON clone to guarantee plain objects for Next.js boundary
        return JSON.parse(JSON.stringify({
            role: 'assistant',
            content: agentResponse.text,
            chart: agentResponse.chart,
            table: agentResponse.table
        }));
    } catch (error: any) {
        console.error('Failed to query Vertex Agent Builder:', error);
        if (error.stack) console.error(error.stack);
        throw new Error('Internal Server Error: ' + (error?.message || 'Unknown error'));
    }
}

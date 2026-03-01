import { ConversationalAnalyticsService } from './lib/services/ConversationalAnalyticsService';

async function run() {
    const service = new ConversationalAnalyticsService({
        projectId: 'universal-team-401112',
        location: 'global',
        agentId: 'agent_40d3cf01-1635-4a93-a758-edb2b35df80e',
    });

    console.log('Sending message to agent...');
    try {
        const result = await service.askQuestion('Me mostre um grafico com os dados', 'session-local-test-123');
        console.log('\n--- Agent Response ---');
        console.log('Text:', result.text);
        console.log('Chart:', JSON.stringify(result.chart?.spec, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

run();

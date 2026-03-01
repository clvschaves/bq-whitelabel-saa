import { GoogleAuth } from 'google-auth-library';
import type { ChartData, TableData } from '@/types/chat';

export interface AgentConfiguration {
    projectId: string;
    location: string;
    agentId: string;
}

export class ConversationalAnalyticsService {
    private config: AgentConfiguration;
    private auth: GoogleAuth;

    constructor(config: AgentConfiguration) {
        this.config = config;

        // Initialize google-auth-library
        // In Cloud Run this uses Workload Identity attached to the deployment
        // Locally it uses the GOOGLE_APPLICATION_CREDENTIALS json file
        // Locally it uses the GOOGLE_APPLICATION_CREDENTIALS json file if available in the env,
        // but since Next.js might have been started before we set the env var, we explicitly point to the file in dev mode.
        const isDev = process.env.NODE_ENV === 'development';

        this.auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            keyFilename: isDev ? process.cwd() + '/credentials.json' : undefined
        });
    }

    /**
     * Creates a new conversation in GCP for this Data Agent.
     * This is required before sending stateful chat messages.
     */
    public async createConversation(conversationId: string, token: string): Promise<void> {
        const apiUrl = `https://geminidataanalytics.googleapis.com/v1beta/projects/${this.config.projectId}/locations/${this.config.location}/conversations?conversationId=${conversationId}`;
        const payload = {
            agents: [
                `projects/${this.config.projectId}/locations/${this.config.location}/dataAgents/${this.config.agentId}`
            ]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok && response.status !== 409) { // 409 means already exists, which is fine
            const errorBody = await response.text();
            console.error(`[Conversational API] Failed to create Session ${conversationId}:`, errorBody);
            throw new Error(`Failed to create conversation: ${response.status}`);
        }
    }

    /**
     * Generates a response from the Conversational Analytics API.
     */
    async askQuestion(userMessage: string, sessionId: string): Promise<{ text: string; chart?: ChartData; table?: TableData }> {
        try {
            const client = await this.auth.getClient();
            const accessTokenDetails = await client.getAccessToken();
            const token = accessTokenDetails.token;

            if (!token) {
                throw new Error('Failed to retrieve access token from GoogleAuth');
            }

            // 1. Ensure conversation exists first
            await this.createConversation(sessionId, token);

            // 2. Format based on https://docs.cloud.google.com/gemini/docs/conversational-analytics-api/build-agent-http
            const apiUrl = `https://geminidataanalytics.googleapis.com/v1beta/projects/${this.config.projectId}/locations/${this.config.location}:chat`;

            const payload = {
                parent: `projects/${this.config.projectId}/locations/global`,
                messages: [
                    {
                        userMessage: {
                            text: userMessage
                        }
                    }
                ],
                conversation_reference: {
                    conversation: `projects/${this.config.projectId}/locations/${this.config.location}/conversations/${sessionId}`,
                    data_agent_context: {
                        data_agent: `projects/${this.config.projectId}/locations/${this.config.location}/dataAgents/${this.config.agentId}`
                    }
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`[Conversational API Error] Status: ${response.status} Body:`, errorBody);
                throw new Error(`HTTP Error ${response.status}: ${errorBody}`);
            }

            const responseData = await response.json();
            console.log("[Conversational API] Output received with", responseData?.length || 0, "blocks.");

            // The conversational analytics API can return an array or an object with messages
            const responseMessages = Array.isArray(responseData) ? responseData : (responseData?.messages || []);

            let fullText = '';
            let chart: ChartData | undefined = undefined;
            let table: TableData | undefined = undefined;

            for (const msg of responseMessages) {
                // 1. Check for Text Responses
                if (msg.systemMessage?.text?.parts) {
                    // We usually only want to show the FINAL_RESPONSE or generic text to the user, bypassing internal THOUGHT logs
                    const isThought = msg.systemMessage.text.textType === 'THOUGHT';
                    if (!isThought) {
                        fullText += msg.systemMessage.text.parts.join('\n\n') + '\n\n';
                    }
                }
                else if (msg.assistantMessage?.text) {
                    fullText += msg.assistantMessage.text + '\n';
                }

                // 2. Check for Table Data
                if (msg.systemMessage?.data?.result?.data) {
                    const rawData = msg.systemMessage.data.result.data;
                    if (Array.isArray(rawData) && rawData.length > 0) {
                        const headers = Object.keys(rawData[0]);
                        const rows = rawData.map(row => headers.map(h => String(row[h])));
                        table = { headers, rows };
                    }
                }

                // 3. Check for Native Chart Specs
                if (msg.systemMessage?.chart?.result?.vegaConfig) {
                    const vegaSpec = msg.systemMessage.chart.result.vegaConfig;
                    // Ensure it has basic vega properties injected just in case
                    chart = { spec: vegaSpec };
                }
            }

            return {
                text: fullText.trim() || 'Desculpe, não consegui obter uma resposta válida do agente de dados.',
                chart,
                table
            };

        } catch (error) {
            console.error(`[Conversational API Error] Failed to generate content:`, error);
            throw error;
        }
    }
}

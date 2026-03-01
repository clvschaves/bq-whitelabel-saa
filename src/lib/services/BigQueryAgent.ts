import { VertexAI } from '@google-cloud/vertexai';

/**
 * Interface that defines the required configuration for each Tenant's Agent.
 * In production, these values would be fetched securely from your database.
 */
export interface AgentConfiguration {
    projectId: string;        // e.g., 'meu-projeto-gcp-123'
    location: string;         // e.g., 'us-central1'
    agentId?: string;         // If using a pre-built Vertex AI Agent Builder ID
    systemPrompt?: string;    // Custom instructions to guide the BQ generation
    // For white-label, you might also inject specific Dataset/Table IDs here
}

export class BigQueryAgentService {
    private vertexAi: VertexAI;
    private config: AgentConfiguration;

    constructor(config: AgentConfiguration) {
        this.config = config;

        // Initialize the Vertex AI client for this specific tenant's project and location.
        // Note: This relies on the Google Cloud SDK automatically picking up authentication
        // from environment variables (GOOGLE_APPLICATION_CREDENTIALS) or Workload Identity.
        // In a multi-tenant environment, you might need to instantiate this with specific 
        // OAuth tokens if tenants are strictly isolated across multiple GCP projects.
        this.vertexAi = new VertexAI({
            project: config.projectId,
            location: config.location,
        });
    }

    /**
     * Generates a response from the BigQuery/Vertex Agent.
     */
    async askQuestion(userMessage: string): Promise<{ text: string; rawJson?: any }> {
        try {
            // 1. We instantiate the generative model. 
            // Replace 'gemini-1.5-pro' with your specific required model.
            const generativeModel = this.vertexAi.getGenerativeModel({
                model: 'gemini-1.5-pro',
                generationConfig: {
                    // We might want structured JSON back if we are expecting Vega-Lite specs
                    // responseMimeType: "application/json"
                },
                systemInstruction: {
                    parts: [{
                        text: this.config.systemPrompt || "You are a data assistant. You must query BigQuery and optionally return a valid Vega-Lite JSON specification inside a code block, or a Markdown table."
                    }],
                    role: "system"
                }
            });

            // 2. We send the message
            const request = {
                contents: [
                    { role: 'user', parts: [{ text: userMessage }] }
                ],
            };

            const responseStream = await generativeModel.generateContent(request);
            const contentText = responseStream.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // 3. (Optional) Parse out JSON if the agent returns structural charts
            let parsedJson = null;
            if (contentText.includes('```json')) {
                try {
                    const raw = contentText.split('```json')[1].split('```')[0].trim();
                    parsedJson = JSON.parse(raw);
                } catch (e) {
                    console.error("Failed to parse JSON blocks from agent response", e);
                }
            }

            return {
                text: contentText,
                rawJson: parsedJson
            };

        } catch (error) {
            console.error(`[BQ Agent Error] Failed to generate content:`, error);
            throw error;
        }
    }
}

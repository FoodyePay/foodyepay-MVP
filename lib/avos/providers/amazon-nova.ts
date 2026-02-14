/**
 * Amazon Nova Sonic voice AI provider implementation
 * Uses AWS Bedrock for intent analysis and response generation
 * ASR/TTS are stubbed for now - would use Amazon Transcribe/Polly in production
 *
 * Environment Variables:
 * - AVOS_AMAZON_REGION: AWS region (e.g., us-west-2)
 * - AVOS_AMAZON_BEDROCK_MODEL_ID: Bedrock model ID (e.g., amazon.nova-micro-v1:0)
 * - AWS_ACCESS_KEY_ID: AWS credentials
 * - AWS_SECRET_ACCESS_KEY: AWS credentials
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import {
  TranscriptionResult,
  LanguageDetectionResult,
  DialogContext,
  IntentResult,
  OrderIntent,
  AVOSMenuIndexEntry,
  SupportedLanguage,
  AIEngine,
} from '../types';
import { BaseVoiceAIProvider } from './base';

/**
 * Language name mapping for Bedrock prompts
 */
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: 'Mandarin Chinese',
  yue: 'Cantonese',
  es: 'Spanish',
};

export class AmazonNovaProvider extends BaseVoiceAIProvider {
  name = 'Amazon Nova Sonic';
  engine: AIEngine = 'amazon_nova_sonic';

  private bedrockClient: BedrockRuntimeClient;
  private modelId: string;

  constructor(restaurantName: string, menuItems: AVOSMenuIndexEntry[]) {
    super(restaurantName, menuItems);

    const region = process.env.AVOS_AMAZON_REGION || 'us-west-2';
    this.modelId =
      process.env.AVOS_AMAZON_BEDROCK_MODEL_ID || 'amazon.nova-micro-v1:0';

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error(
        '[AVOS] AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are required'
      );
    }

    console.log(
      `[AVOS] Initializing Amazon Nova provider in region ${region} with model ${this.modelId}`
    );

    this.bedrockClient = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Transcribe audio to text
   * TODO: Implement with Amazon Transcribe in production
   */
  async transcribe(
    audioBuffer: Buffer,
    language: SupportedLanguage
  ): Promise<TranscriptionResult> {
    console.log(
      `[AVOS] [TODO] Transcribe audio using Amazon Transcribe (${audioBuffer.length} bytes, language: ${language})`
    );

    // Placeholder implementation - would integrate with Amazon Transcribe
    return {
      text: '',
      language,
      confidence: 0,
      alternatives: [],
    };
  }

  /**
   * Synthesize text to speech
   * TODO: Implement with Amazon Polly in production
   */
  async synthesize(
    text: string,
    language: SupportedLanguage
  ): Promise<Buffer> {
    console.log(
      `[AVOS] [TODO] Synthesize text using Amazon Polly: "${text.substring(0, 50)}..." (${language})`
    );

    // Placeholder implementation - would integrate with Amazon Polly
    return Buffer.alloc(0);
  }

  /**
   * Detect language from audio
   * TODO: Implement with Amazon Comprehend in production
   */
  async detectLanguage(audioBuffer: Buffer): Promise<LanguageDetectionResult> {
    console.log(
      `[AVOS] [TODO] Detect language using Amazon Comprehend (${audioBuffer.length} bytes)`
    );

    // Default to English if language detection fails
    return {
      language: 'en',
      confidence: 0.5,
    };
  }

  /**
   * Analyze intent using Amazon Nova via Bedrock
   * Uses structured JSON output for consistent entity extraction
   */
  async analyzeIntent(
    text: string,
    context: DialogContext
  ): Promise<IntentResult> {
    console.log(`[AVOS] Analyzing intent for: "${text}"`);

    try {
      const systemPrompt = this.buildIntentAnalysisPrompt(context);

      const prompt = `${systemPrompt}

User input: "${text}"

Respond with JSON only, no markdown formatting.`;

      const response = await this.invokeBedrockModel(prompt);

      let result: any;
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        result = JSON.parse(jsonStr);
      } catch {
        console.warn('[AVOS] Failed to parse intent analysis JSON, using default');
        result = {
          intent: 'UNKNOWN',
          confidence: 0.3,
          entities: {},
        };
      }

      const intentResult: IntentResult = {
        intent: (result.intent || 'UNKNOWN') as OrderIntent,
        confidence: result.confidence || 0.5,
        entities: result.entities || {},
        rawText: text,
      };

      console.log(
        `[AVOS] Intent detected: ${intentResult.intent} (confidence: ${intentResult.confidence})`
      );

      return intentResult;
    } catch (error) {
      console.error('[AVOS] Intent analysis error:', error);
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        entities: {},
        rawText: text,
      };
    }
  }

  /**
   * Generate natural language response using Amazon Nova Sonic via Bedrock
   * Incorporates restaurant context, menu items, and conversation state
   */
  async generateResponse(
    context: DialogContext,
    intent: IntentResult
  ): Promise<string> {
    console.log(`[AVOS] Generating response for intent: ${intent.intent}`);

    try {
      const systemPrompt = this.buildSystemPrompt(
        context.language,
        this.restaurantName
      );

      const conversationHistory = context.conversationHistory
        .map((e) => `${e.role === 'ai' ? 'AI' : 'Customer'}: ${e.text}`)
        .join('\n');

      const orderSummary = this.formatOrderSummary(context);

      const prompt = `${systemPrompt}

Current Dialog State: ${context.currentState}

Current Order:
${orderSummary}

Customer Intent: ${intent.intent}
Entities: ${JSON.stringify(intent.entities)}

Recent Conversation:
${conversationHistory}

Generate a natural, concise voice response (1-2 sentences max) for the next turn.
Respond in the customer's language (${LANGUAGE_NAMES[context.language]}).
Support code-switching naturally if the customer uses multiple languages.`;

      const response = await this.invokeBedrockModel(prompt);

      console.log(`[AVOS] Response generated: "${response.substring(0, 50)}..."`);

      return response;
    } catch (error) {
      console.error('[AVOS] Response generation error:', error);
      return this.getDefaultResponse(context.language);
    }
  }

  /**
   * Invoke Amazon Nova model via Bedrock
   * Handles the API call and response parsing
   */
  private async invokeBedrockModel(prompt: string): Promise<string> {
    try {
      const params = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        }),
      };

      const command = new InvokeModelCommand(params);
      const response = await this.bedrockClient.send(command);

      if (!response.body) {
        throw new Error('No response body from Bedrock');
      }

      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body)
      );

      // Handle different response formats from different models
      let responseText = '';
      if (responseBody.output?.text) {
        responseText = responseBody.output.text;
      } else if (responseBody.content?.[0]?.text) {
        responseText = responseBody.content[0].text;
      } else if (responseBody.text) {
        responseText = responseBody.text;
      } else if (Array.isArray(responseBody.generation)) {
        responseText = responseBody.generation[0];
      }

      return responseText.trim();
    } catch (error) {
      console.error('[AVOS] Bedrock invocation error:', error);
      throw error;
    }
  }

  /**
   * Build a prompt for intent analysis with few-shot examples
   */
  private buildIntentAnalysisPrompt(context: DialogContext): string {
    return `You are an NLU system for a restaurant voice ordering system.
Classify the customer utterance into one of these intents:
- ORDER_ITEM: Customer wants to order something
- REMOVE_ITEM: Customer wants to remove an item
- MODIFY_ITEM: Customer wants to modify an item (sauce, spice level, etc.)
- ASK_QUESTION: Customer asks about menu or restaurant
- CONFIRM: Customer agrees or says yes
- DENY: Customer disagrees or says no
- REPEAT: Customer asks to repeat or speak louder
- CANCEL_ORDER: Customer wants to cancel the entire order
- CHECK_TOTAL: Customer asks for price or total
- SWITCH_LANGUAGE: Customer wants to switch language
- SPEAK_TO_HUMAN: Customer wants to talk to a person
- READY_TO_PAY: Customer is ready to pay
- UNKNOWN: Cannot classify

Respond in this exact JSON format:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "entities": {
    "menuItems": [{"name": "item name", "quantity": 1, "modifications": []}],
    "language": "en",
    "confirmation": true
  }
}

Current context:
- Dialog state: ${context.currentState}
- Language: ${LANGUAGE_NAMES[context.language]}
- Items in order: ${context.orderItems.length}`;
  }

  /**
   * Default response when generation fails
   */
  private getDefaultResponse(language: SupportedLanguage): string {
    const responses: Record<SupportedLanguage, string> = {
      en: 'I did not understand that. Could you please repeat?',
      zh: '我没有理解。您能请重复吗？',
      yue: '我冇理解。您能請重複嗎？',
      es: 'No entendí eso. ¿Podrías repetir?',
    };
    return responses[language];
  }
}

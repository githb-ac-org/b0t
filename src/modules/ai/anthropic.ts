import Anthropic from '@anthropic-ai/sdk';
import { createCircuitBreaker } from '@/lib/resilience';
import { createRateLimiter, withRateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

/**
 * Anthropic Claude Module
 *
 * Generate text, analyze content, and build AI workflows with Claude
 * - Text generation with streaming support
 * - Multi-turn conversations
 * - Function calling (tools)
 * - Vision capabilities
 * - Built-in resilience
 *
 * Perfect for:
 * - Content generation
 * - Code generation
 * - Data analysis
 * - Intelligent automation
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  logger.warn('⚠️  ANTHROPIC_API_KEY not set. Anthropic features will not work.');
}

const anthropicClient = ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null;

// Rate limiter: Conservative limits for API usage
const anthropicRateLimiter = createRateLimiter({
  maxConcurrent: 5,
  minTime: 200, // 200ms between requests
  reservoir: 50,
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 60 * 1000,
  id: 'anthropic',
});

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicCompletionOptions {
  messages: AnthropicMessage[];
  model?: 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  tools?: Array<{
    name: string;
    description: string;
    input_schema: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  }>;
}

export interface AnthropicCompletionResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
  toolUse?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
}

/**
 * Internal create completion function (unprotected)
 */
async function createCompletionInternal(
  options: AnthropicCompletionOptions
): Promise<AnthropicCompletionResponse> {
  if (!anthropicClient) {
    throw new Error('Anthropic client not initialized. Set ANTHROPIC_API_KEY.');
  }

  logger.info(
    {
      model: options.model || 'claude-3-5-sonnet-20241022',
      messageCount: options.messages.length,
      hasTools: !!options.tools,
    },
    'Creating Anthropic completion'
  );

  const response = await anthropicClient.messages.create({
    model: options.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature,
    system: options.systemPrompt,
    messages: options.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    tools: options.tools,
  });

  logger.info(
    {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    },
    'Anthropic completion created'
  );

  // Extract text content
  const textContent = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  // Extract tool use
  const toolUse = response.content
    .filter((block) => block.type === 'tool_use')
    .map((block) => {
      if ('name' in block && 'input' in block) {
        return {
          name: block.name as string,
          input: block.input as Record<string, unknown>,
        };
      }
      return null;
    })
    .filter((tool): tool is { name: string; input: Record<string, unknown> } => tool !== null);

  return {
    content: textContent,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    stopReason: response.stop_reason || 'end_turn',
    toolUse: toolUse.length > 0 ? toolUse : undefined,
  };
}

/**
 * Create completion (protected)
 */
const createCompletionWithBreaker = createCircuitBreaker(createCompletionInternal, {
  timeout: 60000, // 60 seconds for AI generation
  name: 'anthropic-completion',
});

const createCompletionRateLimited = withRateLimit(
  async (options: AnthropicCompletionOptions) =>
    createCompletionWithBreaker.fire(options),
  anthropicRateLimiter
);

export async function createCompletion(
  options: AnthropicCompletionOptions
): Promise<AnthropicCompletionResponse> {
  return (await createCompletionRateLimited(
    options
  )) as unknown as AnthropicCompletionResponse;
}

/**
 * Simple text generation (convenience)
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  model?: 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229'
): Promise<string> {
  const response = await createCompletion({
    messages: [{ role: 'user', content: prompt }],
    systemPrompt,
    model,
  });

  return response.content;
}

/**
 * Chat with conversation history (convenience)
 */
export async function chat(
  messages: AnthropicMessage[],
  systemPrompt?: string,
  model?: 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229'
): Promise<string> {
  const response = await createCompletion({
    messages,
    systemPrompt,
    model,
  });

  return response.content;
}

/**
 * Fast generation with Haiku (convenience)
 */
export async function generateFast(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  return generateText(prompt, systemPrompt, 'claude-3-5-haiku-20241022');
}

/**
 * High quality generation with Opus (convenience)
 */
export async function generateQuality(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  return generateText(prompt, systemPrompt, 'claude-3-opus-20240229');
}

/**
 * Analyze image with vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  model?: 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229'
): Promise<string> {
  if (!anthropicClient) {
    throw new Error('Anthropic client not initialized. Set ANTHROPIC_API_KEY.');
  }

  logger.info({ prompt, hasImage: true }, 'Analyzing image with Claude');

  const response = await anthropicClient.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  const textContent = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  return textContent;
}

/**
 * Streaming completion (for real-time applications)
 */
export async function* streamCompletion(
  options: AnthropicCompletionOptions
): AsyncGenerator<string> {
  if (!anthropicClient) {
    throw new Error('Anthropic client not initialized. Set ANTHROPIC_API_KEY.');
  }

  logger.info(
    {
      model: options.model || 'claude-3-5-sonnet-20241022',
      messageCount: options.messages.length,
    },
    'Starting Anthropic stream'
  );

  const stream = await anthropicClient.messages.stream({
    model: options.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature,
    system: options.systemPrompt,
    messages: options.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }

  logger.info('Anthropic stream completed');
}

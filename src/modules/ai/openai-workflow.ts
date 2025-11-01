import OpenAI from 'openai';
import { createOpenAICircuitBreaker } from '@/lib/resilience';
import { openaiRateLimiter, withRateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

/**
 * OpenAI Module (for Workflows)
 *
 * Uses user's OpenAI API key (from workflow credentials).
 * Compatible with workflow credential system.
 *
 * Features:
 * - User-level API keys
 * - Circuit breaker protection
 * - Rate limiting (500 req/min)
 * - Structured logging
 * - 60s timeout for AI generation
 */

/**
 * Create OpenAI client from API key
 */
function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    timeout: 60000, // 60 second timeout
  });
}

/**
 * Generate a tweet reply using AI (internal)
 */
async function generateTweetReplyInternal(params: {
  tweetText: string;
  tweetAuthor: string;
  systemPrompt?: string;
  apiKey: string;
}): Promise<string> {
  const { tweetText, tweetAuthor, systemPrompt, apiKey } = params;

  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please add your OpenAI credentials.');
  }

  const client = createOpenAIClient(apiKey);

  logger.info(
    { tweetLength: tweetText.length, hasSystemPrompt: !!systemPrompt },
    'Generating tweet reply with AI'
  );

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  // System prompt
  const defaultSystemPrompt =
    'You are a helpful AI assistant that writes engaging, thoughtful tweet replies.';
  messages.push({
    role: 'system',
    content: `${systemPrompt || defaultSystemPrompt}\n\nCRITICAL: Keep replies under 280 characters.`,
  });

  // User prompt with tweet context
  messages.push({
    role: 'user',
    content: `Generate a reply to this tweet by @${tweetAuthor}:\n\n"${tweetText}"\n\nWrite a thoughtful, engaging reply.`,
  });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.8,
    max_tokens: 100,
  });

  const reply = completion.choices[0]?.message?.content || '';

  logger.info({ replyLength: reply.length }, 'Tweet reply generated');

  return reply;
}

/**
 * Generate a tweet reply (workflow-compatible)
 * Protected with circuit breaker + rate limiting
 */
const generateTweetReplyWithBreaker = createOpenAICircuitBreaker(generateTweetReplyInternal);
export const generateTweetReply = withRateLimit(
  (params: { tweetText: string; tweetAuthor: string; systemPrompt?: string; apiKey: string }) =>
    generateTweetReplyWithBreaker.fire(params),
  openaiRateLimiter
);

/**
 * Generate text completion (internal)
 */
async function generateTextInternal(params: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey: string;
}): Promise<string> {
  const {
    prompt,
    systemPrompt,
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 500,
    apiKey,
  } = params;

  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please add your OpenAI credentials.');
  }

  const client = createOpenAIClient(apiKey);

  logger.info({ promptLength: prompt.length, model }, 'Generating text with AI');

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  // GPT-5 models don't support optional parameters
  const isGPT5 = model.startsWith('gpt-5') || model.startsWith('o1') || model.startsWith('o3');

  const completionParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    ...(isGPT5 ? {} : { temperature, max_tokens: maxTokens }),
  };

  const completion = await client.chat.completions.create(completionParams);
  const text = completion.choices[0]?.message?.content || '';

  logger.info({ responseLength: text.length }, 'Text generated');

  return text;
}

/**
 * Generate text completion (workflow-compatible)
 * Protected with circuit breaker + rate limiting
 */
const generateTextWithBreaker = createOpenAICircuitBreaker(generateTextInternal);
export const generateText = withRateLimit(
  (params: {
    prompt: string;
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey: string;
  }) => generateTextWithBreaker.fire(params),
  openaiRateLimiter
);

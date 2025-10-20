import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set. OpenAI features will not work.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateTweet(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert who creates engaging, concise tweets. Keep tweets under 280 characters.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating tweet:', error);
    throw error;
  }
}

export async function generateTweetReply(
  originalTweet: string,
  systemPrompt?: string,
  useDefaultPrompt: boolean = true
): Promise<string> {
  try {
    const defaultSystemPrompt = `You are a helpful and engaging social media assistant. Your goal is to create thoughtful, relevant replies to tweets.

Guidelines:
- Keep replies under 280 characters
- Be conversational and authentic
- Add value to the conversation
- Match the tone of the original tweet
- Avoid being overly promotional
- Use emojis sparingly and only when appropriate
- Never be controversial or offensive`;

    // Determine which prompt to use
    let finalPrompt: string;
    if (systemPrompt !== undefined && systemPrompt !== null) {
      // Use provided prompt (even if empty string)
      finalPrompt = systemPrompt;
    } else if (useDefaultPrompt) {
      // Use default only if explicitly allowed and no prompt provided
      finalPrompt = defaultSystemPrompt;
    } else {
      // No prompt at all
      finalPrompt = '';
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Only add system message if there's a prompt
    if (finalPrompt) {
      messages.push({
        role: 'system',
        content: finalPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: `Generate a reply to this tweet:\n\n"${originalTweet}"`,
    });

    const completion = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest-2025-03-27',
      messages,
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating tweet reply:', error);
    throw error;
  }
}

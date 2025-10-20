import { createPipeline } from '../Pipeline';
import { searchTwitter, type Tweet } from '@/lib/rapidapi/twitter';
import { replyToTweet } from '@/lib/twitter';
import { generateTweetReply } from '@/lib/openai';

/**
 * Reply to Tweets Workflow
 *
 * Steps:
 * 1. Search for tweets matching criteria (from today, no links/media)
 * 2. Rank by engagement and select hottest + newest
 * 3. Generate AI response
 * 4. Post reply to selected tweet
 */

interface WorkflowContext {
  searchQuery: string;
  systemPrompt?: string;
  tweets: Tweet[];
  selectedTweet?: Tweet;
  generatedReply: string;
  replyResult?: unknown;
}

interface WorkflowConfig {
  searchQuery: string;
  systemPrompt?: string;
  dryRun?: boolean; // If true, skip posting to Twitter
}

/**
 * Calculate engagement score for a tweet
 * Combines likes, retweets, and replies with weights
 */
function calculateEngagementScore(tweet: Tweet): number {
  const likes = tweet.likes || 0;
  const retweets = tweet.retweets || 0;
  const replies = tweet.replies || 0;
  const views = tweet.views || 0;

  // Weight: likes (1x), retweets (2x), replies (1.5x), views (0.001x)
  return likes + (retweets * 2) + (replies * 1.5) + (views * 0.001);
}

/**
 * Select the best tweet to reply to:
 * - Highest engagement score
 * - Among tweets with similar scores, pick the newest
 */
function selectBestTweet(tweets: Tweet[]): Tweet | null {
  if (!tweets || tweets.length === 0) return null;

  // Calculate engagement scores and sort
  const tweetsWithScores = tweets.map(tweet => ({
    tweet,
    score: calculateEngagementScore(tweet),
    timestamp: new Date(tweet.created_at).getTime(),
  }));

  // Sort by engagement score (descending), then by timestamp (descending)
  tweetsWithScores.sort((a, b) => {
    // If scores are within 10% of each other, prioritize newer tweets
    const scoreDiff = Math.abs(a.score - b.score);
    const avgScore = (a.score + b.score) / 2;
    const isScoreSimilar = avgScore > 0 && (scoreDiff / avgScore) < 0.1;

    if (isScoreSimilar) {
      return b.timestamp - a.timestamp; // Newer first
    }
    return b.score - a.score; // Higher score first
  });

  return tweetsWithScores[0].tweet;
}

export async function replyToTweetsWorkflow(config: WorkflowConfig) {
  const initialContext: WorkflowContext = {
    searchQuery: config.searchQuery,
    systemPrompt: config.systemPrompt,
    tweets: [],
    generatedReply: '',
  };

  const isDryRun = config.dryRun || false;

  const pipeline = createPipeline<WorkflowContext>();

  const result = await pipeline
    .step('search-tweets', async (ctx) => {
      console.log(`🔍 Searching for tweets with query: "${ctx.searchQuery}"`);

      const results = await searchTwitter({
        query: ctx.searchQuery,
        category: 'Latest',
        count: 20,
        // Note: 'since' filter removed as Twitter AIO API doesn't support it properly
        removePostsWithLinks: true,
        removePostsWithMedia: true,
      });

      console.log(`✅ Found ${results.results.length} tweets`);
      return { ...ctx, tweets: results.results };
    })
    .step('select-hottest', async (ctx) => {
      console.log('🎯 Selecting best tweet to reply to...');

      const selected = selectBestTweet(ctx.tweets || []);

      if (!selected) {
        throw new Error('No suitable tweet found to reply to');
      }

      console.log(`✅ Selected tweet from @${selected.user_screen_name}: "${selected.text.substring(0, 50)}..."`);
      console.log(`   Engagement: ${selected.likes || 0} likes, ${selected.retweets || 0} retweets`);

      return { ...ctx, selectedTweet: selected };
    })
    .step('generate-reply', async (ctx) => {
      if (!ctx.selectedTweet) {
        throw new Error('No tweet selected');
      }

      console.log('🤖 Generating AI reply...');

      const reply = await generateTweetReply(
        ctx.selectedTweet.text,
        ctx.systemPrompt,
        !isDryRun // In dry-run mode, don't use default prompt
      );

      console.log(`✅ Generated reply: "${reply}"`);

      return { ...ctx, generatedReply: reply };
    })
    .step('post-reply', async (ctx): Promise<WorkflowContext> => {
      if (!ctx.selectedTweet || !ctx.generatedReply) {
        throw new Error('Missing tweet or reply');
      }

      if (isDryRun) {
        console.log('🧪 DRY RUN MODE - Skipping actual post to Twitter');
        console.log(`   Would reply to tweet ${ctx.selectedTweet.tweet_id}`);
        console.log(`   With: "${ctx.generatedReply}"`);
        return { ...ctx, replyResult: { dryRun: true, skipped: true } };
      }

      console.log('📤 Posting reply to Twitter...');

      const result = await replyToTweet(
        ctx.selectedTweet.tweet_id,
        ctx.generatedReply
      );

      console.log('✅ Reply posted successfully!');
      console.log(`   Tweet ID: ${result.id}`);

      return { ...ctx, replyResult: result };
    })
    .execute(initialContext);

  return result.finalData as WorkflowContext;
}

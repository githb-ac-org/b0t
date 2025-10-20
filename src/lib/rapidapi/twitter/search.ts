import axios from 'axios';

/**
 * Twitter Search API via RapidAPI
 *
 * Host: twitter-aio.p.rapidapi.com
 * Endpoint: /search/{query}
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = 'twitter-aio.p.rapidapi.com';

interface SearchParams {
  query: string;
  category?: 'Top' | 'Latest' | 'People' | 'Photos' | 'Videos';
  count?: number;
  since?: string; // Format: YYYY-MM-DD
  until?: string; // Format: YYYY-MM-DD
  removePostsWithLinks?: boolean;
  removePostsWithMedia?: boolean;
}

interface Tweet {
  tweet_id: string;
  text: string;
  user_name: string;
  user_screen_name: string;
  created_at: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
  media?: unknown[];
  [key: string]: unknown;
}

interface SearchResponse {
  results: Tweet[];
  next_cursor?: string;
}

export async function searchTwitter(params: SearchParams): Promise<SearchResponse> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not set in environment variables');
  }

  // Build filters object for since/until
  const filters: Record<string, string> = {};
  if (params.since) filters.since = params.since;
  if (params.until) filters.until = params.until;

  const options = {
    method: 'GET',
    url: `https://${API_HOST}/search/${encodeURIComponent(params.query)}`,
    params: {
      count: String(params.count || 20),
      category: params.category || 'Latest',
      ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) }),
      includeTimestamp: 'true',
    },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': API_HOST,
    },
  };

  try {
    const response = await axios.request(options);

    // Parse the complex Twitter AIO response structure
    let results: Tweet[] = [];

    if (response.data.entries && response.data.entries[0]?.entries) {
      const entries = response.data.entries[0].entries;

      for (const entry of entries) {
        try {
          let tweetResult = entry.content?.itemContent?.tweet_results?.result;
          if (!tweetResult) continue;

          // Handle TweetWithVisibilityResults wrapper
          if (tweetResult.__typename === 'TweetWithVisibilityResults') {
            tweetResult = tweetResult.tweet;
          }

          // Now it should be a Tweet
          if (!tweetResult || tweetResult.__typename !== 'Tweet') continue;

          const legacy = tweetResult.legacy;
          const user = tweetResult.core?.user_results?.result?.legacy;

          if (!legacy || !user) continue;

          const tweet: Tweet = {
            tweet_id: tweetResult.rest_id,
            text: legacy.full_text || '',
            user_name: user.name || '',
            user_screen_name: user.screen_name || '',
            created_at: legacy.created_at || '',
            likes: legacy.favorite_count || 0,
            retweets: legacy.retweet_count || 0,
            replies: legacy.reply_count || 0,
            views: tweetResult.views?.count ? parseInt(tweetResult.views.count) : 0,
            media: legacy.entities?.media || [],
          };

          results.push(tweet);
        } catch {
          // Skip malformed tweets
          continue;
        }
      }
    }

    // Filter out tweets with links if requested
    if (params.removePostsWithLinks) {
      results = results.filter(tweet => {
        const text = tweet.text || '';
        // Check for URLs in the text (http, https, or t.co links)
        return !text.match(/https?:\/\/[^\s]+/);
      });
    }

    // Filter out tweets with media if requested
    if (params.removePostsWithMedia) {
      results = results.filter(tweet => {
        return !tweet.media || tweet.media.length === 0;
      });
    }

    return {
      results,
      next_cursor: response.data.next_cursor,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Twitter Search API Error:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw error;
  }
}

// Export the Tweet type for use in other modules
export type { Tweet, SearchParams, SearchResponse };

import { rapidApiAxios } from '@/lib/axios-config';
import { logger } from '@/lib/logger';

/**
 * News API Client (via RapidAPI)
 *
 * Features:
 * - Get trending news by topic, language, and country
 * - Fetch full article content
 * - Get supported topics, languages, and countries
 * - Resilient with circuit breakers and retries (via rapidApiAxios)
 */

const BASE_URL = 'https://news-api14.p.rapidapi.com/v2';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

if (!RAPIDAPI_KEY) {
  logger.warn('⚠️  RAPIDAPI_KEY is not set. News API features will not work.');
}

export interface NewsArticle {
  title: string;
  url: string;
  excerpt: string;
  thumbnail?: string;
  language: string;
  paywall: boolean;
  contentLength: number;
  date: string;
  authors: string[];
  keywords: string[];
  publisher: {
    name: string;
    url: string;
    favicon?: string;
  };
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Array<{
    id: string;
    name: string;
  }>;
}

export interface Language {
  name: string;
  code: string;
}

export interface Country {
  name: string;
  code: string;
  languages: Language[];
}

/**
 * Get trending news articles
 */
export async function getTrendingNews(params?: {
  topic?: string; // e.g., 'technology', 'business', 'ai'
  language?: string; // e.g., 'en', 'es', 'fr'
  country?: string; // e.g., 'us', 'gb', 'de'
  limit?: number; // Max articles to return (default: 10)
  excludeUrls?: string[]; // URLs to exclude (already posted)
}): Promise<NewsArticle[]> {
  const { topic, language = 'en', country = 'us', limit = 10, excludeUrls = [] } = params || {};

  logger.info({ topic, language, country, limit, excludeCount: excludeUrls.length }, '📰 Fetching trending news');

  const queryParams = new URLSearchParams();
  if (topic) queryParams.append('topic', topic);
  if (language) queryParams.append('language', language);
  if (country) queryParams.append('country', country);

  const url = `${BASE_URL}/trendings?${queryParams.toString()}`;

  const response = await rapidApiAxios.get<{ success: boolean; data: NewsArticle[] }>(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'news-api14.p.rapidapi.com',
    },
  });

  // Filter out articles we've already posted about
  let articles = response.data.data || [];
  if (excludeUrls.length > 0) {
    const initialCount = articles.length;
    articles = articles.filter(article => !excludeUrls.includes(article.url));
    logger.info(
      { initialCount, filteredCount: articles.length, excluded: initialCount - articles.length },
      'Filtered out already-posted articles'
    );
  }

  // Slice to limit after filtering
  articles = articles.slice(0, limit);

  logger.info({ count: articles.length }, '✅ Fetched trending news');

  return articles;
}

/**
 * Get full article content
 */
export async function getArticleContent(articleUrl: string): Promise<{
  title: string;
  content: string;
  url: string;
  authors: string[];
  date: string;
}> {
  logger.info({ articleUrl }, '📄 Fetching article content');

  const queryParams = new URLSearchParams({ url: articleUrl });
  const url = `${BASE_URL}/article?${queryParams.toString()}`;

  const response = await rapidApiAxios.get<{
    success: boolean;
    data: {
      title: string;
      content: string;
      url: string;
      authors: string[];
      date: string;
    };
  }>(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'news-api14.p.rapidapi.com',
    },
  });

  logger.info('✅ Fetched article content');

  return response.data.data;
}

/**
 * Get supported topics (with subtopics)
 * This is cached and only needs to be called once
 */
export async function getSupportedTopics(): Promise<Topic[]> {
  const url = `${BASE_URL}/info/topics`;

  const response = await rapidApiAxios.get<{ success: boolean; data: Topic[] }>(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'news-api14.p.rapidapi.com',
    },
  });

  return response.data.data || [];
}

/**
 * Get supported languages
 * This is cached and only needs to be called once
 */
export async function getSupportedLanguages(): Promise<Language[]> {
  const url = `${BASE_URL}/info/languages`;

  const response = await rapidApiAxios.get<{ success: boolean; data: Language[] }>(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'news-api14.p.rapidapi.com',
    },
  });

  return response.data.data || [];
}

/**
 * Get supported countries (with their languages)
 * This is cached and only needs to be called once
 */
export async function getSupportedCountries(): Promise<Country[]> {
  const url = `${BASE_URL}/info/countries`;

  const response = await rapidApiAxios.get<{ success: boolean; data: Country[] }>(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'news-api14.p.rapidapi.com',
    },
  });

  return response.data.data || [];
}

/**
 * Helper: Get a summary of trending news for AI context
 * Returns a formatted string with the selected article's details
 * Also returns the selected article for tracking
 */
export async function getNewsSummaryForAI(params?: {
  topic?: string;
  language?: string;
  country?: string;
  limit?: number;
  excludeUrls?: string[];
}): Promise<{ summary: string; selectedArticle: NewsArticle | null }> {
  const articles = await getTrendingNews(params);

  if (!articles || articles.length === 0) {
    return {
      summary: 'No trending news found for the specified criteria.',
      selectedArticle: null,
    };
  }

  // Use the first (most trending) article as the main one
  const selectedArticle = articles[0];

  // Only include the selected article in the summary to avoid mixing multiple articles
  const summary = `Title: ${selectedArticle.title}\n\nExcerpt: ${selectedArticle.excerpt}\n\nSource: ${selectedArticle.publisher.name}\nDate: ${selectedArticle.date}`;

  return {
    summary: `Latest trending news article:\n\n${summary}`,
    selectedArticle,
  };
}

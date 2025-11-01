import { logger } from '@/lib/logger';

/**
 * Module Registry
 *
 * Generates documentation for all available modules to provide context to LLMs
 * for workflow generation.
 */

export interface ModuleFunction {
  name: string;
  description: string;
  signature: string;
  example?: string;
}

export interface ModuleCategory {
  name: string;
  modules: Array<{
    name: string;
    functions: ModuleFunction[];
  }>;
}

/**
 * Get all available modules organized by category
 */
export function getModuleRegistry(): ModuleCategory[] {
  return [
    {
      name: 'Communication',
      modules: [
        {
          name: 'email',
          functions: [
            {
              name: 'sendEmail',
              description: 'Send an email using Resend',
              signature: 'sendEmail({ to, subject, html, text?, from? })',
              example: 'await sendEmail({ to: "user@example.com", subject: "Hello", html: "<p>Hi!</p>" })',
            },
            {
              name: 'sendEmailWithTemplate',
              description: 'Send templated email',
              signature: 'sendEmailWithTemplate({ to, subject, template, data })',
            },
          ],
        },
        {
          name: 'slack',
          functions: [
            {
              name: 'sendMessage',
              description: 'Send a message to Slack channel',
              signature: 'sendMessage({ token, channel, text, blocks? })',
              example: 'await sendMessage({ token: "xoxb-...", channel: "#general", text: "Hello!" })',
            },
            {
              name: 'sendDirectMessage',
              description: 'Send DM to a Slack user',
              signature: 'sendDirectMessage({ token, userId, text })',
            },
          ],
        },
        {
          name: 'discord',
          functions: [
            {
              name: 'sendMessage',
              description: 'Send message to Discord channel',
              signature: 'sendMessage({ token, channelId, content })',
            },
            {
              name: 'sendEmbed',
              description: 'Send rich embed to Discord',
              signature: 'sendEmbed(channelId, { title, description, color, fields })',
            },
          ],
        },
        {
          name: 'telegram',
          functions: [
            {
              name: 'sendMessage',
              description: 'Send Telegram message',
              signature: 'sendMessage({ botToken, chatId, text, parseMode? })',
            },
            {
              name: 'sendPhoto',
              description: 'Send photo via Telegram',
              signature: 'sendPhoto({ botToken, chatId, photo, caption? })',
            },
          ],
        },
      ],
    },
    {
      name: 'Social Media',
      modules: [
        {
          name: 'twitter',
          functions: [
            {
              name: 'postTweet',
              description: 'Post a tweet to Twitter/X',
              signature: 'postTweet({ text, credentials })',
              example: 'await postTweet({ text: "Hello Twitter!", credentials: { apiKey, apiSecret, accessToken, accessSecret } })',
            },
            {
              name: 'postThread',
              description: 'Post a Twitter thread',
              signature: 'postThread({ tweets, credentials })',
            },
          ],
        },
        {
          name: 'reddit',
          functions: [
            {
              name: 'submitPost',
              description: 'Submit post to Reddit',
              signature: 'submitPost({ subreddit, title, text?, url?, credentials })',
            },
          ],
        },
        {
          name: 'instagram',
          functions: [
            {
              name: 'publishPhoto',
              description: 'Publish photo to Instagram',
              signature: 'publishPhoto({ imageUrl, caption, credentials })',
            },
          ],
        },
      ],
    },
    {
      name: 'Data',
      modules: [
        {
          name: 'database',
          functions: [
            {
              name: 'query',
              description: 'Query database with WHERE conditions',
              signature: 'query({ table, select?, where?, limit? })',
              example: 'await query({ table: "tweet_replies", where: { status: "posted" } })',
            },
            {
              name: 'queryWhereIn',
              description: 'Query database with WHERE IN condition',
              signature: 'queryWhereIn({ table, column, values, select? })',
              example: 'await queryWhereIn({ table: "tweet_replies", column: "original_tweet_id", values: ["123", "456"] })',
            },
            {
              name: 'insert',
              description: 'Insert record(s) into database',
              signature: 'insert({ table, data })',
              example: 'await insert({ table: "tweet_replies", data: { original_tweet_id: "123", our_reply_text: "Hello!" } })',
            },
            {
              name: 'update',
              description: 'Update records in database',
              signature: 'update({ table, data, where })',
              example: 'await update({ table: "tweet_replies", data: { status: "archived" }, where: { original_tweet_id: "123" } })',
            },
            {
              name: 'deleteRecords',
              description: 'Delete records from database',
              signature: 'deleteRecords({ table, where })',
            },
            {
              name: 'count',
              description: 'Count records in table',
              signature: 'count({ table, where? })',
              example: 'await count({ table: "tweet_replies", where: { status: "posted" } })',
            },
            {
              name: 'exists',
              description: 'Check if record exists',
              signature: 'exists({ table, where })',
              example: 'await exists({ table: "tweet_replies", where: { original_tweet_id: "123" } })',
            },
            {
              name: 'getOne',
              description: 'Get single record (first match)',
              signature: 'getOne({ table, where, select? })',
            },
          ],
        },
        {
          name: 'mongodb',
          functions: [
            {
              name: 'find',
              description: 'Find documents in MongoDB',
              signature: 'find(uri, database, collection, filter?, options?)',
              example: 'await find("mongodb://...", "mydb", "users", { age: { $gt: 18 } })',
            },
            {
              name: 'insertOne',
              description: 'Insert one document',
              signature: 'insertOne(uri, database, collection, document)',
            },
            {
              name: 'updateOne',
              description: 'Update one document',
              signature: 'updateOne(uri, database, collection, filter, update)',
            },
          ],
        },
        {
          name: 'postgresql',
          functions: [
            {
              name: 'query',
              description: 'Execute SQL query',
              signature: 'query(connection, sql, params?)',
              example: 'await query({ host, user, password, database }, "SELECT * FROM users WHERE id = $1", [123])',
            },
            {
              name: 'select',
              description: 'Select rows from table',
              signature: 'select(connection, table, { columns?, where?, orderBy?, limit? })',
            },
            {
              name: 'insert',
              description: 'Insert row into table',
              signature: 'insert(connection, table, data)',
            },
          ],
        },
        {
          name: 'airtable',
          functions: [
            {
              name: 'selectRecords',
              description: 'Query Airtable records',
              signature: 'selectRecords({ apiKey, baseId, tableName, filterByFormula?, maxRecords? })',
            },
            {
              name: 'createRecord',
              description: 'Create Airtable record',
              signature: 'createRecord(apiKey, baseId, tableName, fields)',
            },
          ],
        },
        {
          name: 'google-sheets',
          functions: [
            {
              name: 'getRows',
              description: 'Get rows from Google Sheet',
              signature: 'getRows(spreadsheetId, sheetTitle?, options?)',
            },
            {
              name: 'addRow',
              description: 'Add row to Google Sheet',
              signature: 'addRow(spreadsheetId, data, sheetTitle?)',
            },
          ],
        },
      ],
    },
    {
      name: 'AI',
      modules: [
        {
          name: 'openai',
          functions: [
            {
              name: 'createCompletion',
              description: 'Generate text with GPT',
              signature: 'createCompletion({ apiKey, model, messages, temperature?, maxTokens? })',
              example: 'await createCompletion({ apiKey: "sk-...", model: "gpt-4", messages: [{ role: "user", content: "Hello!" }] })',
            },
            {
              name: 'generateImage',
              description: 'Generate image with DALL-E',
              signature: 'generateImage({ apiKey, prompt, size?, quality? })',
            },
          ],
        },
        {
          name: 'anthropic',
          functions: [
            {
              name: 'createCompletion',
              description: 'Generate text with Claude',
              signature: 'createCompletion({ apiKey, model, messages, maxTokens? })',
            },
          ],
        },
      ],
    },
    {
      name: 'Utilities',
      modules: [
        {
          name: 'http',
          functions: [
            {
              name: 'httpGet',
              description: 'Make HTTP GET request',
              signature: 'httpGet(url, options?)',
              example: 'await httpGet("https://api.example.com/data", { headers: { "Authorization": "Bearer token" } })',
            },
            {
              name: 'httpPost',
              description: 'Make HTTP POST request',
              signature: 'httpPost(url, data, options?)',
            },
          ],
        },
        {
          name: 'rss',
          functions: [
            {
              name: 'parseFeed',
              description: 'Parse RSS/Atom feed',
              signature: 'parseFeed(url)',
              example: 'await parseFeed("https://example.com/feed.xml")',
            },
            {
              name: 'getLatestItems',
              description: 'Get N latest items from feed',
              signature: 'getLatestItems(url, limit)',
            },
          ],
        },
        {
          name: 'scraper',
          functions: [
            {
              name: 'fetchHtml',
              description: 'Fetch and parse HTML from URL',
              signature: 'fetchHtml(url)',
            },
            {
              name: 'extractText',
              description: 'Extract text using CSS selector',
              signature: 'extractText($, selector)',
            },
            {
              name: 'extractLinks',
              description: 'Extract all links from page',
              signature: 'extractLinks($, baseUrl?, selector?)',
            },
          ],
        },
        {
          name: 'datetime',
          functions: [
            {
              name: 'now',
              description: 'Get current date/time',
              signature: 'now()',
              example: 'const now = await now()',
            },
            {
              name: 'formatDate',
              description: 'Format date to string',
              signature: 'formatDate(date, formatString)',
              example: 'formatDate(new Date(), "yyyy-MM-dd") → "2025-11-01"',
            },
            {
              name: 'addDays',
              description: 'Add days to date',
              signature: 'addDays(date, days)',
              example: 'addDays(new Date(), 7) → Date 7 days in future',
            },
            {
              name: 'addHours',
              description: 'Add hours to date',
              signature: 'addHours(date, hours)',
            },
            {
              name: 'addMinutes',
              description: 'Add minutes to date',
              signature: 'addMinutes(date, minutes)',
            },
            {
              name: 'fromISO',
              description: 'Parse ISO 8601 string to Date',
              signature: 'fromISO(isoString)',
            },
            {
              name: 'toISO',
              description: 'Format Date to ISO 8601 string',
              signature: 'toISO(date)',
            },
          ],
        },
        {
          name: 'string-utils',
          functions: [
            {
              name: 'slugify',
              description: 'Convert string to URL-safe slug',
              signature: 'slugify(text)',
              example: 'slugify("Hello World!") → "hello-world"',
            },
            {
              name: 'truncate',
              description: 'Truncate string to length',
              signature: 'truncate(text, maxLength)',
            },
          ],
        },
        {
          name: 'array-utils',
          functions: [
            {
              name: 'first',
              description: 'Get first N items from array',
              signature: 'first(array, count?)',
              example: 'first([1,2,3], 2) → [1,2]',
            },
            {
              name: 'last',
              description: 'Get last N items from array',
              signature: 'last(array, count?)',
            },
            {
              name: 'unique',
              description: 'Get unique values from array',
              signature: 'unique(array)',
            },
            {
              name: 'chunk',
              description: 'Split array into chunks of size N',
              signature: 'chunk(array, size)',
            },
            {
              name: 'shuffle',
              description: 'Randomly shuffle array',
              signature: 'shuffle(array)',
            },
            {
              name: 'sortBy',
              description: 'Sort array of objects by property',
              signature: 'sortBy(array, key, order?)',
            },
            {
              name: 'groupBy',
              description: 'Group array of objects by property',
              signature: 'groupBy(array, key)',
            },
            {
              name: 'sum',
              description: 'Sum numbers in array',
              signature: 'sum(array)',
            },
            {
              name: 'average',
              description: 'Calculate average of numbers',
              signature: 'average(array)',
            },
            {
              name: 'pluck',
              description: 'Extract property values from objects',
              signature: 'pluck(array, key)',
              example: 'pluck([{id:1},{id:2}], "id") → [1,2]',
            },
          ],
        },
        {
          name: 'filesystem',
          functions: [
            {
              name: 'readFile',
              description: 'Read file contents',
              signature: 'readFile(filePath, encoding?)',
            },
            {
              name: 'writeFile',
              description: 'Write file contents',
              signature: 'writeFile(filePath, content, encoding?)',
            },
          ],
        },
        {
          name: 'deduplication',
          functions: [
            {
              name: 'filterProcessed',
              description: 'Filter out IDs that already exist in database',
              signature: 'filterProcessed({ tableName, idColumn, idsToCheck })',
              example: 'await filterProcessed({ tableName: "tweet_replies", idColumn: "original_tweet_id", idsToCheck: ["123", "456"] })',
            },
            {
              name: 'hasProcessed',
              description: 'Check if single ID exists in database',
              signature: 'hasProcessed({ tableName, idColumn, idToCheck })',
            },
            {
              name: 'filterProcessedItems',
              description: 'Filter array of objects to remove already-processed items',
              signature: 'filterProcessedItems({ items, tableName, idColumn, itemIdField })',
              example: 'await filterProcessedItems({ items: tweets, tableName: "tweet_replies", idColumn: "original_tweet_id", itemIdField: "tweet_id" })',
            },
            {
              name: 'markAsProcessed',
              description: 'Mark item as processed by inserting record',
              signature: 'markAsProcessed({ tableName, record })',
            },
          ],
        },
        {
          name: 'scoring',
          functions: [
            {
              name: 'rankByWeightedScore',
              description: 'Rank array by weighted score calculation (e.g., engagement)',
              signature: 'rankByWeightedScore({ items, scoreFields, tieBreaker?, similarityThreshold? })',
              example: 'await rankByWeightedScore({ items: tweets, scoreFields: [{ field: "likes", weight: 1 }, { field: "retweets", weight: 2 }], tieBreaker: { field: "created_at", order: "desc" } })',
            },
            {
              name: 'calculateScore',
              description: 'Calculate weighted score for single item',
              signature: 'calculateScore({ item, scoreFields })',
            },
            {
              name: 'selectTop',
              description: 'Select top N items from array',
              signature: 'selectTop({ items, count? })',
              example: 'await selectTop({ items: rankedTweets, count: 1 })',
            },
            {
              name: 'selectBottom',
              description: 'Select bottom N items from array',
              signature: 'selectBottom({ items, count? })',
            },
            {
              name: 'selectRandom',
              description: 'Select random item(s) from array',
              signature: 'selectRandom({ items, count? })',
            },
            {
              name: 'rankByField',
              description: 'Rank items by single field',
              signature: 'rankByField({ items, field, order? })',
              example: 'await rankByField({ items: tweets, field: "likes", order: "desc" })',
            },
            {
              name: 'filterByMinScore',
              description: 'Filter items above minimum score threshold',
              signature: 'filterByMinScore({ items, scoreFields, minScore })',
            },
          ],
        },
      ],
    },
  ];
}

/**
 * Map category display names to path names
 */
const categoryPathMap: Record<string, string> = {
  'Communication': 'communication',
  'Social Media': 'social',
  'Data': 'data',
  'AI': 'ai',
  'Utilities': 'utilities',
  'Payments': 'payments',
  'Productivity': 'productivity',
};

/**
 * Generate markdown documentation for LLM context
 */
export function generateModuleDocs(): string {
  logger.info('Generating module documentation for LLM');

  const registry = getModuleRegistry();

  let docs = '# Available Workflow Modules\n\n';
  docs += 'These modules can be used to build workflows. Each function takes inputs and returns outputs that can be used in subsequent steps.\n\n';
  docs += '## Module Path Format\n';
  docs += 'All module paths must use: `category.module.function` (all lowercase)\n\n';
  docs += '**Category Mappings:**\n';
  for (const [display, path] of Object.entries(categoryPathMap)) {
    docs += `- ${display} → \`${path}\`\n`;
  }
  docs += '\n';

  for (const category of registry) {
    const categoryPath = categoryPathMap[category.name] || category.name.toLowerCase();
    docs += `## ${category.name} (category: \`${categoryPath}\`)\n\n`;

    for (const mod of category.modules) {
      docs += `### ${mod.name}\n\n`;

      for (const func of mod.functions) {
        const fullPath = `${categoryPath}.${mod.name}.${func.name}`;
        docs += `**${func.name}** → \`${fullPath}\`\n`;
        docs += `- ${func.description}\n`;
        docs += `- Signature: \`${func.signature}\`\n`;

        if (func.example) {
          docs += `- Example: \`${func.example}\`\n`;
        }

        docs += '\n';
      }
    }
  }

  logger.info({ docLength: docs.length }, 'Module documentation generated');

  return docs;
}

/**
 * Validate if a module function exists
 */
export function validateModuleFunction(modulePath: string): boolean {
  const [category, moduleName, functionName] = modulePath.split('.');

  if (!category || !moduleName || !functionName) {
    return false;
  }

  const registry = getModuleRegistry();

  // Find category by matching the path name
  const categoryData = registry.find(c => {
    const path = categoryPathMap[c.name] || c.name.toLowerCase();
    return path === category.toLowerCase();
  });

  if (!categoryData) return false;

  const moduleData = categoryData.modules.find(m => m.name === moduleName);

  if (!moduleData) return false;

  return moduleData.functions.some(f => f.name === functionName);
}

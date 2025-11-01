---
description: Generate and execute a custom workflow from natural language description
---

You are creating a workflow based on the user's request. Follow these steps exactly.

**Step 1: Read the module registry**

Read `src/lib/workflows/module-registry.ts` to understand all available modules. This contains 100+ functions organized by category:
- `communication` - Email, Slack, Discord, Telegram
- `social` - Twitter, Reddit, YouTube, Instagram, GitHub
- `data` - MongoDB, PostgreSQL, Airtable, Google Sheets, Notion
- `ai` - OpenAI, Anthropic
- `utilities` - HTTP, RSS, datetime, filesystem, CSV, images, PDF, XML, encryption, compression
- `payments` - Stripe
- `productivity` - Google Calendar

**Step 2: Generate workflow JSON**

Based on the user's request, create a workflow configuration with:

```typescript
{
  name: "Short descriptive name",
  description: "What this workflow does",
  trigger: {
    type: "manual" | "cron" | "webhook" | "telegram" | "discord" | "chat",
    config: { schedule: "0 */6 * * *" } // Only if type is "cron"
  },
  config: {
    steps: [
      {
        id: "step1",
        module: "category.module.function", // MUST be lowercase: utilities.datetime.now
        inputs: { param: "value" },
        outputAs: "variableName" // Optional: save output for next steps
      }
    ]
  }
}
```

**CRITICAL RULES:**
- Module paths MUST be `category.module.function` format (all lowercase)
- Use `{{variableName}}` to reference previous step outputs
- Access nested data: `{{feed.items[0].title}}`
- Each step's inputs are passed as positional arguments to the function

**Step 3: Save to database**

Use SQLite to insert the workflow directly:

```bash
sqlite3 data/local.db << 'EOF'
INSERT INTO workflows (
  id, user_id, name, description, prompt, config, trigger,
  status, created_at, run_count
) VALUES (
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))),
  '1',
  'Workflow Name',
  'Description',
  'Original user request',
  '{"steps":[...]}',
  '{"type":"manual","config":{}}',
  'draft',
  unixepoch(),
  0
);
EOF
```

**CRITICAL: JSON Format Requirements**
- Both `config` and `trigger` columns MUST contain valid JSON objects (not plain strings)
- `config` must have format: `'{"steps":[...]}'`
- `trigger` must have format: `'{"type":"manual","config":{}}'` (NOT just `'manual'`)
- Invalid JSON will cause Drizzle parsing errors when reading from database

**Step 4: Test the workflow**

After inserting, verify it works:
1. Check it appears at http://localhost:3000/dashboard/workflows
2. Click "Run" (or Chat/Webhook/Schedule depending on trigger type) to execute
3. View results in the execution dialog
4. Check execution history with the "History" button
5. Configure settings via the "Settings" button (optional)

**Step 5: Show results**

Display:
- ✅ Workflow created and ready to run
- 📍 Location: Dashboard → Workflows
- 🎯 Next: Click "Run" to execute it
- 💡 Tip: Use "Settings" to configure AI prompts, trigger schedules, and step parameters
- Show the workflow JSON for reference

**Workflow UI Features:**
- **Run Button**: Execute workflow (label changes based on trigger: Chat, Webhook, Schedule, Telegram, Discord, or Run)
- **Settings Button**: Unified configuration dialog for:
  - Trigger settings (cron schedules, bot tokens)
  - Step settings (AI prompts, model selection, parameters)
  - All configurable fields auto-detected based on module type
- **Credentials Button**: Manage API keys and OAuth tokens
- **History Button**: View execution logs and results
- **Export/Delete Icons**: In workflow card header

**Example: "Get current date and format it"**

1. **Read module registry** - Check available datetime functions
2. **Generate workflow JSON:**
```json
{
  "name": "Date Formatter",
  "description": "Gets current date and formats it",
  "trigger": { "type": "manual", "config": {} },
  "config": {
    "steps": [
      {
        "id": "get-date",
        "module": "utilities.datetime.now",
        "inputs": {},
        "outputAs": "currentDate"
      },
      {
        "id": "format-iso",
        "module": "utilities.datetime.toISO",
        "inputs": { "date": "{{currentDate}}" },
        "outputAs": "isoDate"
      }
    ]
  }
}
```

3. **Insert to database** using the SQL command above
4. **Tell user**: "✅ Workflow created! Visit http://localhost:3000/dashboard/workflows and click Run"

**Important:** Always verify module names exist in the registry before creating workflows. Use exact function signatures from the module files.

## **CRITICAL: New Generic Workflow Modules**

You now have access to powerful generic modules that enable complex workflow patterns:

### **1. Database Operations** (`data.database.*`)
- `query()` - Query with WHERE conditions
- `queryWhereIn()` - Query with WHERE IN clause
- `insert()` - Insert records
- `update()` - Update records
- `exists()` - Check if record exists
- `count()` - Count records

### **2. Deduplication** (`utilities.deduplication.*`)
- `filterProcessed()` - Filter out already-processed IDs
- `filterProcessedItems()` - Filter array to remove processed items
- `hasProcessed()` - Check if single item was processed

### **3. Scoring & Ranking** (`utilities.scoring.*`)
- `rankByWeightedScore()` - Rank by custom weighted metrics (engagement, popularity, etc.)
- `selectTop()` - Select top N items
- `rankByField()` - Simple ranking by single field

### **4. Array Utilities** (`utilities.array-utils.*`)
- `pluck()` - Extract property values
- `sortBy()` - Sort objects by property
- `first()`, `last()` - Get items from ends
- `sum()`, `average()` - Aggregate operations

## **Pattern: Deduplication + Ranking + Selection**

Many workflows follow this pattern (Twitter replies, YouTube comments, etc.):

```json
{
  "steps": [
    {
      "id": "fetch-data",
      "module": "external-apis.rapidapi.twitter.searchTwitter",
      "inputs": { "query": "AI automation" },
      "outputAs": "results"
    },
    {
      "id": "extract-ids",
      "module": "utilities.array-utils.pluck",
      "inputs": { "arr": "{{results.results}}", "key": "tweet_id" },
      "outputAs": "allIds"
    },
    {
      "id": "filter-processed",
      "module": "utilities.deduplication.filterProcessed",
      "inputs": {
        "tableName": "tweet_replies",
        "idColumn": "original_tweet_id",
        "idsToCheck": "{{allIds}}"
      },
      "outputAs": "newIds"
    },
    {
      "id": "rank-by-engagement",
      "module": "utilities.scoring.rankByWeightedScore",
      "inputs": {
        "items": "{{results.results}}",
        "scoreFields": [
          { "field": "likes", "weight": 1 },
          { "field": "retweets", "weight": 2 }
        ],
        "tieBreaker": { "field": "created_at", "order": "desc" }
      },
      "outputAs": "ranked"
    },
    {
      "id": "select-best",
      "module": "utilities.scoring.selectTop",
      "inputs": { "items": "{{ranked}}", "count": 1 },
      "outputAs": "selected"
    },
    {
      "id": "save-result",
      "module": "data.database.insert",
      "inputs": {
        "table": "tweet_replies",
        "data": {
          "original_tweet_id": "{{selected.tweet_id}}",
          "processed_at": "{{utilities.datetime.now}}"
        }
      }
    }
  ]
}
```

## **When to Create New Module Functions**

If the user requests complex logic that requires:
- Custom business rules
- Multi-step transformations
- Platform-specific combinations

Then you should:
1. Create a new module file in `src/modules/[category]/[module-name].ts`
2. Update the module registry in `src/lib/workflows/module-registry.ts`
3. Use the new module in the workflow JSON

**Example:** A "findBestTweetToReplyTo" function that combines search + filter + rank + select into one reusable module.

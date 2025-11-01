# b0t

An AI-powered workflow automation platform. Users describe automations in natural language, and AI generates and executes workflows using composable modules.

## Product Vision

b0t is an LLM-first workflow automation platform where users create automations by chatting with AI. No coding, no visual editors—just describe what you want automated:

- **LLM-generated workflows** - AI writes workflow configurations from user prompts
- **Modular architecture** - 100+ pre-built modules (APIs, databases, social media, AI, etc.)
- **Multiple triggers** - Cron schedules, webhooks, Telegram/Discord bots, manual execution
- **Production-ready** - Circuit breakers, retries, rate limiting, structured logging
- **Self-hosted or cloud** - Run on your infrastructure or use hosted version

**Core Philosophy:**
- AI generates workflows, humans supervise
- Composable modules (src/modules/*) as building blocks
- Simple chat interface, powerful automation capabilities
- Production-grade reliability and observability

## Current State

The system is organized around **composable modules** in `src/modules/`:

**Communication:** Slack, Discord, Telegram, Email (Resend)
**Social Media:** Twitter, YouTube, Instagram, Reddit, GitHub
**Data:** MongoDB, MySQL, PostgreSQL, Notion, Google Sheets, Airtable
**AI:** OpenAI, Anthropic Claude
**Utilities:** HTTP, File System, CSV, Image Processing, PDF, Web Scraping, RSS, XML, Encryption, Compression
**Payments:** Stripe
**Productivity:** Google Calendar

**Legacy pre-built workflows** exist in the codebase as examples but will be migrated to the LLM-generated approach.

**Next Steps:**
- Build LLM workflow generation system
- Create workflow execution engine with trigger support
- Add module documentation for AI context
- Build simple chat interface for workflow creation

## Project Structure

```
src/
  ├── app/                 # Next.js 15 App Router
  │   ├── api/            # REST API endpoints
  │   │   ├── auth/       # NextAuth.js authentication
  │   │   ├── workflows/  # Workflow execution & management
  │   │   ├── jobs/       # Job control & triggering
  │   │   ├── webhooks/   # Webhook triggers
  │   │   └── scheduler/  # Cron scheduling
  │   ├── dashboard/      # Main dashboard
  │   ├── workflows/      # Workflow chat interface & management
  │   ├── social-media/   # Legacy: Pre-built automations (being migrated)
  │   ├── content/        # Legacy: Content automations (being migrated)
  │   ├── setup/          # Initial onboarding
  │   └── settings/       # User settings & credentials
  ├── components/         # React components
  │   ├── ui/            # Shadcn/ui components
  │   ├── ai-elements/   # AI streaming UI
  │   ├── workflow/      # Workflow chat & management UI
  │   ├── dashboard/     # Dashboard widgets
  │   └── layout/        # Navbar, layouts
  ├── modules/           # ⭐ Composable automation modules
  │   ├── communication/ # Slack, Discord, Telegram, Email
  │   ├── social/        # Twitter, Reddit, YouTube, Instagram, GitHub
  │   ├── data/          # Databases (MongoDB, PostgreSQL, MySQL, etc.)
  │   ├── ai/            # OpenAI, Anthropic
  │   ├── utilities/     # HTTP, Files, CSV, Images, Encryption, etc.
  │   ├── payments/      # Stripe
  │   └── productivity/  # Google Calendar
  ├── lib/               # Core business logic
  │   ├── workflows/     # Workflow execution engine & LLM generator
  │   ├── jobs/          # BullMQ & cron jobs
  │   ├── schema.ts      # Drizzle ORM models
  │   ├── db.ts          # Database connection
  │   ├── auth.ts        # Authentication
  │   ├── logger.ts      # Structured logging
  │   └── [platform].ts  # Legacy platform API clients
docs/                    # Setup guides
drizzle/                 # Database migrations
```

## Organization Rules

**Keep code organized and modularized:**
- API routes → `/app/api`, one file per endpoint
- Components → `/components/[category]`, one component per file
- **Modules** → `/src/modules/[category]/[module].ts` - Self-contained, composable functions
- Business logic → `/lib`, grouped by domain (workflows, jobs, auth)
- Database models → `/lib/schema.ts`
- Tests → Co-located with code as `*.test.ts`

**Module principles:**
- Each module exports pure functions that take inputs and return outputs
- Include circuit breakers (opossum), rate limiting (bottleneck), and logging
- Full TypeScript types with JSDoc documentation
- Single responsibility - one module per service/API
- No side effects - modules don't maintain state

## Code Quality - Zero Tolerance

After editing ANY file, run:

```bash
npm run lint
npx tsc --noEmit
```

Fix ALL errors/warnings before continuing.

If changes require server restart (not hot-reloadable):
1. Restart: `npm run dev`
2. Read server output/logs
3. Fix ALL warnings/errors before continuing

## Workflow System

Users create workflows by chatting with Claude. Claude generates the workflow JSON, saves it, and executes it.

**When user requests a workflow:**

1. Read `src/lib/workflows/module-registry.ts` for available modules (100+ functions)
2. Generate workflow JSON with `category.module.function` paths (e.g., `utilities.datetime.now`)
3. Save to database using `sqliteDb.insert(workflowsTableSQLite)`
4. Execute with `executeWorkflowConfig(workflow.config, userId)`
5. Show results

**Module path format:** `category.module.function`
- Categories: `communication`, `social`, `data`, `ai`, `utilities`, `payments`, `productivity`
- Example: `utilities.datetime.formatDate` → `src/modules/utilities/datetime.ts` → `formatDate()`

**Variable passing:** Use `{{variableName}}` to reference previous step outputs
- `{{feed.items[0].title}}` - Access nested properties/arrays
- Steps with `outputAs` save results for later steps

**Workflow Configuration:**
- Users can configure workflow settings via the unified Settings dialog
- Settings are organized as collapsible FAQ-style sections:
  - **Trigger Settings**: Configure cron schedules, bot tokens (Telegram/Discord)
  - **Step Settings**: Configure AI prompts, models, parameters for each workflow step
- The system automatically detects configurable fields based on module type:
  - AI modules: systemPrompt, model, temperature, maxTokens
  - Social modules: maxResults, filters
  - Utility modules: maxLength, formatting options
  - Communication modules: message templates
- All settings are saved together and applied to the workflow config

**Key files:**
- `src/lib/workflows/module-registry.ts` - All available modules
- `src/lib/workflows/executor.ts` - Executes workflows
- `src/lib/schema.ts` - Database tables (workflows, workflow_runs)
- `src/components/workflows/workflow-settings-dialog.tsx` - Unified settings configuration UI

## Tech Stack

- **Next.js 15** with React 19 and App Router
- **PostgreSQL** for production, SQLite for local dev
- **Drizzle ORM** for database
- **BullMQ + Redis** for job queue (node-cron fallback)
- **OpenAI SDK** + **Anthropic SDK** for LLM workflow generation
- **NextAuth v5** for authentication
- **Tailwind CSS** + shadcn/ui for design system
- **Opossum** (circuit breakers) + **Bottleneck** (rate limiting)
- **Pino** for structured logging

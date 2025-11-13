# AI Agent Example Workflows

This document contains example workflow configurations that demonstrate the AI agent capabilities with tool calling.

## Prerequisites

- Anthropic API key in environment variables (`ANTHROPIC_API_KEY`)
- User credentials configured for platforms you want to use (Twitter, Discord, etc.)

## Example 1: Social Media Agent

A conversational agent that can post to Twitter, search Reddit, and interact with Discord.

**Workflow Configuration:**
```json
{
  "version": "1.0",
  "name": "Social Media Agent",
  "description": "AI agent that can autonomously manage social media across platforms",
  "trigger": {
    "type": "chat",
    "config": {
      "inputVariable": "userMessage"
    }
  },
  "config": {
    "steps": [
      {
        "id": "agent",
        "module": "ai.ai-agent.runSocialAgent",
        "inputs": {
          "prompt": "{{trigger.userMessage}}"
        },
        "outputAs": "result"
      }
    ],
    "returnValue": "{{result.text}}"
  }
}
```

**Example Usage:**
- User: "Post a tweet about AI workflow automation"
- Agent: Composes and posts tweet using Twitter module
- User: "Search Reddit for discussions about automation"
- Agent: Uses Reddit search module and summarizes results

## Example 2: Communication Agent

An agent that can send emails, Slack messages, Discord notifications, etc.

**Workflow Configuration:**
```json
{
  "version": "1.0",
  "name": "Communication Agent",
  "description": "AI agent for multi-channel communication",
  "trigger": {
    "type": "chat",
    "config": {
      "inputVariable": "userMessage"
    }
  },
  "config": {
    "steps": [
      {
        "id": "agent",
        "module": "ai.ai-agent.runCommunicationAgent",
        "inputs": {
          "prompt": "{{trigger.userMessage}}"
        },
        "outputAs": "result"
      }
    ],
    "returnValue": "{{result.text}}"
  }
}
```

**Example Usage:**
- User: "Send an email to team@company.com with project update"
- Agent: Drafts and sends email via SMTP module
- User: "Post in #general Slack channel about the meeting"
- Agent: Uses Slack module to post message

## Example 3: Custom Agent with Specific Tools

An agent with access to only specific tool categories.

**Workflow Configuration:**
```json
{
  "version": "1.0",
  "name": "Custom Research Agent",
  "description": "AI agent with data analysis and search capabilities",
  "trigger": {
    "type": "chat",
    "config": {
      "inputVariable": "userMessage"
    }
  },
  "config": {
    "steps": [
      {
        "id": "agent",
        "module": "ai.ai-agent.runAgent",
        "inputs": {
          "prompt": "{{trigger.userMessage}}",
          "systemPrompt": "You are a research assistant. Help users find and analyze information using available tools.",
          "toolOptions": {
            "categories": ["utilities", "data", "ai"]
          }
        },
        "outputAs": "result"
      }
    ],
    "returnValue": "{{result.text}}"
  }
}
```

**Example Usage:**
- User: "Fetch data from https://api.example.com and analyze it"
- Agent: Uses HTTP module to fetch, then AI modules to analyze
- User: "Search for recent research papers on AI agents"
- Agent: Uses search utilities to find papers and summarizes findings

## Example 4: Universal Agent (All Tools)

An agent with access to all 1200+ tools across all categories.

**Workflow Configuration:**
```json
{
  "version": "1.0",
  "name": "Universal AI Agent",
  "description": "AI agent with access to all platform modules",
  "trigger": {
    "type": "chat",
    "config": {
      "inputVariable": "userMessage"
    }
  },
  "config": {
    "steps": [
      {
        "id": "agent",
        "module": "ai.ai-agent.runUniversalAgent",
        "inputs": {
          "prompt": "{{trigger.userMessage}}",
          "maxTools": 100
        },
        "outputAs": "result"
      }
    ],
    "returnValue": "{{result.text}}"
  }
}
```

**Example Usage:**
- User: "Check Twitter for mentions, then summarize and post to Discord"
- Agent: Searches Twitter, uses AI to summarize, posts to Discord
- User: "Generate an image and post it to Instagram"
- Agent: Uses image generation module, then Instagram posting module

## How It Works

1. **Tool Generation**: The agent system automatically converts all 1282+ module functions into AI SDK tools
2. **Autonomous Selection**: Claude (or GPT) selects which tools to call based on user input
3. **Multi-Step Execution**: The agent can chain multiple tool calls to accomplish complex tasks
4. **Natural Language**: Users interact in plain English, agent handles tool selection and execution

## Tool Categories Available

- **ai** (85 tools): AI generation, embeddings, vector databases
- **social** (35 tools): Twitter, Reddit, LinkedIn, Instagram
- **communication** (94 tools): Email, Slack, Discord, Telegram
- **data** (88 tools): Databases, Google Sheets, Airtable
- **utilities** (418 tools): HTTP, date/time, text processing, etc.
- **business** (123 tools): CRMs, accounting, sales tools
- **And 10 more categories...**

## Advanced Usage

### Custom System Prompts

```json
{
  "id": "agent",
  "module": "ai.ai-agent.runAgent",
  "inputs": {
    "prompt": "{{trigger.userMessage}}",
    "systemPrompt": "You are a social media expert. Always check engagement metrics before posting. Be concise and professional.",
    "toolOptions": {
      "categories": ["social", "ai"]
    }
  }
}
```

### Specific Model Selection

```json
{
  "id": "agent",
  "module": "ai.ai-agent.runAgent",
  "inputs": {
    "prompt": "{{trigger.userMessage}}",
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.3,
    "toolOptions": {
      "categories": ["ai", "data"]
    }
  }
}
```

### Credential Injection

```json
{
  "id": "agent",
  "module": "ai.ai-agent.runAgent",
  "inputs": {
    "prompt": "{{trigger.userMessage}}",
    "toolOptions": {
      "categories": ["social"],
      "credentials": {
        "twitter_apikey": "{{credential.twitter_apikey}}",
        "reddit_apikey": "{{credential.reddit_apikey}}"
      }
    }
  }
}
```

## Creating Agent Workflows via Chat

You can ask Claude Code to create these workflows for you:

```
User: "Create a workflow that uses an AI agent to help me manage social media"
Claude Code: *generates workflow JSON with ai-agent module*

User: "Create an agent that can research topics and send email summaries"
Claude Code: *generates workflow with data + communication tools*
```

## Phase 2 Enhancements (Coming Soon)

- **Step-by-step tracking**: See each tool call as it happens
- **Streaming responses**: Real-time agent thinking + tool execution
- **Memory/RAG**: Agents remember previous conversations
- **Planning loops**: Multi-step reasoning with reflection
- **Error recovery**: Automatic retry and correction
- **Multi-agent coordination**: Multiple agents working together

## Testing

Run the test script to verify tool generation:
```bash
npx tsx scripts/test-agent-tools.ts
```

Check available tools:
```bash
npx tsx scripts/search-modules.ts runAgent
```

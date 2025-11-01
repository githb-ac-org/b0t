#!/usr/bin/env tsx

import { sqliteDb } from '../src/lib/db';
import { workflowsTableSQLite } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

const workflows = [
  {
    id: 'test-cron-001',
    userId: '1',
    name: '⏰ Daily Content Generator',
    description: 'Scheduled workflow that runs daily at 9 AM - Test cron trigger config',
    prompt: 'Create a workflow that generates daily content tips',
    status: 'active',
    trigger: { type: 'cron' as const, config: { schedule: '0 9 * * *' } },
    config: {
      steps: [
        {
          id: 'get-time',
          module: 'utilities.datetime.now',
          inputs: {},
          outputAs: 'currentTime',
        },
        {
          id: 'generate',
          module: 'ai.openai-workflow.generateText',
          inputs: {
            prompt: 'Generate a short daily tip about productivity',
          },
          outputAs: 'dailyTip',
        },
      ],
    },
    runCount: 0,
  },
  {
    id: 'test-chat-002',
    userId: '1',
    name: '💬 AI Assistant Chat',
    description: 'Interactive chat workflow - Test chat trigger interface',
    prompt: 'Create an AI assistant that responds to chat messages',
    status: 'active',
    trigger: { type: 'chat' as const, config: {} },
    config: {
      steps: [
        {
          id: 'respond',
          module: 'ai.openai-workflow.generateText',
          inputs: {
            prompt: '{{trigger.message}}',
            apiKey: '{{user.openai}}',
            model: 'gpt-4',
            systemPrompt: 'You are a helpful AI assistant. Be concise and friendly.',
          },
          outputAs: 'response',
        },
      ],
    },
    runCount: 0,
  },
  {
    id: 'test-webhook-003',
    userId: '1',
    name: '🔗 Webhook Receiver',
    description: 'Receives webhook data and processes it - Test webhook trigger',
    prompt: 'Create a workflow that processes incoming webhook data',
    status: 'active',
    trigger: { type: 'webhook' as const, config: {} },
    config: {
      steps: [
        {
          id: 'process',
          module: 'utilities.string.toUpperCase',
          inputs: {
            text: '{{trigger.payload.message}}',
          },
          outputAs: 'processed',
        },
        {
          id: 'log',
          module: 'utilities.string.truncate',
          inputs: {
            text: '{{steps.process.output}}',
            maxLength: 100,
          },
          outputAs: 'result',
        },
      ],
    },
    runCount: 0,
  },
  {
    id: 'test-telegram-004',
    userId: '1',
    name: '📱 Telegram Bot',
    description: 'Telegram bot integration - Test bot configuration',
    prompt: 'Create a Telegram bot that responds to commands',
    status: 'draft',
    trigger: { type: 'telegram' as const, config: { botToken: '', commands: ['/start', '/help'] } },
    config: {
      steps: [
        {
          id: 'respond',
          module: 'ai.openai-workflow.generateText',
          inputs: {
            prompt: 'Respond to command: {{trigger.command}} with message: {{trigger.message}}',
            apiKey: '{{user.openai}}',
            model: 'gpt-3.5-turbo',
          },
          outputAs: 'botResponse',
        },
        {
          id: 'send-telegram',
          module: 'communication.telegram.sendMessage',
          inputs: {
            chatId: '{{trigger.chatId}}',
            text: '{{steps.respond.output}}',
            botToken: '{{user.telegram}}',
          },
        },
      ],
    },
    runCount: 0,
  },
  {
    id: 'test-discord-005',
    userId: '1',
    name: '💬 Discord Bot',
    description: 'Discord bot integration - Test slash command config',
    prompt: 'Create a Discord bot that handles slash commands',
    status: 'draft',
    trigger: { type: 'discord' as const, config: { botToken: '', applicationId: '', commands: ['/help', '/stats'] } },
    config: {
      steps: [
        {
          id: 'handle-command',
          module: 'ai.openai-workflow.generateText',
          inputs: {
            prompt: 'Handle Discord command: {{trigger.command}}',
            apiKey: '{{user.openai}}',
            model: 'gpt-3.5-turbo',
          },
          outputAs: 'commandResponse',
        },
        {
          id: 'send-discord',
          module: 'communication.discord.sendMessage',
          inputs: {
            channelId: '{{trigger.channelId}}',
            message: '{{steps.handle-command.output}}',
            botToken: '{{user.discord}}',
          },
        },
      ],
    },
    runCount: 0,
  },
  {
    id: 'test-twitter-006',
    userId: '1',
    name: '🐦 Twitter Auto-Reply',
    description: 'Auto-reply to tweets using AI - Tests OpenAI and Twitter credentials',
    prompt: 'Create a workflow that monitors and replies to tweets',
    status: 'active',
    trigger: { type: 'manual' as const, config: {} },
    config: {
      steps: [
        {
          id: 'fetch-mentions',
          module: 'social.twitter.getMentions',
          inputs: {
            accessToken: '{{user.twitter}}',
            maxResults: 10,
          },
          outputAs: 'mentions',
        },
        {
          id: 'generate-reply',
          module: 'ai.openai-workflow.generateText',
          inputs: {
            prompt: 'Generate a friendly reply to: {{steps.fetch-mentions.output.text}}',
            apiKey: '{{user.openai}}',
            model: 'gpt-4',
          },
          outputAs: 'replyText',
        },
        {
          id: 'post-reply',
          module: 'social.twitter.postTweet',
          inputs: {
            text: '{{steps.generate-reply.output}}',
            accessToken: '{{user.twitter}}',
            replyTo: '{{steps.fetch-mentions.output.id}}',
          },
        },
      ],
    },
    runCount: 0,
  },
];

async function main() {
  console.log('Creating test workflows for trigger configurations...\n');

  if (!sqliteDb) {
    throw new Error('Database not initialized');
  }

  for (const workflow of workflows) {
    try {
      // Try to update first
      const result = await sqliteDb
        .update(workflowsTableSQLite)
        .set({
          config: workflow.config,
          trigger: workflow.trigger,
          name: workflow.name,
          description: workflow.description,
        })
        .where(eq(workflowsTableSQLite.id, workflow.id));

      if (result.changes === 0) {
        // If no rows updated, insert new
        await sqliteDb.insert(workflowsTableSQLite).values({
          ...workflow,
          createdAt: new Date(),
        });
        console.log(`✅ Created: ${workflow.name} (${workflow.id})`);
      } else {
        console.log(`✅ Updated: ${workflow.name} (${workflow.id})`);
      }
    } catch (error) {
      console.error(`❌ Failed to create/update ${workflow.id}:`, error);
    }
  }

  console.log('\n✨ Done! Test workflows created successfully.');
  console.log('\nYou can now test each trigger type by clicking the Play button on these workflows.');
}

main().catch(console.error);

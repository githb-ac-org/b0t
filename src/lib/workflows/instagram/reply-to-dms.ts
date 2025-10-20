import { createPipeline } from '../Pipeline';

/**
 * Reply to Instagram DMs Workflow
 *
 * Steps:
 * 1. Fetch unread DMs
 * 2. Filter unanswered messages
 * 3. Generate AI replies
 * 4. Send DM replies
 */

interface WorkflowContext {
  messages: unknown[];
  selectedMessage?: unknown;
  generatedReply: string;
}

export async function replyToInstagramDMsWorkflow() {
  const initialContext: WorkflowContext = {
    messages: [],
    generatedReply: '',
  };

  const pipeline = createPipeline<WorkflowContext>();

  return await pipeline
    .step('fetch-dms', async (ctx) => {
      // TODO: Get unread DMs
      return { ...ctx, messages: [] as unknown[] };
    })
    .step('filter-unanswered', async (ctx) => {
      // TODO: Filter out already answered DMs
      return ctx;
    })
    .step('generate-reply', async (ctx) => {
      // TODO: Generate AI reply
      return { ...ctx, generatedReply: '' };
    })
    .step('send-reply', async (ctx) => {
      // TODO: Send DM reply
      // await replyToInstagramDM(ctx.selectedMessage.senderId, ctx.generatedReply);
      return ctx;
    })
    .execute(initialContext);
}

/**
 * Workflow Exports
 *
 * Import workflows from here for use in jobs or API routes
 */

// Twitter workflows
export { replyToTweetsWorkflow } from './twitter/reply-to-tweets';
export { postTweetsWorkflow } from './twitter/post-tweets';

// YouTube workflows
export { replyToYouTubeCommentsWorkflow } from './youtube/reply-to-comments';

// Instagram workflows
export { replyToInstagramCommentsWorkflow } from './instagram/reply-to-comments';
export { replyToInstagramDMsWorkflow } from './instagram/reply-to-dms';

// Export Pipeline for custom workflows
export { Pipeline, createPipeline } from './Pipeline';
export type { StepResult } from './Pipeline';

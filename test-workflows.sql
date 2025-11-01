-- Test Workflows with Various Credential Requirements

-- 1. Twitter Bot (OAuth twitter + API key openai)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-twitter-bot-001',
  '1',
  'Twitter Engagement Bot',
  'Automated Twitter engagement using OAuth',
  'Engage with AI tweets',
  '{"steps":[{"id":"fetch","module":"social.twitter-oauth.searchTweets","inputs":{"query":"#AI","maxResults":10,"accessToken":"{{user.twitter}}"}},{"id":"reply","module":"social.twitter-oauth.replyToTweet","inputs":{"tweetId":"123","text":"Great!","accessToken":"{{user.twitter}}"}}]}',
  'manual',
  'active',
  unixepoch()
);

-- 2. Multi-Platform Content (OAuth twitter + API keys openai, airtable)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-multi-platform-002',
  '1',
  'Multi-Platform Content Syndication',
  'Generate and distribute content',
  'Create marketing content',
  '{"steps":[{"id":"generate","module":"ai.openai-workflow.generateCompletion","inputs":{"prompt":"Write tweet","apiKey":"{{user.openai}}"}},{"id":"post","module":"social.twitter-oauth.postTweet","inputs":{"text":"{{content}}","accessToken":"{{user.twitter}}"}},{"id":"save","module":"integrations.airtable.createRecord","inputs":{"data":"{{content}}","apiKey":"{{user.airtable}}"}}]}',
  'manual',
  'active',
  unixepoch()
);

-- 3. YouTube Responder (OAuth youtube + API key openai)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-youtube-bot-003',
  '1',
  'YouTube Comment Auto-Responder',
  'Respond to YouTube comments with AI',
  'Reply to YouTube comments',
  '{"steps":[{"id":"fetch","module":"social.youtube.getLatestComments","inputs":{"videoId":"abc123","maxResults":5,"accessToken":"{{user.youtube}}"}},{"id":"reply","module":"social.youtube.replyToComment","inputs":{"commentId":"{{comment.id}}","text":"Thanks!","accessToken":"{{user.youtube}}"}}]}',
  'manual',
  'active',
  unixepoch()
);

-- 4. Payment Processor (API keys stripe, sendgrid, openai)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-payment-flow-004',
  '1',
  'Smart Payment Processor',
  'Process payments and send emails',
  'Handle payment workflow',
  '{"steps":[{"id":"payment","module":"payments.stripe.createPaymentIntent","inputs":{"amount":2999,"currency":"usd","apiKey":"{{user.stripe}}"}},{"id":"email","module":"communications.sendgrid.sendEmail","inputs":{"to":"test@example.com","subject":"Payment","body":"Confirmed","apiKey":"{{user.sendgrid}}"}},{"id":"log","module":"ai.openai-workflow.generateCompletion","inputs":{"prompt":"Summarize transaction","apiKey":"{{user.openai}}"}}]}',
  'manual',
  'draft',
  unixepoch()
);

-- 5. Multi-Account Twitter Monitor (OAuth twitter)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-multi-twitter-005',
  '1',
  'Multi-Account Twitter Monitor',
  'Monitor mentions across Twitter accounts',
  'Check Twitter mentions',
  '{"steps":[{"id":"check","module":"social.twitter-oauth.getMentions","inputs":{"count":10,"accessToken":"{{user.twitter}}"}},{"id":"analyze","module":"ai.openai-workflow.analyzeSentiment","inputs":{"texts":"{{mentions}}","apiKey":"{{user.openai}}"}},{"id":"respond","module":"social.twitter-oauth.replyToTweet","inputs":{"tweetId":"{{mention.id}}","text":"Thanks!","accessToken":"{{user.twitter}}"}}]}',
  'manual',
  'active',
  unixepoch()
);

-- 6. Data Pipeline (API keys openai, rapidapi, airtable)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-data-pipeline-006',
  '1',
  'AI Data Enrichment Pipeline',
  'Fetch, enrich, and store data',
  'Process external data',
  '{"steps":[{"id":"fetch","module":"integrations.rapidapi.fetchData","inputs":{"endpoint":"https://api.example.com/data","apiKey":"{{user.rapidapi}}"}},{"id":"enrich","module":"ai.openai-workflow.enrichData","inputs":{"data":"{{rawData}}","apiKey":"{{user.openai}}"}},{"id":"store","module":"integrations.airtable.batchCreate","inputs":{"records":"{{enrichedData}}","apiKey":"{{user.airtable}}"}}]}',
  'manual',
  'active',
  unixepoch()
);

-- 7. No Credentials Workflow
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-no-creds-007',
  '1',
  'Date & Time Calculator',
  'Simple utility workflow',
  'Calculate dates and times',
  '{"steps":[{"id":"time","module":"utilities.datetime.now","inputs":{}},{"id":"format","module":"utilities.string-utils.format","inputs":{"template":"Time: {{timestamp}}"}},{"id":"math","module":"utilities.math.add","inputs":{"a":100,"b":200}}]}',
  'manual',
  'active',
  unixepoch()
);

-- 8. Complex Multi-Credential (twitter, youtube, openai, stripe, sendgrid)
INSERT INTO workflows (id, user_id, name, description, prompt, config, trigger, status, created_at)
VALUES (
  'test-complex-multi-008',
  '1',
  'Omnichannel Marketing Automation',
  'Cross-platform marketing campaign',
  'Run marketing campaign',
  '{"steps":[{"id":"generate","module":"ai.openai-workflow.generateMarketingCopy","inputs":{"product":"AI Tool","apiKey":"{{user.openai}}"}},{"id":"tweet","module":"social.twitter-oauth.postTweet","inputs":{"text":"{{tweet}}","accessToken":"{{user.twitter}}"}},{"id":"youtube","module":"social.youtube.postCommunityPost","inputs":{"text":"{{post}}","accessToken":"{{user.youtube}}"}},{"id":"payments","module":"payments.stripe.listPayments","inputs":{"apiKey":"{{user.stripe}}"}},{"id":"report","module":"communications.sendgrid.sendEmail","inputs":{"to":"marketing@company.com","subject":"Report","body":"{{data}}","apiKey":"{{user.sendgrid}}"}}]}',
  'manual',
  'draft',
  unixepoch()
);

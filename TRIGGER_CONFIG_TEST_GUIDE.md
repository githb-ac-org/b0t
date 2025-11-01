# Trigger Configuration UI - Test Guide

5 test workflows have been created to demonstrate the new trigger-type-aware configuration system.

## Test Workflows Created:

### 1. ⏰ Daily Content Generator (Cron Trigger)
**ID:** `test-cron-001`

**What it tests:**
- Cron schedule configuration UI
- Preset schedules (every minute, hourly, daily, weekly, monthly)
- Custom cron expression input
- Cron syntax helper

**How to test:**
1. Navigate to Workflows dashboard
2. Find "⏰ Daily Content Generator"
3. Click the Play button (▶️)
4. You should see the **Cron Trigger Config** UI with:
   - Schedule preset dropdown
   - Cron expression input field
   - Current schedule display with syntax guide
5. Try selecting different presets (hourly, daily, etc.)
6. Try entering a custom cron expression like `*/5 * * * *`
7. No "Execute" button should appear (cron workflows are scheduled, not manually executed)

**Expected behavior:**
- Preset selection updates the cron expression
- Custom expression input switches preset to "Custom"
- Syntax helper shows cron format guide

---

### 2. 💬 AI Assistant Chat (Chat Trigger)
**ID:** `test-chat-002`

**What it tests:**
- Interactive chat interface
- Real-time conversation
- Message history
- Workflow execution from chat messages

**How to test:**
1. Navigate to Workflows dashboard
2. Find "💬 AI Assistant Chat"
3. Click the Play button
4. You should see the **Chat Trigger Config** UI with:
   - Empty message area (initially)
   - Text input field at bottom
   - Send button
5. Type a message like "Hello!" and press Enter or click Send
6. The workflow executes and responds
7. Continue the conversation
8. No separate "Execute" button (chat has built-in execution)

**Expected behavior:**
- Messages appear in chat bubbles (user on right, assistant on left)
- Each message triggers workflow execution
- Conversation history is maintained
- Timestamps shown for each message

---

### 3. 🔗 Webhook Receiver (Webhook Trigger)
**ID:** `test-webhook-003`

**What it tests:**
- Webhook URL display
- Copy to clipboard functionality
- HTTP method selection
- Test payload editor
- Webhook testing
- Example cURL command

**How to test:**
1. Navigate to Workflows dashboard
2. Find "🔗 Webhook Receiver"
3. Click the Play button
4. You should see the **Webhook Trigger Config** UI with:
   - Webhook URL (read-only)
   - Copy button
   - HTTP method selector
   - Test payload JSON editor
   - "Test Webhook" button
   - Example cURL command
5. Click the copy button - URL should be copied
6. Change HTTP method to POST
7. Edit test payload JSON:
```json
{
  "message": "hello world"
}
```
8. Click "Test Webhook"
9. View test results

**Expected behavior:**
- URL is displayed correctly
- Copy button copies URL to clipboard
- Test payload validates JSON
- Test execution shows success/failure
- Example cURL updates with payload

---

### 4. 📱 Telegram Bot (Telegram Trigger)
**ID:** `test-telegram-004`
**Status:** Draft (requires bot token configuration)

**What it tests:**
- Telegram bot setup instructions
- Bot token input
- Command configuration
- BotFather integration link

**How to test:**
1. Navigate to Workflows dashboard
2. Find "📱 Telegram Bot"
3. Click the Play button
4. You should see the **Telegram Trigger Config** UI with:
   - Setup instructions panel (blue)
   - "Open BotFather" button
   - Bot token input (password field)
   - Commands input (comma-separated)
   - How it works explanation
   - Warning about webhook configuration
5. Try entering a sample bot token
6. Add commands like "/start, /help, /info"
7. Click "Open BotFather" - should open Telegram
8. No "Execute" button (bot config only)

**Expected behavior:**
- Instructions are clear and numbered
- Bot token is masked (password field)
- Commands can be edited
- Links open in new tab

---

### 5. 💬 Discord Bot (Discord Trigger)
**ID:** `test-discord-005`
**Status:** Draft (requires bot configuration)

**What it tests:**
- Discord bot setup instructions
- Application ID input
- Bot token input
- Slash commands configuration
- Bot invite link generator

**How to test:**
1. Navigate to Workflows dashboard
2. Find "💬 Discord Bot"
3. Click the Play button
4. You should see the **Discord Trigger Config** UI with:
   - Setup instructions panel (blue)
   - "Open Developer Portal" button
   - Application ID input
   - Bot token input (password field)
   - Slash commands input
   - Bot invite section
   - How it works explanation
   - Important note about MESSAGE CONTENT INTENT
5. Try entering a sample Application ID (e.g., "123456789")
6. Enter a sample bot token
7. Add commands like "/help, /stats"
8. Invite link should auto-generate
9. Click "Open Invite Link" - should open Discord auth page

**Expected behavior:**
- Instructions are detailed and numbered
- Both token and app ID inputs work
- Invite URL generates automatically
- Links open in new tab

---

## Manual Trigger (Existing)

The existing test workflows (test-dynamic-prompt-001, etc.) use **Manual Trigger** which shows:
- Prompt input field
- LLM model selector
- Custom parameters (JSON)
- "Execute Workflow" button

These should still work as before.

---

## UI Patterns to Verify:

### ✅ Trigger-Specific UIs
- [ ] Cron → Shows schedule configuration, no execute button
- [ ] Chat → Shows chat interface with built-in execution
- [ ] Webhook → Shows URL, test interface, no execute button
- [ ] Telegram → Shows bot setup, no execute button
- [ ] Discord → Shows bot setup with invite link
- [ ] Manual → Shows prompt/model/params with execute button

### ✅ Configuration Features
- [ ] Cron: Presets update expression
- [ ] Cron: Custom expression input works
- [ ] Chat: Messages send on Enter
- [ ] Chat: Conversation history persists
- [ ] Webhook: Copy button works
- [ ] Webhook: Test execution works
- [ ] Telegram/Discord: External links open correctly

### ✅ Execution Behavior
- [ ] Manual triggers show "Execute" button
- [ ] Other triggers hide "Execute" button
- [ ] Chat/Webhook have built-in execution
- [ ] Results display correctly for all types

### ✅ General UI
- [ ] Dialog opens on Play button click
- [ ] Dialog title shows workflow name
- [ ] Description matches trigger type
- [ ] Close button works
- [ ] All inputs are functional

---

## Quick Test Checklist:

1. **Navigate to** http://localhost:3000/dashboard/workflows
2. **Find each test workflow** (⏰, 💬, 🔗, 📱, 💬)
3. **Click Play button** on each
4. **Verify correct UI** appears for each trigger type
5. **Test interactions** (preset selection, chat input, copy button, etc.)
6. **Check execution** (manual/chat/webhook should execute, cron/bots configure only)

---

## Success Criteria:

All test workflows should:
- ✅ Display the correct trigger-specific configuration UI
- ✅ Show appropriate controls for that trigger type
- ✅ Hide/show execute button appropriately
- ✅ Allow configuration without errors
- ✅ Execute correctly (for executable trigger types)

**All 5 trigger types now have dedicated, purpose-built configuration UIs!**

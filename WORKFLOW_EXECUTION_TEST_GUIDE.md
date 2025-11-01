# Workflow Execution Features - Test Guide

5 test workflows have been created to demonstrate the new dynamic execution features.

## Test Workflows Created:

### 1. ✨ AI Content Generator (Dynamic Prompt)
**ID:** `test-dynamic-prompt-001`

**What it tests:**
- Dynamic prompt input from user
- Model selection (uses `{{trigger.model}}`)
- AI content generation
- String truncation

**How to test:**
1. Click the Play button
2. Enter a prompt like: "Write a haiku about automation"
3. Select a model (try GPT-4 or Claude 3 Sonnet)
4. Click "Execute Workflow"
5. View the generated content in the output

**Expected behavior:**
- Should generate content based on your prompt
- Should use the selected model
- Should truncate output to 500 characters

---

### 2. 🤖 AI Model Tester
**ID:** `test-model-selection-002`

**What it tests:**
- Model selection switching
- Dynamic prompt with timestamp
- Different model behaviors

**How to test:**
1. Click Play
2. Enter prompt: "Explain what you are in one sentence"
3. Try different models:
   - GPT-4 (most capable)
   - GPT-3.5 Turbo (faster)
   - Claude 3 Opus
   - Claude 3 Haiku (fastest)
4. Compare the responses

**Expected behavior:**
- Each model should respond differently
- Timestamp should be captured
- Response should reflect model's personality

---

### 3. ⚙️ Custom Parameters Demo
**ID:** `test-custom-params-003`

**What it tests:**
- Custom JSON parameters
- Temperature control
- Max tokens control
- Word counting

**How to test:**
1. Click Play
2. Enter prompt: "Write a short story"
3. In "Advanced: Custom Parameters", enter:
```json
{
  "temperature": 0.9,
  "maxTokens": 100
}
```
4. Execute and view output

**Expected behavior:**
- Should use high temperature (more creative)
- Should limit output length
- Should count words in result

---

### 4. 📅 Date & Time Formatter
**ID:** `test-datetime-simple-004`

**What it tests:**
- Workflows that don't need prompts
- Utility functions
- Date/time manipulation

**How to test:**
1. Click Play
2. Leave prompt empty (not needed)
3. Execute

**Expected behavior:**
- Should show current timestamp
- Should format to ISO 8601 format
- No AI involved, just utilities

---

### 5. 🔤 Text Transformer
**ID:** `test-string-utils-005`

**What it tests:**
- String utility functions
- Multiple transformations
- Prompt as input data

**How to test:**
1. Click Play
2. Enter text: "Hello World This Is A Test"
3. Execute

**Expected behavior:**
- Slug: `hello-world-this-is-a-test`
- Uppercase: `HELLO WORLD THIS IS A TEST`
- Truncated: `Hello World This I...`

---

## Features to Verify:

### ✅ Dynamic Prompt Input
- [ ] Prompt textarea appears in dialog
- [ ] Entered text is accessible via `{{trigger.prompt}}`
- [ ] Works with AI workflows
- [ ] Works with utility workflows

### ✅ Model Selection
- [ ] Dropdown shows all available models
- [ ] Selected model is passed via `{{trigger.model}}`
- [ ] Different models produce different results
- [ ] Default model is GPT-4

### ✅ Custom Parameters
- [ ] Advanced section is collapsible
- [ ] Accepts valid JSON
- [ ] Shows error for invalid JSON
- [ ] Parameters accessible via `{{trigger.paramName}}`

### ✅ Execution Results
- [ ] Success indicator (green checkmark)
- [ ] Error indicator (red X)
- [ ] Error messages displayed
- [ ] Output view is collapsible
- [ ] JSON output is formatted
- [ ] Toast notifications appear

### ✅ General UI
- [ ] Dialog opens on Play button click
- [ ] Dialog can be closed
- [ ] Execute button shows loading state
- [ ] Results persist in dialog
- [ ] Can execute multiple times

## Common Test Scenarios:

### Test 1: Simple Execution
- Workflow: Date & Time Formatter
- No prompt needed
- Should execute instantly
- Should show formatted date

### Test 2: With Prompt
- Workflow: Text Transformer
- Enter: "Test Input"
- Should transform text
- Should show 3 outputs (slug, upper, truncated)

### Test 3: With AI Model
- Workflow: AI Content Generator
- Enter: "Write a tweet about AI"
- Select: GPT-4
- Should generate tweet-like content

### Test 4: With Custom Parameters
- Workflow: Custom Parameters Demo
- Enter prompt + custom JSON
- Should respect temperature/maxTokens
- Should count words in output

---

## Troubleshooting:

**Dialog doesn't open:**
- Check browser console for errors
- Verify trigger information is loaded
- Refresh the page

**Execution fails:**
- Check if OpenAI API key is configured
- Verify workflow config is valid JSON
- Check server logs for errors

**Parameters not working:**
- Verify JSON is valid in custom parameters
- Check workflow config uses correct variable syntax: `{{trigger.paramName}}`
- Ensure parameter names match exactly

---

## Next Steps:

After testing these workflows, you can:
1. Create your own workflows with dynamic inputs
2. Use `{{trigger.prompt}}` for user input
3. Use `{{trigger.model}}` for model selection
4. Use `{{trigger.anyParameter}}` for custom parameters

**All workflows now support dynamic execution! 🎉**

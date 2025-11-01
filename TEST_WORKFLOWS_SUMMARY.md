# Test Workflows Summary

8 diverse test workflows have been added to your database to test the credential management system.

## Workflows Created:

### 1. Twitter Engagement Bot (`test-twitter-bot-001`)
**Status:** Active
**Credentials Required:**
- OAuth: Twitter
- API Key: OpenAI

**What it tests:** Single OAuth account + Single API key

---

### 2. Multi-Platform Content Syndication (`test-multi-platform-002`)
**Status:** Active
**Credentials Required:**
- OAuth: Twitter
- API Keys: OpenAI, Airtable

**What it tests:** One OAuth + Multiple API keys

---

### 3. YouTube Comment Auto-Responder (`test-youtube-bot-003`)
**Status:** Active
**Credentials Required:**
- OAuth: YouTube
- API Key: OpenAI

**What it tests:** Different OAuth platform + API key combination

---

### 4. Smart Payment Processor (`test-payment-flow-004`)
**Status:** Draft
**Credentials Required:**
- API Keys: Stripe, SendGrid, OpenAI

**What it tests:** Multiple API keys only (no OAuth)

---

### 5. Multi-Account Twitter Monitor (`test-multi-twitter-005`)
**Status:** Active
**Credentials Required:**
- OAuth: Twitter (supports multiple accounts)
- API Key: OpenAI

**What it tests:** Multiple Twitter accounts scenario + API key

---

### 6. AI Data Enrichment Pipeline (`test-data-pipeline-006`)
**Status:** Active
**Credentials Required:**
- API Keys: RapidAPI, OpenAI, Airtable

**What it tests:** Three different API keys

---

### 7. Date & Time Calculator (`test-no-creds-007`)
**Status:** Active
**Credentials Required:** None

**What it tests:** Workflow with no credentials (should show no credential requirements)

---

### 8. Omnichannel Marketing Automation (`test-complex-multi-008`)
**Status:** Draft
**Credentials Required:**
- OAuth: Twitter, YouTube
- API Keys: OpenAI, Stripe, SendGrid

**What it tests:** Multiple OAuth accounts + Multiple API keys (most complex scenario)

---

## Testing Instructions:

1. **Navigate to `/dashboard/workflows`** in your browser
2. **You should see all 8 test workflows** displayed as cards
3. **Check each workflow card** for the "Required Credentials" section

### What to verify:

#### For OAuth Credentials (Twitter, YouTube):
- [ ] If you have a connected account, it shows: ✅ "Connected (account name)"
- [ ] Shows disconnect button (unplug icon) when connected
- [ ] If you have multiple accounts, shows dropdown to select which one
- [ ] If not connected, shows "Connect" button with external link icon
- [ ] Clicking "Connect" opens OAuth popup

#### For API Key Credentials (OpenAI, Stripe, etc.):
- [ ] If you have keys added, shows: ✅ "Connected (key name)"
- [ ] If you have multiple keys, shows dropdown to select which one
- [ ] NO delete button (keys can only be managed in Credentials page)
- [ ] If not added, shows "Add Key" button
- [ ] Clicking "Add Key" redirects to Credentials page

#### General Functionality:
- [ ] Dropdown selections persist on page refresh
- [ ] Each workflow remembers its own credential selections independently
- [ ] Toast notifications appear (not browser alerts) when disconnecting
- [ ] Dropdowns are compact with reduced padding
- [ ] First credential is auto-selected when you have multiple

#### Specific Workflow Tests:

**Workflow #7** (Date & Time Calculator):
- [ ] Should show NO credential requirements section (since it needs no credentials)

**Workflow #8** (Omnichannel Marketing):
- [ ] Should show all 5 required credentials: Twitter, YouTube, OpenAI, Stripe, SendGrid
- [ ] Should handle mix of OAuth and API keys correctly

**Workflow #5** (Multi-Account Twitter):
- [ ] If you have multiple Twitter accounts connected, should show dropdown
- [ ] Should allow selecting which Twitter account to use

---

## Cleanup (Optional):

To remove these test workflows from your database:

```bash
sqlite3 data/local.db "DELETE FROM workflows WHERE id LIKE 'test-%';"
```

---

## Credential Combinations Tested:

| Workflow | Twitter | YouTube | OpenAI | Stripe | SendGrid | Airtable | RapidAPI | Total |
|----------|---------|---------|--------|--------|----------|----------|----------|-------|
| #1       | OAuth   | -       | API    | -      | -        | -        | -        | 2     |
| #2       | OAuth   | -       | API    | -      | -        | API      | -        | 3     |
| #3       | -       | OAuth   | API    | -      | -        | -        | -        | 2     |
| #4       | -       | -       | API    | API    | API      | -        | -        | 3     |
| #5       | OAuth   | -       | API    | -      | -        | -        | -        | 2     |
| #6       | -       | -       | API    | -      | -        | API      | API      | 3     |
| #7       | -       | -       | -      | -      | -        | -        | -        | 0     |
| #8       | OAuth   | OAuth   | API    | API    | API      | -        | -        | 5     |

This provides comprehensive coverage of different credential scenarios!

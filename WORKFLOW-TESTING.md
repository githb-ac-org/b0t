# Workflow System Testing & Frontend Requirements

## Testing Strategy

### 1. Backend Testing (API-Based)

The comprehensive test suite is available at:
- **Test File**: `src/lib/workflows/test-all-features.ts`
- **API Endpoint**: `POST /api/workflows/test`

**Note**: Currently has optional dependency issues with Discord/compression modules. Recommend testing individual features via:

```bash
# Test via /workflow slash command (recommended)
# Use Claude to generate and execute workflows directly
```

### 2. Manual Testing Workflow

Test each feature independently using the `/workflow` slash command:

#### Test 1: Credentials Storage
```
/workflow Store an OpenAI API key for user testing
```

Expected: Creates encrypted credential in database

#### Test 2: String Utils
```
/workflow Create a workflow that converts "Hello World Test" to a URL slug
```

Expected: Output `"hello-world-test"`

#### Test 3: Array Utils
```
/workflow Create a workflow that calculates the average of [10, 20, 30, 40, 50]
```

Expected: Output `30`

#### Test 4: Conditionals
```
/workflow Create a workflow with a condition: if current hour is > 12, return "afternoon", else return "morning"
```

Expected: Conditional logic executes correctly

#### Test 5: ForEach Loop
```
/workflow Create a workflow that loops through [1,2,3] and converts each number to a slug
```

Expected: Array of slugified numbers

#### Test 6: Workflow Export
```typescript
// Use import-export functions directly
import { exportWorkflow, importWorkflow } from '@/lib/workflows/import-export';

const exported = exportWorkflow(name, description, config);
const json = JSON.stringify(exported);
const imported = importWorkflow(json);
```

---

## Frontend Requirements

Based on the new backend features, here's what needs to be built:

### 1. Credentials Management UI
**Location**: `/settings/credentials` or `/dashboard/credentials`

**Required Components**:
```
/components/credentials/
  ├── credentials-list.tsx       # List all stored credentials
  ├── credential-form.tsx        # Add/edit credential form
  ├── credential-card.tsx        # Display single credential (masked)
  └── delete-credential-dialog.tsx
```

**Features**:
- ✅ List all user credentials (platform, name, type, last used)
- ✅ Add new credential with:
  - Platform dropdown (openai, anthropic, stripe, slack, custom)
  - Friendly name input
  - API key/token input (password field)
  - Type selection (api_key, token, secret, connection_string)
- ✅ Show masked values (e.g., `sk-***...***123`)
- ✅ Delete credential with confirmation
- ✅ Update credential value
- ✅ Last used timestamp

**API Endpoints Needed**:
```typescript
GET    /api/credentials        // List all
POST   /api/credentials        // Create new
PATCH  /api/credentials/[id]   // Update
DELETE /api/credentials/[id]   // Delete
```

### 2. Workflow Import/Export UI
**Location**: Add to existing workflow pages

**Required Components**:
```
/components/workflows/
  ├── export-workflow-button.tsx
  ├── import-workflow-dialog.tsx
  ├── workflow-file-preview.tsx
  └── share-workflow-dialog.tsx
```

**Features**:
- ✅ Export workflow to JSON file (download)
- ✅ Import workflow from JSON file (upload)
- ✅ Preview workflow before import
- ✅ Validate workflow format
- ✅ Show required credentials warning
- ✅ Share workflow link/code (future: marketplace)

**API Endpoints Needed**:
```typescript
POST /api/workflows/[id]/export  // Export specific workflow
POST /api/workflows/import        // Import from JSON
GET  /api/workflows/validate      // Validate workflow JSON
```

### 3. Workflow Builder - Conditional Logic Support
**Location**: Update existing workflow builder

**Required UI Elements**:
- ✅ "Add Condition" button in step menu
- ✅ Condition builder:
  - Left operand (variable selector)
  - Operator dropdown (===, !==, >, <, >=, <=, &&, ||)
  - Right operand (value or variable)
- ✅ Visual branch representation (then/else)
- ✅ Nested step support for then/else branches

**Example JSON Structure**:
```json
{
  "type": "condition",
  "id": "check-status",
  "condition": "{{response.status}} === 200",
  "then": [
    { "type": "action", "module": "..." }
  ],
  "else": [
    { "type": "action", "module": "..." }
  ]
}
```

### 4. Workflow Builder - Loop Support
**Location**: Update existing workflow builder

**Required UI Elements**:

**ForEach Loop**:
- ✅ "Add ForEach Loop" button
- ✅ Array source selector (from variables)
- ✅ Item variable name input
- ✅ Index variable name input (optional)
- ✅ Loop body (nested steps)

**While Loop**:
- ✅ "Add While Loop" button
- ✅ Condition builder (same as conditional)
- ✅ Max iterations input (safety limit)
- ✅ Loop body (nested steps)

**Example JSON Structures**:
```json
// ForEach
{
  "type": "forEach",
  "id": "process-items",
  "array": "{{feed.items}}",
  "itemAs": "item",
  "indexAs": "index",
  "steps": [...]
}

// While
{
  "type": "while",
  "id": "retry-until-success",
  "condition": "{{attempts}} < 3",
  "maxIterations": 10,
  "steps": [...]
}
```

### 5. Workflow Variable Inspector
**New Component**: Shows all available variables in real-time

**Location**: Side panel in workflow builder

**Features**:
- ✅ Show `user.*` variables (credentials)
- ✅ Show `trigger.*` variables
- ✅ Show step outputs
- ✅ Click to copy variable path (e.g., `{{user.openai}}`)
- ✅ Expandable/collapsible tree view
- ✅ Search/filter variables

---

## Priority Order

### Phase 1 - Essential (Do First)
1. **Credentials Management UI** - Users need to store API keys
2. **Workflow Import/Export UI** - Enable sharing and backup

### Phase 2 - Enhanced Builder (Do Second)
3. **Conditional Logic UI** - Visual if/else builder
4. **Loop UI** - ForEach and While loop builders
5. **Variable Inspector** - Help users see available variables

### Phase 3 - Advanced (Nice to Have)
6. Workflow marketplace/templates
7. Workflow versioning
8. Workflow analytics/metrics
9. Step-by-step execution debugger
10. Workflow testing framework

---

## API Routes Summary

### Existing Routes
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/[id]` - Get workflow
- `PATCH /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `POST /api/workflows/[id]/execute` - Execute workflow

### New Routes Needed

**Credentials**:
```typescript
GET    /api/credentials           // List all user credentials
POST   /api/credentials           // Store new credential
PATCH  /api/credentials/[id]      // Update credential
DELETE /api/credentials/[id]      // Delete credential
```

**Import/Export**:
```typescript
GET  /api/workflows/[id]/export   // Export workflow to JSON
POST /api/workflows/import        // Import workflow from JSON
POST /api/workflows/validate      // Validate workflow JSON
```

**Testing** (Optional):
```typescript
POST /api/workflows/test          // Run test suite
POST /api/workflows/[id]/dry-run  // Test workflow without saving
```

---

## Component File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── credentials/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── workflows/
│   │       ├── [id]/
│   │       │   ├── export/route.ts
│   │       │   └── dry-run/route.ts
│   │       ├── import/route.ts
│   │       └── validate/route.ts
│   ├── dashboard/
│   │   └── credentials/
│   │       └── page.tsx
│   └── workflows/
│       ├── builder/
│       │   └── page.tsx (updated with conditionals/loops)
│       └── import/
│           └── page.tsx
├── components/
│   ├── credentials/
│   │   ├── credentials-list.tsx
│   │   ├── credential-form.tsx
│   │   ├── credential-card.tsx
│   │   └── delete-credential-dialog.tsx
│   └── workflows/
│       ├── builder/
│       │   ├── condition-step.tsx
│       │   ├── foreach-step.tsx
│       │   ├── while-step.tsx
│       │   └── variable-inspector.tsx
│       ├── export-workflow-button.tsx
│       ├── import-workflow-dialog.tsx
│       └── workflow-file-preview.tsx
└── lib/
    └── workflows/
        ├── credentials.ts (✅ exists)
        ├── import-export.ts (✅ exists)
        ├── control-flow.ts (✅ exists)
        └── executor.ts (✅ updated)
```

---

## Testing Checklist

### Backend
- [ ] Credentials CRUD operations work
- [ ] Credentials are encrypted at rest
- [ ] Credentials load correctly in workflows
- [ ] Conditional logic executes correctly
- [ ] ForEach loops process arrays correctly
- [ ] While loops respect max iterations
- [ ] Workflow export/import preserves structure
- [ ] Variable interpolation works with credentials

### Frontend
- [ ] Can add/edit/delete credentials
- [ ] Credentials display masked values
- [ ] Can export workflow to JSON
- [ ] Can import workflow from JSON
- [ ] Can build workflows with conditions
- [ ] Can build workflows with loops
- [ ] Variable inspector shows all available variables
- [ ] Builder validates step configurations

---

## Next Steps

1. **Immediate**: Create credentials management API routes
2. **Immediate**: Build credentials UI in `/dashboard/credentials`
3. **Short-term**: Add import/export buttons to workflow pages
4. **Mid-term**: Update workflow builder with conditional/loop UI
5. **Long-term**: Build variable inspector and advanced features

# TICKET-005: Enhance Empty States Throughout Application

## Description
Current empty states are minimal and don't provide helpful guidance to users. When the bucket is empty, search returns no results, or a category has no items, users are left without direction on what to do next.

Implement comprehensive, helpful empty states that guide users toward productive actions.

## User Story
As a user, when I encounter an empty state, I want to see helpful suggestions and clear next steps, so that I can continue making progress instead of feeling stuck.

## Acceptance Criteria
- [ ] All empty states have helpful, contextual content
- [ ] Empty states include actionable suggestions
- [ ] Visual design matches terminal aesthetic
- [ ] Empty states are responsive
- [ ] Animations add delight without being distracting

## Empty States to Enhance

### 1. Empty Bucket
**Current**: "Your bucket is empty" + "Add some tools to get started!"

**Enhanced**:
- [ ] Show illustration/icon (terminal with cursor)
- [ ] Message: "Your bucket is ready for tools"
- [ ] Quick actions:
  - [ ] "Add Recommended Tools" button (adds default set)
  - [ ] "Browse Popular" button (opens catalog)
  - [ ] "Load Preset" button (opens presets modal)
- [ ] Show 3 most popular packages as quick-add chips
- [ ] Recent configurations (if available in localStorage)

### 2. No Search Results
**Current**: "No packages found"

**Enhanced**:
- [ ] Message: "No packages match '{searchTerm}'"
- [ ] Suggestions:
  - [ ] "Try different keywords"
  - [ ] "Check spelling"
  - [ ] "Browse by category instead"
- [ ] Show "Did you mean?" with similar package names
- [ ] "Request this package" link (GitHub issue template)
- [ ] Show related packages that might match intent

### 3. Empty Category
**Current**: "No packages in this category for your OS"

**Enhanced**:
- [ ] Message: "No {category} tools available for {os}"
- [ ] Explanation why (e.g., "These tools are macOS-only")
- [ ] Suggest:
  - [ ] Alternative categories
  - [ ] Similar tools available for this OS
  - [ ] Switch OS to see more options

### 4. No Script Generated Yet
**Current**: Script tab shows placeholder

**Enhanced**:
- [ ] Show "Ready to Generate" state
- [ ] Checklist of what's needed:
  - [ ] ✅ OS selected
  - [ ] ⏳ Add at least one tool to bucket
- [ ] "Add Tools" CTA button

### 5. Chat Empty State (First Open)
**Current**: "Hello! I'm Root..."

**Enhanced**:
- [ ] Keep greeting but add:
- [ ] Quick suggestion chips:
  - [ ] "Set up a React environment"
  - [ ] "What do I need for Python?"
  - [ ] "Add Docker to my setup"
- [ ] Example commands with syntax highlighting

### 6. No Presets Match
**Current**: Basic modal with presets

**Enhanced**:
- [ ] If user has specific tools, suggest "Create Custom Preset"
- [ ] Show "Most Used" presets
- [ ] Filter/search presets

## Technical Implementation

### Files to Create/Modify
- Create: `src/components/empty-state.tsx` - Reusable empty state component
- Modify: `src/components/bucket-modal.tsx` - Enhanced empty bucket state
- Modify: `src/components/search-bar.tsx` - No results state
- Modify: `src/components/package-manager.tsx` - Empty category state
- Modify: `src/components/chat-window.tsx` - Enhanced welcome message
- Modify: `src/components/presets-modal.tsx` - Better preset discovery

### Component API
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }[];
  suggestions?: string[];
  illustration?: 'bucket' | 'search' | 'terminal' | 'package';
}
```

### UI Design Examples

#### Empty Bucket
```
┌─────────────────────────────────────────┐
│                                         │
│              [🪣 Icon]                  │
│                                         │
│         Your bucket is empty            │
│                                         │
│    Add tools to create your perfect    │
│         development environment         │
│                                         │
│    [⚡ Add Recommended] [📦 Browse]    │
│                                         │
│    Popular: [Node.js] [Docker] [Git]   │
│                                         │
└─────────────────────────────────────────┘
```

#### No Search Results
```
┌─────────────────────────────────────────┐
│                                         │
│              [🔍 Icon]                  │
│                                         │
│    No packages match "xyz"              │
│                                         │
│    Try:                                 │
│    • Checking your spelling             │
│    • Using broader keywords            │
│    • Browsing by category               │
│                                         │
│    Did you mean: [xyz-tool]?            │
│                                         │
│    [Browse All Packages]                │
│    [Request New Package]                │
│                                         │
└─────────────────────────────────────────┘
```

## Tasks
- [ ] Create reusable EmptyState component
- [ ] Design empty state illustrations/icons
- [ ] Enhance empty bucket state with quick actions
- [ ] Enhance no search results with suggestions
- [ ] Enhance empty category with alternatives
- [ ] Enhance chat welcome with quick suggestions
- [ ] Add animations (fade in, subtle bounce)
- [ ] Track empty state interactions (analytics)
- [ ] Test all empty states on mobile
- [ ] Update documentation

## Priority
**Medium** - Improves onboarding and user guidance

## Estimated Effort
6-8 hours

## Labels
`enhancement`, `ui/ux`, `onboarding`

## Dependencies
None

## Notes
- Keep the terminal aesthetic (monospace fonts, terminal-style borders)
- Consider adding subtle animations (typing effect, cursor blink)
- Could A/B test different empty state designs
- Future: Personalize based on user's OS and past selections

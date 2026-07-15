# TICKET-001: Add Command Preview Tooltips to Package Cards

## Description
Currently, users cannot see what command will be executed when installing a package until they generate the full script. This creates uncertainty and reduces confidence in the tool selection process.

Add a preview feature that shows the actual installation command for each package before adding it to the bucket.

## User Story
As a user, I want to see the exact command that will be executed for each package, so that I can understand what will be installed and verify it matches my expectations.

## Acceptance Criteria
- [ ] Each package card displays an info icon or "Preview" button
- [ ] Clicking/hovering shows a tooltip/modal with the actual install command
- [ ] Command is syntax-highlighted for readability
- [ ] Works for both macOS and Linux commands based on selected OS
- [ ] Shows version-specific commands when a version is selected
- [ ] Includes copy-to-clipboard button in the preview

## Technical Implementation

### Files to Modify
- `src/components/package-manager.tsx` - Add preview UI to PackageCard
- `src/lib/script-generator.ts` - May need to expose command generation utilities

### Implementation Details
```typescript
// Add to PackageCard component
const [showPreview, setShowPreview] = useState(false);

// Preview tooltip/modal content
const previewCommand = getPreviewCommand(); // Already exists
```

### UI Mockup
```
┌─────────────────────────────────────┐
│  VS Code                    [ⓘ] [+] │
│  Visual Studio Code                 │
│  Code editing. Redefined.           │
│                                     │
│  [Preview Command]                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Install Command:                   │
│  ┌───────────────────────────────┐  │
│  │ brew install --cask visual-   │  │
│  │ studio-code                   │  │
│  └───────────────────────────────┘  │
│  [Copy] [Close]                     │
└─────────────────────────────────────┘
```

## Tasks
- [ ] Add info/preview icon button to PackageCard header
- [ ] Create CommandPreview component with syntax highlighting
- [ ] Implement tooltip/modal positioning and animation
- [ ] Add copy-to-clipboard functionality
- [ ] Ensure responsive design (mobile-friendly)
- [ ] Add keyboard shortcut (e.g., 'i' key) to open preview
- [ ] Write tests for command preview functionality
- [ ] Update documentation

## Priority
**High** - Improves user trust and understanding

## Estimated Effort
2-3 hours

## Labels
`enhancement`, `ui/ux`, `good-first-issue`

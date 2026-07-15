# TICKET-002: Implement Toast Notification System

## Description
Currently, user actions like adding items to the bucket, copying scripts, or importing configurations provide minimal or no visual feedback. This creates a poor user experience as users are unsure if their actions succeeded.

Implement a comprehensive toast notification system to provide immediate, non-intrusive feedback for all user actions.

## User Story
As a user, I want to see clear visual feedback when I perform actions, so that I know if they succeeded or failed without guessing.

## Acceptance Criteria
- [ ] Toast notifications appear for all major user actions
- [ ] Toasts auto-dismiss after 3-5 seconds
- [ ] Toasts can be manually dismissed
- [ ] Different toast types: success, error, warning, info
- [ ] Multiple toasts stack vertically without overlapping
- [ ] Toasts are accessible (ARIA labels, keyboard dismissible)
- [ ] Works in both light and dark themes

## Actions Requiring Toast Notifications

### Success Toasts
- [ ] Package added to bucket: "✅ Added {packageName} to bucket"
- [ ] Package removed from bucket: "🗑️ Removed {packageName}"
- [ ] Script copied: "📋 Script copied to clipboard"
- [ ] URL generated: "🔗 Shareable URL created (expires in 24h)"
- [ ] Bucket exported: "💾 Configuration exported"
- [ ] Bucket imported: "📂 Configuration imported successfully"
- [ ] Preset applied: "⚡ {presetName} preset applied"
- [ ] Version changed: "🔄 {packageName} version updated"

### Error Toasts
- [ ] Import failed: "❌ Failed to import configuration"
- [ ] Copy failed: "❌ Failed to copy to clipboard"
- [ ] Rate limit exceeded: "⏳ Rate limit reached, please wait"
- [ ] Network error: "🌐 Connection error, please try again"

### Info Toasts
- [ ] Bucket cleared: "🧹 Bucket cleared"
- [ ] Chat minimized: "💬 Chat minimized"

## Technical Implementation

### Files to Create/Modify
- Create: `src/components/toast.tsx` - Toast component
- Create: `src/lib/toast-context.tsx` - Toast context/provider
- Create: `src/hooks/use-toast.ts` - Toast hook
- Modify: `src/app/layout.tsx` - Add ToastProvider
- Modify: All action components to trigger toasts

### API Design
```typescript
// useToast hook
const { toast, dismiss, dismissAll } = useToast();

// Usage examples
toast.success('Package added to bucket');
toast.error('Failed to import configuration');
toast.info('Bucket cleared');
toast.warning('Rate limit approaching');

// With options
toast.success('Script copied', {
  duration: 5000,
  action: {
    label: 'Undo',
    onClick: () => undoCopy()
  }
});
```

### UI Specifications
- Position: Bottom-right corner (above chat window)
- Max toasts: 5 (oldest auto-dismisses)
- Animation: Slide in from right, fade out
- Icons: Checkmark, X, Info, Warning
- Colors: Match theme (success=green, error=red, etc.)

## Tasks
- [ ] Create Toast component with variants
- [ ] Create ToastContext for global state management
- [ ] Create useToast hook
- [ ] Add ToastProvider to app layout
- [ ] Integrate toasts into PackageManager (add/remove)
- [ ] Integrate toasts into ScriptOutput (copy, download, URL)
- [ ] Integrate toasts into Navbar (import/export)
- [ ] Integrate toasts into PresetsModal
- [ ] Add accessibility features (ARIA, keyboard)
- [ ] Add animation/transition effects
- [ ] Test all toast scenarios
- [ ] Update documentation

## Priority
**High** - Core UX improvement

## Estimated Effort
4-6 hours

## Labels
`enhancement`, `ui/ux`, `accessibility`

## Dependencies
None

## Notes
Consider using a library like `sonner` or `@radix-ui/react-toast` for faster implementation, or build custom for full control.

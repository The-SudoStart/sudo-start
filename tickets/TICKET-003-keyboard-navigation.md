# TICKET-003: Implement Comprehensive Keyboard Navigation

## Description
Power users and accessibility-conscious users need keyboard shortcuts to navigate the application efficiently. Currently, keyboard navigation is limited and inconsistent across the app.

Implement a comprehensive keyboard navigation system with shortcuts for all major actions.

## User Story
As a power user, I want to navigate and control the application using only my keyboard, so that I can work faster and maintain my flow state.

## Acceptance Criteria
- [ ] All interactive elements are keyboard accessible
- [ ] Common actions have keyboard shortcuts
- [ ] Shortcuts are discoverable (show in UI)
- [ ] No keyboard traps (can navigate away from any element)
- [ ] Focus indicators are clearly visible
- [ ] Works with screen readers

## Keyboard Shortcuts

### Global Shortcuts
- [ ] `⌘/Ctrl + K` - Open search (already implemented)
- [ ] `⌘/Ctrl + B` - Toggle bucket modal
- [ ] `⌘/Ctrl + Enter` - Generate script (when bucket has items)
- [ ] `⌘/Ctrl + Shift + C` - Copy current script
- [ ] `?` - Show keyboard shortcuts help modal
- [ ] `Esc` - Close current modal/panel

### Navigation Shortcuts
- [ ] `Tab` / `Shift + Tab` - Navigate between focusable elements
- [ ] `↑` / `↓` - Navigate packages in search results
- [ ] `Enter` - Select focused package/add to bucket
- [ ] `1-9` - Quick select category (1=All, 2=IDEs, etc.)

### Bucket Shortcuts
- [ ] `Delete` / `Backspace` - Remove focused item from bucket
- [ ] `↑` / `↓` - Navigate items in bucket
- [ ] `Enter` - Generate script from bucket

### Chat Shortcuts
- [ ] `⌘/Ctrl + Shift + A` - Toggle AI chat
- [ ] `Esc` - Close chat (when focused)

## Technical Implementation

### Files to Create/Modify
- Create: `src/hooks/use-keyboard-shortcuts.ts` - Keyboard shortcuts hook
- Create: `src/components/keyboard-help-modal.tsx` - Shortcuts help modal
- Modify: `src/components/navbar.tsx` - Add global shortcuts
- Modify: `src/components/package-manager.tsx` - Add navigation shortcuts
- Modify: `src/components/bucket-modal.tsx` - Add bucket shortcuts
- Modify: `src/components/chat-window.tsx` - Add chat shortcuts
- Modify: `src/app/globals.css` - Add focus-visible styles

### Implementation Details
```typescript
// useKeyboardShortcuts hook
export function useKeyboardShortcuts(shortcuts: ShortcutConfig) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Check for modifier keys
      const isCmd = e.metaKey || e.ctrlKey;
      
      // Match shortcuts
      for (const [key, action] of Object.entries(shortcuts)) {
        if (matchesShortcut(e, key)) {
          e.preventDefault();
          action();
          break;
        }
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
```

### Focus Management
- [ ] Add `focus-visible` styles for all interactive elements
- [ ] Implement focus trap for modals
- [ ] Restore focus when modal closes
- [ ] Skip navigation for hidden elements

### Accessibility
- [ ] Add `aria-keyshortcuts` attributes
- [ ] Ensure screen reader announcements
- [ ] Test with keyboard-only navigation
- [ ] Test with screen readers (NVDA, VoiceOver)

## Tasks
- [ ] Create useKeyboardShortcuts hook
- [ ] Implement global shortcuts (search, bucket, generate)
- [ ] Add category navigation with number keys
- [ ] Add search result navigation with arrow keys
- [ ] Add bucket item navigation and removal
- [ ] Create keyboard shortcuts help modal
- [ ] Add shortcut hints to UI (e.g., "Search ⌘K")
- [ ] Implement focus management for modals
- [ ] Add focus-visible styles throughout
- [ ] Test full keyboard navigation flow
- [ ] Test with screen readers
- [ ] Update documentation

## Priority
**Medium-High** - Important for accessibility and power users

## Estimated Effort
6-8 hours

## Labels
`enhancement`, `accessibility`, `ux`

## Dependencies
None

## Notes
- Follow WAI-ARIA best practices
- Consider adding a "Skip to main content" link
- Test on both macOS and Windows (different modifier keys)

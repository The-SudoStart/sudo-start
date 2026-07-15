# TICKET-004: AI-Powered Script Explanation Feature

## Description
Users often generate scripts with many packages but don't fully understand what each command does or how the tools interact. This can lead to confusion or hesitation about running the script.

Leverage the existing Root AI to provide plain-English explanations of generated scripts, breaking down what each tool does and why it was included.

## User Story
As a user, I want the AI to explain what my generated script does in simple terms, so that I can understand and trust the installation process before running it.

## Acceptance Criteria
- [ ] "Explain Script" button appears on the Script Output page
- [ ] AI generates a human-readable explanation of the script
- [ ] Explanation covers: what will be installed, estimated time, disk space, and any important notes
- [ ] Shows tool descriptions and why they were selected
- [ ] Highlights any potential conflicts or dependencies
- [ ] Explanation is collapsible/expandable
- [ ] Works with streaming response (like chat)

## Explanation Sections

### 1. Overview
- [ ] Total number of tools to install
- [ ] Estimated installation time
- [ ] Estimated disk space required
- [ ] Target OS and shell

### 2. Tool Breakdown
For each tool, explain:
- [ ] What the tool does (1-2 sentences)
- [ ] Why it's included (based on user's selections)
- [ ] Installation method (brew, apt, curl, etc.)
- [ ] Version being installed (if specific)

### 3. Dependencies
- [ ] List tools that depend on others
- [ ] Show dependency tree (e.g., "Docker Desktop requires Docker Engine")
- [ ] Highlight any manual steps required

### 4. Post-Install Notes
- [ ] Configuration steps needed after installation
- [ ] Environment variables to set
- [ ] Shell configuration changes
- [ ] Recommended next steps

### 5. Security Notes
- [ ] Confirmation that commands are from official sources
- [ ] Warning about any scripts that pipe to bash
- [ ] Suggestion to review script before running

## Technical Implementation

### Files to Create/Modify
- Create: `src/components/script-explanation.tsx` - Explanation component
- Modify: `src/components/script-output.tsx` - Add explain button
- Modify: `src/app/api/chat/route.ts` - Add explanation endpoint/prompt
- Modify: `src/lib/script-generator.ts` - Expose tool metadata for AI

### API Design
```typescript
// New endpoint or extend existing chat API
POST /api/script-explain
{
  "script": "#!/bin/bash...",
  "packages": ["docker", "nodejs", "vscode"],
  "os": "macos",
  "shell": "zsh"
}

Response (streaming):
{
  "section": "overview",
  "content": "This script will install 5 development tools..."
}
```

### AI Prompt Template
```
You are Root, an expert DevOps assistant. Explain this installation script in plain English:

OS: {os}
Shell: {shell}
Packages: {packageList}

Script:
{script}

Provide:
1. A brief overview (2-3 sentences)
2. What each tool does and why it's included
3. Any dependencies between tools
4. Post-installation steps needed
5. Security considerations

Keep it friendly and informative. Use markdown formatting.
```

### UI Design
```
┌─────────────────────────────────────────────────────────┐
│  Script Output                                    [?]   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📖 Script Explanation                          │   │
│  │                                                 │   │
│  │  This script will set up a complete Node.js     │   │
│  │  development environment with 5 tools...        │   │
│  │                                                 │   │
│  │  ⏱️ ~15 minutes  💾 ~2.5 GB                     │   │
│  │                                                 │   │
│  │  [What's being installed? ▼]                    │   │
│  │                                                 │   │
│  │  • Node.js (v20) - JavaScript runtime          │   │
│  │  • Docker - Container platform                  │   │
│  │  • VS Code - Code editor                        │   │
│  │  ...                                            │   │
│  │                                                 │   │
│  │  [⚠️ Security Notes ▼]                          │   │
│  │                                                 │   │
│  │  This script uses official package managers...  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Copy] [Download] [Share URL]                           │
└─────────────────────────────────────────────────────────┘
```

## Tasks
- [ ] Create script explanation API endpoint
- [ ] Design AI prompt for script explanation
- [ ] Create ScriptExplanation component
- [ ] Add "Explain Script" button to ScriptOutput
- [ ] Implement streaming response handling
- [ ] Add collapsible sections for different explanation parts
- [ ] Cache explanations to avoid re-generating
- [ ] Add loading state while AI generates explanation
- [ ] Handle errors gracefully
- [ ] Add option to regenerate explanation
- [ ] Test with various script combinations
- [ ] Update documentation

## Priority
**Medium** - Differentiating feature that builds trust

## Estimated Effort
8-10 hours

## Labels
`enhancement`, `ai`, `documentation`

## Dependencies
- Existing chat API infrastructure
- Streaming response handling (already implemented)

## Notes
- Consider caching explanations in localStorage
- Could be extended to suggest optimizations ("You have both nvm and fnm, consider using just one")
- Future: Add "Compare with alternative setups" feature

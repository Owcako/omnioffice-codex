# Packages
- Install `@chakra-ui/react`, `@emotion/react`, `@emotion/styled`, and `framer-motion` for Chakra UI support.
- Install `react-highlight-within-textarea` to underline issue ranges inside the editor without building custom overlays.

# Directory Setup
- Maintain `src/containers` (for logic-forward components) and `src/presentational` (for pure UI views).
- Add `src/hooks`, `src/interfaces`, `src/services`, and `src/utils` to keep hooks, types, service calls, and helpers isolated.

# Containers

App.tsx: Hosts the feature shell and provides Chakra context
    Imports `ChakraProvider` and theme tokens (use default theme for now)
    Returns provider wrapping `ProofreaderAppContainer`

containers/ProofreaderAppContainer.tsx: Orchestrates proofreading workflow
    State: `essayText` (string), `issues` (ProofreadIssue[]), `isAcceptingId` (string | null for transient disable), `lastRunAt` (Date | null for possible future analytics)
    Derived memo: `highlightRanges` (array of { start: number; end: number }) via `mapIssueToRange(essayText, issue)` helper
    Hooks: `const { runProofread, isLoading } = useProofreader()`
    Refs: `editorRef` to the highlight textarea for focus restoration after proofread/accept
    Handler: `handleTextChange(next: string)` updates `essayText` and clears highlights if emptied
    Handler: `handleProofread()` guards empty text, awaits `runProofread(essayText)`, updates `issues`, focuses editor, shows toasts on success/failure
    Handler: `handleAccept(issueId)` sets `isAcceptingId`, retrieves issue, uses `replaceFirstOccurrence` to update `essayText`, filters issue from state, clears `isAcceptingId`, refocuses editor
    Handler: `handleDismiss(issueId)` filters the issue from state
    Render: `AppLayout` with props (editor value/change, proofread button config, issues list, highlight mappings, loading flags, accept/dismiss callbacks)

# Presentational

presentational/AppLayout.tsx: Three-column responsive shell
    Receives props for `commandPanel`, `editor`, `issuesPanel`
    Returns Chakra `Grid` (left column fixed 200px, center flex, right 320px) with background colors and shadows per outline

presentational/CommandPanel.tsx: Left vertical container
    Props: `onProofread`, `disabled`, `isLoading`
    Returns `VStack` styled `gray.50`, full height, includes primary `Button` labeled "Proofread" with spinner state, optional helper text slot

presentational/EditorPane.tsx: Center textbox view
    Props: `value`, `placeholder`, `onChange`, `highlightRanges`, `editorRef`
    Returns overlayed container with `HighlightWithinTextarea` configured transparent background, `placeholder`, `underlineClass` hooking to CSS via Chakra `chakra(HighlightWithinTextarea)`

presentational/IssuesPanel.tsx: Right vertical panel
    Props: `issues`, `onAccept`, `onDismiss`, `isAcceptingId`
    Returns `Box` with scrollable `Stack` of `IssueCard`s, empty state message when no issues

presentational/IssueCard.tsx
    Props: `issue`, `onAccept`, `onDismiss`, `isProcessing`
    Returns Chakra `Card` with category label (`Text`), heading showing "{original} -> {fixed}" with bold formatting on fixed, description paragraph, footer row of `Accept`/`Dismiss` buttons

# Hooks

hooks/useProofreader.ts
    State: `isLoading` boolean
    Hook: optional `toast` from Chakra for consistent error messaging (exposed to container through errors thrown if needed)
    Function: `async runProofread(text: string)`
        Calls `requestProofreading(text)` service
        Returns normalized `ProofreadIssue[]`
        Catches errors, throws upward after logging, ensures `isLoading` toggles
    Returns `{ runProofread, isLoading }`

# Interfaces

interfaces/proofreader.ts
    Export `ProofreadIssue` interface with `id`, `category`, `original`, `suggestion`, `description`, and `start`/`end` offsets (optional for backend-provided ranges)
    Export `ProofreadResponse` type (array wrapper) for service typing

# Services

services/proofreader.service.ts
    Function: `async requestProofreading(text: string): Promise<ProofreadIssue[]>`
        Placeholder fetch to `/api/proofread` POST JSON
        Inline `# Template` comment indicating model integration slot
        On missing backend, generate deterministic mock issues (e.g., detect double spaces) to keep UI functional
        Normalize backend payload to `ProofreadIssue` structure and ensure each item has stable `id`

# Utils

utils/textRange.ts
    Function: `findMatchRange(haystack: string, needle: string): { start: number; end: number } | null` using case-insensitive search preserving original span

utils/textReplacement.ts
    Function: `replaceFirstOccurrence(haystack: string, needle: string, replacement: string): { nextText: string; range: { start; end } | null }`

utils/highlights.ts
    Function: `mapIssueToRange(text: string, issue: ProofreadIssue): { start: number; end: number } | null` uses issue offsets if provided else fallback to `findMatchRange`

# Theme & Styles
- Create `src/theme/index.ts` exporting Chakra theme override (shadows for side panels, global body background)
- Add CSS module or global style for `.proofread-highlight` class applying underline (dashed `red.400`) used by HighlightWithinTextarea
- Remove unused default styles from `App.css` and `index.css`, keep minimal resets if required

# Integration Steps
- Update `main.tsx` to wrap `App` with `ChakraProvider` using new theme and `ColorModeScript`
- Replace existing `App.css`/`App.tsx` boilerplate with new structure referencing container component
- Ensure placeholder data flows from service through hook to container to UI, verifying Accept/Dismiss interactions update state and highlights consistently

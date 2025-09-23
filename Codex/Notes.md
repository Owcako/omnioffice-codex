# Architecture
- `src/main.tsx` mounts `App` inside Chakra `ChakraProvider` with custom theme (`src/theme/index.ts`), applying global styles and color config.
- `App.tsx` delegates rendering to `ProofreaderAppContainer` (container layer) keeping the root component lean.
- Container layer (`ProofreaderAppContainer`) coordinates essay text state, proofread issue list, and button handlers via the `useProofreader` hook, then hands props to presentational components.
- Presentational folder contains layout building blocks (`AppLayout`, `CommandPanel`, `EditorPane`, `IssuesPanel`, `IssueCard`) responsible only for UI; they receive all data and callbacks from the container.
- Custom hook `useProofreader` wraps async service calls and exposes loading status with Chakra toasts for error feedback.
- Service layer (`services/proofreader.service.ts`) handles the `/api/proofread` request, normalises responses, and falls back to a deterministic mock template marked with `# Template` for future Gemini integration.
- Utilities provide text range detection and replacement logic to keep Accept/Dismiss operations deterministic; highlights derive from `buildHighlightRanges` so UI stays in sync with editor content.

# Decisions
- 2025-09-23: Reviewed repository scaffold (Vite React template) and product briefs to prepare for implementing essay assistance features.
- 2025-09-23: Standardised on Chakra UI v2.x for stable hooks/components and adopted `react-highlight-within-textarea` (with Draft.js) to produce inline underlines without building custom overlays.
- 2025-09-23: Added mock proofreading fallback logic so UI remains interactive until the Gemini-backed endpoint is wired in.

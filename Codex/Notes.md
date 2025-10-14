# Architecture

- `src/main.jsx` mounts `App` inside Chakra `ChakraProvider` with custom theme (`src/theme/index.js`), applying global styles and color config.
- `App.jsx` delegates rendering to `ProofreaderAppContainer` (container layer) keeping the root component lean.
- Container layer (`ProofreaderAppContainer`) coordinates essay text state, proofread issue list, and button handlers via the `useProofreader` hook, then hands props to presentational components.
- Presentational folder contains layout building blocks (`AppLayout`, `CommandPanel`, `EditorPane`, `IssuesPanel`, `IssueCard`) responsible only for UI; they receive all data and callbacks from the container.
- Custom hook `useProofreader` wraps async service calls and exposes loading status with Chakra toasts for error feedback.
- Service layer (`services/proofreader.service.js`) handles the `/api/proofread` request, normalises responses, and falls back to a deterministic mock template marked with `# Template` for future Gemini integration.
- Utilities provide text range detection and replacement logic to keep Accept/Dismiss operations deterministic; highlights derive from `buildHighlightRanges` so UI stays in sync with editor content.

# Decisions

- 2025-09-23: Reviewed repository scaffold (Vite React template) and product briefs to prepare for implementing essay assistance features.
- 2025-09-23: Standardised on Chakra UI v2.x for stable hooks/components and adopted `react-highlight-within-textarea` (with Draft.js) to produce inline underlines without building custom overlays.
- 2025-09-23: Added mock proofreading fallback logic so UI remains interactive until the Gemini-backed endpoint is wired in.
- 2025-09-25: Dropped positional fields from proofreading issues; highlights now derive ranges via text matching to avoid depending on AI-provided offsets.

- 2025-09-27: Hardened proofreader response normalization to gate array/object payloads without broad type assertions, preserving fallback behavior.

- 2025-09-29: Converted exported React components and shared utilities to function declarations to align with current coding guidelines.

- 2025-09-29: `npm run lint` fails with `TypeError: Unexpected array` from the ESLint config loader; investigate flat config setup before relying on linting.

- 2025-09-30: Backend proofread endpoint returns an object with a `suggestions` array; frontend normalization currently expects a top-level array or `issues` key, so payload defaults to empty.

- 2025-09-29: Local CLI environment lacks Chrome binary for DevTools MCP; performance audits rely on CLI tooling (Lighthouse).
- 2025-09-29: Attempted to open http://localhost:5173 via DevTools MCP but Chrome executable missing; need alternate browser access for manual testing.
- 2025-09-29: Configured chrome-devtools MCP to launch with explicit Chrome executable path via ~/.codex/config.toml.

- 2025-09-29: Reviewed Brief.md and PRD.md to refresh product scope before conducting manual proofread flow validation via DevTools.
- 2025-09-30: Chrome DevTools MCP requires PROGRAMFILES/SystemRoot env in Codex CLI; use cmd /c npx invocation per package README to avoid "program not found".

- 2025-10-02: Inspected `handleAccept` memoisation; state updates depend on substring match. Failed replacements stem from missing match, not `useCallback`.

- 2025-10-02: Found proofread replacements fail for whitespace-only originals because `findMatchRange` rejects trimmed needles; double-space issues never map or apply.
- 2025-10-02: During accept-issue debugging confirmed replaceFirstOccurrence exits early when findMatchRange returns null for whitespace-only originals, leaving editor text unchanged.
- 2025-10-02: Identified react-highlight-within-textarea firing onChange with stale editor content after programmatic replacements, which reverts accepted proofread edits; investigate guarding handleTextChange against redundant updates.

- 2025-10-03: Converted ProofreaderAppContainer handlers and component to function syntax per style update request.

- 2025-10-03: Completed repository-wide conversion from arrow functions to function syntax to match updated code standards.
- 2025-10-04: Converted inline wrapper callbacks (useMemo/map/component props) back to arrow functions while keeping standalone declarations, ensuring consistency with latest container style guidance.
- 2025-10-09: Migrated the React codebase and config from TypeScript to plain JavaScript/JSX, removing type-only modules, renaming files, and trimming TypeScript tooling from the build.

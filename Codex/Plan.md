# Dependencies

- Install `@tiptap/react`, `@tiptap/starter-kit`, and `@tiptap/extension-placeholder` to power the editor.
- Remove `react-highlight-within-textarea` and `draft-js` because TipTap replaces them.

# Entry

main.jsx: Mounts the React tree with Chakra theme support.

- Constant `rootElement` grabs the DOM node with id "root" before rendering starts.
- Guard throws an error if `rootElement` is missing so the app fails fast during boot.
- Render call wraps `<App />` inside `StrictMode`, `ChakraProvider`, and `ColorModeScript` using our custom theme to prepare Chakra styling.

App.jsx: Provides the container component to the tree.

- Function `App` returns `<ProofreaderAppContainer />` so all logic lives in the container layer.
- Default export exposes `App` to the entry file.

# Containers

ProofreaderAppContainer.jsx: Coordinates the essay workflow and syncs the TipTap editor with proofreading data.

- State `essayText` stores the current editor text and passes to `EditorPane` as the `content` prop.
- State `issues` keeps the list of issue objects and passes to `IssuesPanel` as the `issues` prop.
- State `isAcceptingId` tracks the id that is being accepted and passes to `IssuesPanel` as the `isAcceptingId` prop.
- State `lastRunAt` stores the last proofread `Date` and drives the helper text shown in `CommandPanel`.
- Ref `editorRef` holds the TipTap editor instance so actions can refocus the editor and passes to `EditorPane` through the `onReady` prop.
- Hook result `{runProofread, isLoading}` comes from `useProofreader()` and feeds loading flags into the command button.
- Hook `toast = useToast()` prepares Chakra toasts for user feedback.
- Derived value `highlightRanges` uses `buildHighlightRanges(essayText, issues)` and passes to `EditorPane` as the `highlightRanges` prop.
- Callback `handleEditorChange(nextText)` ignores repeats, updates `essayText`, and clears `issues` when the trimmed text is empty before passing to `EditorPane` as `onChange`.
- Callback `focusEditor()` calls `editorRef.current?.commands.focus('end')` so buttons return focus to the editor.
- Async callback `handleProofread()` blocks empty input, fires the info toast, awaits `runProofread(essayText)`, updates `issues`, records `lastRunAt`, fires the success toast, and then calls `focusEditor()` before passing to `CommandPanel` as `onProofread`.
- Info toast with title "Add some writing first" and description "Type or paste your essay before running proofread." appears when `handleProofread` rejects empty text.
- Success toast with title "Proofreading complete" and a count-based description appears after `runProofread` resolves.
- Catch block relies on the hook's error toast so the container does not show a duplicate message.
- Callback `syncEditorContent(nextText)` sets the TipTap document to `nextText` through `editorRef.current` so Accept keeps the editor and state aligned.
- Async callback `handleAccept(issueId)` guards the lookup, sets `isAcceptingId`, uses `replaceFirstOccurrence` to build `nextText`, shows the missing-match toast when no range is found, updates `essayText`, removes the accepted issue, calls `syncEditorContent(nextText)`, fires the success toast, clears `isAcceptingId`, and calls `focusEditor()` before passing to `IssuesPanel` as `onAccept`.
- Info toast with title "Text already updated" and description "We could not locate the original phrasing to replace." appears when `replaceFirstOccurrence` returns no range.
- Success toast with title "Suggestion applied" and description `Updated "{targetIssue.original}".` appears after the replacement.
- Callback `handleDismiss(issueId)` removes the matching issue from `issues` and passes to `IssuesPanel` as `onDismiss`.
- Derived string `helperText` reads `lastRunAt` with `toLocaleTimeString` and passes to `CommandPanel` as the `helperText` prop.
- Prop `disabled` equals `!essayText.trim() || isLoading` so the proofread button ignores blank or busy states.
- JSX return renders `AppLayout` with `CommandPanel`, `EditorPane`, and `IssuesPanel` provided through props.
- Default export exposes `ProofreaderAppContainer` to `App.jsx`.

# Presentational

AppLayout.jsx: Defines the three-column layout shell from the outline.

- Function `AppLayout` receives `commandPanel`, `editor`, and `issuesPanel` props and returns a `Grid` with left and right gray panels and the center editor column.
- Left `GridItem` uses `bg="gray.50"` and a right-edge shadow while rendering the `commandPanel` prop.
- Center `GridItem` keeps a transparent background with padding and renders the `editor` prop.
- Right `GridItem` uses `bg="gray.50"` and a left-edge shadow while rendering the `issuesPanel` prop.
- Default export exposes `AppLayout` for the container.

CommandPanel.jsx: Shows the left vertical toolbar.

- Function `CommandPanel` receives `onProofread`, `disabled`, `isLoading`, and `helperText` props to control the proofread button and helper copy.
- VStack wrapper stretches full height with padding to match the outlined left panel.
- Heading text displays "Tools" above the button.
- Proofread button uses `colorScheme="purple"`, calls `onProofread`, respects `disabled`, and shows the spinner when `isLoading` is true.
- Helper text box renders `helperText` when provided.
- Default export exposes `CommandPanel` for layout composition.

EditorPane.jsx: Hosts the TipTap editor with placeholder, change relay, and highlight overlay.

- Function `EditorPane` receives `content`, `placeholder`, `onChange`, `highlightRanges`, and `onReady` props.
- Hook `editor = useEditor(...)` initializes TipTap with `StarterKit`, the placeholder extension, and the issue highlight plugin.
- Hook `useEffect` registers `createIssueHighlightPlugin()` once the editor instance exists.
- Callback `handleUpdate()` grabs `editor.getText()` and calls `onChange` when the text changed.
- Hook `useEffect` calls `onReady(editor)` once so the container can store the instance.
- Hook `useEffect` keeps the TipTap document in sync with the `content` prop without re-triggering `onChange`.
- Hook `useEffect` calls `updateIssueHighlights({editor, offsets: highlightRanges})` whenever `highlightRanges` change.
- Return block renders a `Box` wrapper and the `<EditorContent>` element with the proper classes and placeholder.
- Default export exposes `EditorPane` for the container.

IssuesPanel.jsx: Renders the right column suggestion stack.

- Function `IssuesPanel` receives `issues`, `onAccept`, `onDismiss`, and `isAcceptingId` props.
- Wrapper `Box` stretches full height with padding and vertical scroll.
- Heading text labels the section as "Suggestions".
- Empty state copy explains that suggestions appear after analysis when `issues` is empty.
- Stack iterates over `issues` and renders `IssueCard` for each item while passing callbacks.
- Inline handler `() => onAccept(issue.id)` lets every card send its id to the accept callback.
- Inline handler `() => onDismiss(issue.id)` lets every card send its id to the dismiss callback.
- `isProcessing` equals `isAcceptingId === issue.id` so the Accept button shows loading per card.
- Default export exposes `IssuesPanel` for the container.

IssueCard.jsx: Displays each suggestion card.

- Function `IssueCard` receives `issue`, `onAccept`, `onDismiss`, and `isProcessing` props.
- Outer `Box` uses a white background, purple border accent, and shadow per outline.
- Upper text shows `issue.category` in uppercase micro copy.
- Heading shows `{issue.original} ->` and bolds the suggestion.
- Body text renders `issue.description` for additional context.
- Button row stacks the Accept and Dismiss buttons horizontally.
- Accept button calls `onAccept` and shows the spinner when `isProcessing` is true.
- Dismiss button calls `onDismiss` and disables while processing.
- Default export exposes `IssueCard` to the panel.

# Hooks

useProofreader.js: Wraps the proofreading service with loading state and toast.

- State `isLoading` tracks whether a request is running and returns to the container.
- Hook `toast = useToast()` shows errors when the request fails.
- Callback `runProofread(text)` sets loading true, awaits `requestProofreading(text)`, returns issues, catches errors to log them and show the error toast, and finally sets loading false.
- Console error `console.error("Proofreading request failed", error)` records failures for debugging.
- Error toast with title "Proofreading failed" and description "We could not analyze your writing right now. Please try again shortly." informs the user.
- Hook returns `{runProofread, isLoading}` for container use.

# Utils

highlights.js: Maps issues to highlight ranges.

- Function `mapIssueToRange(text, issue)` calls `findMatchRange` with `issue.original`.
- Function `buildHighlightRanges(text, issues)` maps the list through `mapIssueToRange` and filters out nulls.
- Module exports both helpers for other files.

textRange.js: Finds the first case-insensitive range in a string.

- Function `findMatchRange(haystack, needle)` returns `{start, end}` when the lowercased needle exists and null when not found.
- Guard `if (!needle.trim())` returns null so blank strings do not create highlights.
- Module exports `findMatchRange` for reuse.

textReplacement.js: Replaces the first occurrence of a needle.

- Function `replaceFirstOccurrence(haystack, needle, replacement)` uses `findMatchRange`, returns unchanged text when no range exists, and returns the replaced text plus the new range.
- Module exports `replaceFirstOccurrence` for the container.

tiptapHighlights.js: Bridges plain-text offsets into TipTap highlight decorations.

- Constant `issueHighlightPluginKey` stores the plugin key so updates can target the highlight plugin.
- Function `createIssueHighlightPlugin()` builds a ProseMirror plugin that keeps issue underline decorations in state.
- Function `offsetsToDocRanges({doc, offsets})` converts plain text offsets into ProseMirror positions.
- Function `updateIssueHighlights({editor, offsets})` maps offsets to doc ranges and dispatches the plugin meta to redraw the decorations.

# Tooling

eslint.config.js: Configures ESLint for the project.

- Array entry with `ignores` skips `node_modules`, `dist`, `.venv`, and build artifacts from linting.
- Spread entries apply the recommended React and Prettier configs.
- Config block sets browser globals, enables React settings, and turns off `react/react-in-jsx-scope` and `react/prop-types` for the automatic runtime.

# Services

proofreader.service.js: Handles API calls and fallback mock issues.

- Constant `API_ENDPOINT` stores "/api/proofread" for reuse.
- Function `createId()` generates stable ids using `crypto.randomUUID` with a random fallback.
- Function `normalizeIssue(issue, index)` validates fields and builds a clean issue object.
- Function `normalizeResponse(payload)` guards payload shape, logs it, and returns an array of normalized issues.
- Function `generateMockIssues(text)` assembles deterministic fallback issues like double spaces, repeated "very very", and missing punctuation.
- Async function `requestProofreading(text)` posts to the API, normalizes issues, and falls back to mock issues on failure.
- Console log `console.log("normalizeResponse data:", data);` surfaces raw payloads for inspection during development.
- Console warn `console.warn("Falling back to mock proofreading issues:", error);` announces when the mock path runs.
- `# Template` comment marks the Gemini integration placeholder.

# Theme

theme/index.js: Extends Chakra theme for the app shell.

- Constant `config` sets light mode as default without system preference.
- Constant `theme` uses `extendTheme` with the config, global body background, and a reusable `raisedPanel` layer style.
- Default export exposes `theme` for the Chakra provider.

# Styles

index.css: Supplies global and editor-specific styles required by the outline.

- Rule for `html, body, #root` sets full height and removes margins.
- Rule for `body` sets the font family, background color, and text color to match the outline.
- `.proofreader-editor` class makes the TipTap surface transparent, borderless, and sets typography.
- `.proofreader-editor .ProseMirror` rule ensures the editor fills the available height and removes borders.
- `.proofreader-editor .ProseMirror p` rule sets comfortable line height inside paragraphs.
- `.proofreader-editor .ProseMirror p.is-editor-empty::before` rule styles the placeholder in gray.
- `.proofread-highlight` class applies the wavy underline used for issue highlights.

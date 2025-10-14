# Directory Overview

- Keep `src/containers` for stateful components and `src/presentational` for pure UI pieces so the container/presentational pattern stays in place.
- Keep `src/hooks`, `src/services`, and `src/utils` to hold reusable logic, service calls, and helpers.
- Expose `useProofreader` and the utility helpers through their folders so other features can reuse them later.

# Entry

main.jsx: Mounts the React tree with Chakra theme support.

- Constant `rootElement` grabs the DOM node with id "root" before rendering starts.
- Guard throws an error if `rootElement` is missing so the app fails fast during boot.
- Render call wraps `<App />` inside `StrictMode`, `ChakraProvider`, and `ColorModeScript` using our custom theme to prepare Chakra styling.

App.jsx: Provides the container component to the tree.

- Function `App` returns `<ProofreaderAppContainer />` so all logic lives in the container layer.
- Default export exposes `App` to the entry file.

# Containers

ProofreaderAppContainer.jsx: Coordinates the essay workflow and passes data to presentational pieces.

- State `essayText` keeps the editor text string and passes to `EditorPane` as the `value` prop.
- State `issues` keeps the array of issue objects and passes to `IssuesPanel` as the `issues` prop.
- State `isAcceptingId` tracks which issue is being accepted to disable its controls and passes to `IssuesPanel` as the `isAcceptingId` prop.
- State `lastRunAt` stores the Date of the most recent proofread run and formats a helper string for the `CommandPanel`.
- Hook result `{runProofread, isLoading}` comes from `useProofreader()` and passes `isLoading` to `CommandPanel` and the `runProofread` function into handlers.
- Hook `toast = useToast()` gives access to Chakra toasts used for user messages inside handlers.
- Ref `editorRef` holds the textarea instance so handlers can restore focus and passes to `EditorPane` as the `editorRef` prop.
- Derived value `highlightRanges` uses `useMemo` to call `buildHighlightRanges(essayText, issues)` and passes the result to `EditorPane` as the `highlightRanges` prop.
- Callback `handleTextChange(nextText)` exits early if text did not change, updates `essayText`, and clears `issues` when the trimmed text is empty before passing to `EditorPane` as `onChange`.
- Callback `focusEditor()` focuses `editorRef.current` so the editor regains focus after actions.
- Async callback `handleProofread()` blocks empty essays, shows an info toast prompting writing, awaits `runProofread(essayText)`, updates `issues`, updates `lastRunAt`, shows a success toast summarizing results, and calls `focusEditor()` before passing to `CommandPanel` as `onProofread`.
- Info toast with title "Add some writing first" and description "Type or paste your essay before running proofread." appears inside `handleProofread` whenever the trimmed essay is empty.
- Success toast with title "Proofreading complete" and dynamic description reports the number of suggestions after `runProofread` resolves.
- Catch block relies on the hook's error toast so the container does not show a duplicate message.
- Disabled state for the proofread button uses `!essayText.trim() || isLoading` to prevent empty or duplicate runs.
- Helper text string uses `lastRunAt.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})` when available and passes to `CommandPanel` as `helperText`.
- Async callback `handleAccept(issueId)` finds the target issue, sets `isAcceptingId`, calls `replaceFirstOccurrence` to build the next editor text, shows an info toast if no match is found, updates `essayText`, filters the accepted issue out of `issues`, shows a success toast when the replacement happens, clears `isAcceptingId`, and calls `focusEditor()` before passing to `IssuesPanel` as `onAccept`.
- Info toast with title "Text already updated" and description "We could not locate the original phrasing to replace." appears when `replaceFirstOccurrence` cannot find a range.
- Success toast with title "Suggestion applied" and description `Updated "{targetIssue.original}".` confirms the replacement.
- Callback `handleDismiss(issueId)` removes the matching issue from `issues` and passes to `IssuesPanel` as `onDismiss`.
- JSX return renders `AppLayout` and passes the composed `CommandPanel`, `EditorPane`, and `IssuesPanel` elements through the `commandPanel`, `editor`, and `issuesPanel` props.
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
- `VStack` wrapper stretches full height with padding to match the outlined left panel.
- `Tools` heading text introduces the button group.
- `Proofread` button uses `colorScheme="purple"`, calls `onProofread`, obeys `disabled`, and shows the loading spinner when `isLoading` is true.
- Optional helper text box shows `helperText` under the controls when available.
- Default export exposes `CommandPanel` for layout composition.

EditorPane.jsx: Hosts the transparent textbox with highlights.

- Function `EditorPane` receives `value`, `placeholder`, `onChange`, `highlightRanges`, and `editorRef` props.
- Derived value `highlightConfig` uses `useMemo` to map `highlightRanges` into `[start, end]` pairs with the `proofread-highlight` class.
- Wrapper `Box` limits the width to 960px so the editor stays readable.
- `HighlightWithinTextarea` renders the editor, forwards the `editorRef`, binds `value`, uses the placeholder text, applies the `highlightConfig`, calls `onChange(nextValue)` on each edit, and uses the `.proofreader-editor` class to meet the design.
- Default export exposes `EditorPane` for the container.

IssuesPanel.jsx: Renders the right column suggestion stack.

- Function `IssuesPanel` receives `issues`, `onAccept`, `onDismiss`, and `isAcceptingId` props.
- Wrapper `Box` stretches full height with padding and vertical scroll.
- Heading text labels the section as "Suggestions".
- Empty state message explains that suggestions appear after analysis when `issues` is empty.
- `Stack` iterates over `issues` and renders `IssueCard` for each item while passing callbacks.
- Inline handler `() => onAccept(issue.id)` wraps the accept prop so each card sends its own id.
- Inline handler `() => onDismiss(issue.id)` wraps the dismiss prop so each card sends its own id.
- `IssueCard` receives `isProcessing` as `isAcceptingId === issue.id` to show the loading state.
- Default export exposes `IssuesPanel` for the container.

IssueCard.jsx: Displays each suggestion card.

- Function `IssueCard` receives `issue`, `onAccept`, `onDismiss`, and `isProcessing` props.
- Outer `Box` uses white background, purple border accent, and shadow per outline.
- Upper `Text` shows the `issue.category` in uppercase micro copy.
- `Heading` shows `{issue.original} ->` and bolds the suggestion.
- Body `Text` renders `issue.description` for additional context.
- `HStack` holds the action buttons in a row.
- `Accept` button calls `onAccept` and shows a loading spinner when `isProcessing` is true.
- `Dismiss` button calls `onDismiss` and disables while processing to block duplicate clicks.
- Default export exposes `IssueCard` to the panel.

# Hooks

hooks/useProofreader.js: Wraps the proofreading service with loading state and toast.

- State `isLoading` tracks whether a request is running and returns to the container.
- Hook `toast = useToast()` shows errors when the request fails.
- Callback `runProofread(text)` sets `isLoading` true, awaits `requestProofreading(text)`, returns the issues, catches errors to log them and show an error toast, and finally sets `isLoading` back to false.
- Console error `console.error("Proofreading request failed", error)` records failures for debugging.
- Error toast with title "Proofreading failed" and description "We could not analyze your writing right now. Please try again shortly." informs the user.
- Hook returns `{runProofread, isLoading}` for container use.

# Services

services/proofreader.service.js: Handles API calls and fallback mock issues.

- Constant `API_ENDPOINT` stores "/api/proofread" for reuse.
- Function `createId()` generates stable ids using `crypto.randomUUID` when available with a random fallback.
- Function `normalizeIssue(issue, index)` validates fields and builds a clean issue object.
- Function `normalizeResponse(payload)` guards payload shape, logs it, and returns an array of normalized issues.
- Console log `console.log("normalizeResponse data:", data);` surfaces raw payloads for inspection during development.
- Function `generateMockIssues(text)` assembles deterministic fallback issues like double spaces, repeated "very very", and missing punctuation by using `findMatchRange`.
- Double space check calls `findMatchRange(text, "  ")` and pushes a clarity issue with a space replacement.
- Repeated "very very" check finds the phrase and pushes a style issue suggesting "extremely".
- Missing period check uses a regex to find long sentences ending without punctuation and suggests appending a period.
- Exported async function `requestProofreading(text)` posts to the API, throws on HTTP errors, parses JSON, normalizes issues, appends ids, warns and falls back to mocks on failure, and returns the issue list.
- Console warn `console.warn("Falling back to mock proofreading issues:", error);` announces when the mock path runs.

# Utils

utils/highlights.js: Maps issues to highlight ranges.

- Function `mapIssueToRange(text, issue)` calls `findMatchRange` with `issue.original`.
- Function `buildHighlightRanges(text, issues)` maps the list through `mapIssueToRange` and filters out nulls.
- Module exports both helpers for other files.

utils/textRange.js: Finds the first case-insensitive range in a string.

- Function `findMatchRange(haystack, needle)` returns `{start, end}` when the lowercased needle exists and null when not found.
- Guard `if (!needle.trim())` returns null so blank strings do not create highlights.
- Module exports `findMatchRange` for reuse.

utils/textReplacement.js: Replaces the first occurrence of a needle.

- Function `replaceFirstOccurrence(haystack, needle, replacement)` uses `findMatchRange`, returns unchanged text when no range exists, and returns the replaced text plus the new range.
- Module exports `replaceFirstOccurrence` for the container.

# Theme

theme/index.js: Extends Chakra theme for the app shell.

- Constant `config` sets light mode as default without system preference.
- Constant `theme` uses `extendTheme` with the config, global body background, and a reusable `raisedPanel` layer style.
- Default export exposes `theme` for the Chakra provider.

# Styles

index.css: Supplies global and editor-specific styles required by the outline.

- Rule for `html, body, #root` sets full height and removes margins.
- Rule for `body` sets the font family, background color, and text color to match the outline.
- `.proofreader-editor` class makes the textarea transparent, borderless, and sets typography.
- `.proofreader-editor .DraftEditor-root` forces a tall minimum height for the editor area.
- `.proofreader-editor .public-DraftEditorPlaceholder-root` colors the placeholder gray.
- `.proofread-highlight` class applies the wavy underline used for issue highlights.

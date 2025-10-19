# Entry

main.jsx: Boots the React app with Chakra theme support.

- Constant rootElement grabs the DOM node with id "root" before rendering starts.
- Guard throws an error if rootElement is missing so the app fails fast during boot.
- Render call wraps <App /> inside StrictMode, ChakraProvider, and ColorModeScript using our custom theme to prepare Chakra styling.

App.jsx: Keeps the root lean by delegating everything to the container.

- Function App returns <ProofreaderAppContainer /> so all logic lives in the container layer.
- Default export exposes App to the entry file.

# Containers

ProofreaderAppContainer.jsx: Coordinates the essay workflow and syncs the TipTap editor with proofreading data.

- State essayText stores the current editor text before sending it to EditorPane as the content prop.
- State issues holds the suggestion list before handing it to IssuesPanel as the issues prop.
- State isAcceptingId tracks the issue id currently being accepted before passing it to IssuesPanel as the isAcceptingId prop.
- State lastRunAt keeps the last proofread Date so helper text can mention the analysis time.
- Ref editorRef stores the TipTap editor instance before passing it into EditorPane through the onReady prop.
- Hook result {runProofread, isLoading} comes from useProofreader() and feeds button loading props.
- Hook toast = useToast() prepares Chakra toasts for success and info feedback.
- Derived value highlightRanges calls buildHighlightRanges({essayText, issues}) before feeding EditorPane as the highlightRanges prop.
- Function handleEditorChange({nextText}) updates essayText and clears issues when nextText is blank before forwarding to EditorPane as onChange.
- Function focusEditor() calls editorRef.current?.commands.focus("end") so buttons return focus to the editor.
- Function handleProofread() blocks empty input, fires the info toast, runs runProofread with essayText, updates issues, records lastRunAt, shows the success toast, and refocuses the editor before passing to CommandPanel as onProofread.
- Info toast with title "Add some writing first" and description "Type or paste your essay before running proofread." appears when essayText is blank.
- Success toast with title "Proofreading complete" and a count-based description appears after runProofread resolves.
- Function syncEditorContent({nextText}) converts nextText into TipTap JSON and calls editorRef.current.commands.setContent to align the editor value.
- Function handleAccept({issueId}) finds the target issue, sets isAcceptingId, replaces text with replaceFirstOccurrence, handles the missing-match toast, updates essayText, prunes the accepted issue, syncs the editor, shows the success toast, clears isAcceptingId, and refocuses the editor before passing to IssuesPanel as onAccept.
- Info toast with title "Text already updated" and description "We could not locate the original phrasing to replace." appears when replaceFirstOccurrence returns no range.
- Success toast with title "Suggestion applied" and description Updated "{original}" appears after a replacement.
- Function handleDismiss({issueId}) removes the matching issue from issues before forwarding to IssuesPanel as onDismiss.
- Derived string helperText turns lastRunAt into "Last analyzed HH:MM" before supplying CommandPanel as the helperText prop.
- Derived boolean disabled equals !essayText.trim() || isLoading before controlling the proofread button.
- JSX return renders AppLayout with CommandPanel, EditorPane, and IssuesPanel supplied as props.
- Inline onReady handler stores the editor instance inside editorRef.
- Default export exposes ProofreaderAppContainer to App.jsx.

# Presentational

AppLayout.jsx: Defines the three-column layout shell from the outline.

- Function AppLayout receives commandPanel, editor, and issuesPanel props and returns a Grid with left and right gray panels and the center editor column.
- Left GridItem uses bg="gray.50" and a right-edge shadow while rendering the commandPanel prop.
- Center GridItem keeps a transparent background with padding and renders the editor prop.
- Right GridItem uses bg="gray.50" and a left-edge shadow while rendering the issuesPanel prop.
- Default export exposes AppLayout for the container.

CommandPanel.jsx: Shows the left vertical toolbar.

- Function CommandPanel receives onProofread, disabled, isLoading, and helperText props to control the proofread button and helper copy.
- VStack wrapper stretches full height with padding to match the outlined left panel.
- Heading text displays "Tools" above the button.
- Proofread button uses colorScheme="purple", calls onProofread, respects disabled, and shows the spinner when isLoading is true.
- Helper text box renders helperText when provided.
- Default export exposes CommandPanel for layout composition.

EditorPane.jsx: Hosts the TipTap editor with placeholder, change relay, and highlight overlay.

- Constant EditorDocument extends the base document so TipTap only allows block nodes.
- Function EditorPane receives content, placeholder, onChange, highlightRanges, and onReady props.
- Ref isSyncingRef stores a boolean to stop sync loops during TipTap updates.
- Ref lastTextRef keeps the previous text value so duplicate updates can be ignored.
- Function handleUpdate({editorInstance}) reads editorInstance.getText(), skips sync cycles, updates lastTextRef, and calls onChange when text changes.
- Constant initialDocContent turns the content prop into TipTap JSON paragraphs for the initial mount.
- Hook editor = useEditor(...) initializes TipTap with EditorDocument, StarterKit, the placeholder extension, and the issue highlight plugin with onUpdate calling handleUpdate.
- Hook useEffect registers createIssueHighlightPlugin() once editor exists and cleans it up on unmount.
- Hook useEffect calls onReady({editor}) when the editor instance becomes available.
- Hook useEffect keeps the TipTap document in sync with the content prop without re-triggering onChange by flipping isSyncingRef and lastTextRef.
- Hook useEffect calls updateIssueHighlights({editor, offsets: highlightRanges}) whenever highlightRanges changes.
- Return block renders a Box wrapper and the <EditorContent> element with the proper classes and placeholder.
- Default export exposes EditorPane for the container.

IssuesPanel.jsx: Renders the right column suggestion stack.

- Function IssuesPanel receives issues, onAccept, onDismiss, and isAcceptingId props.
- Wrapper Box stretches full height with padding and vertical scroll.
- Heading text labels the section as "Suggestions".
- Empty state copy explains that suggestions appear after analysis when issues is empty.
- Stack iterates over issues and renders IssueCard for each item while passing callbacks.
- Inline handler onAccept({issueId}) lets every card send its id to the accept callback.
- Inline handler onDismiss({issueId}) lets every card send its id to the dismiss callback.
- Boolean isProcessing equals isAcceptingId === issue.id so the Accept button shows loading per card.
- Default export exposes IssuesPanel for the container.

IssueCard.jsx: Displays each suggestion card.

- Function IssueCard receives issue, onAccept, onDismiss, and isProcessing props.
- Outer Box uses a white background, purple border accent, and shadow per outline.
- Upper Text shows issue.category in uppercase micro copy.
- Heading shows issue.original -> and bolds the suggestion.
- Body Text renders issue.description for additional context.
- Button row stacks the Accept and Dismiss buttons horizontally.
- Accept button calls onAccept and shows the spinner when isProcessing is true.
- Dismiss button calls onDismiss and disables while processing.
- Default export exposes IssueCard to the panel.

# Hooks

useProofreader.js: Wraps the proofreading service with loading state and toast.

- State isLoading tracks whether a request is running and returns to the container.
- Hook toast = useToast() shows errors when the request fails.
- Function runProofread({text}) sets loading true, awaits requestProofreading({text}), returns the issues, catches errors to log them, shows the error toast, and finally sets loading false.
- Console error console.error("Proofreading request failed", error) records failures for debugging.
- Error toast with title "Proofreading failed" and description "We could not analyze your writing right now. Please try again shortly." informs the user.
- Hook returns {runProofread, isLoading} for container use.

# Services

proofreader.service.js: Handles API calls and fallback mock issues.

- Constant API_ENDPOINT stores "/api/proofread" for reuse.
- Function createId() generates stable ids using crypto.randomUUID when available with a random fallback.
- Function normalizeIssue({issue, index}) validates fields and builds a clean issue object.
- Function normalizeResponse({payload}) guards payload shape, logs it, and returns an array of normalized issues.
- Console log console.log("normalizeResponse data:", data) surfaces raw payloads for inspection during development.
- Function generateMockIssues({text}) assembles deterministic fallback issues like double spaces, repeated "very very", and missing punctuation by using findMatchRange.
- Function requestProofreading({text}) posts to the API, throws on HTTP errors, parses JSON, normalizes issues, appends ids, warns and falls back to mocks on failure, and returns the issue list.
- Console warn console.warn("Falling back to mock proofreading issues:", error) announces when the mock path runs.
- # Template comment marks the Gemini integration placeholder.

# Utils

highlights.js: Builds highlight ranges for the editor.

- Function buildHighlightRanges({essayText, issues}) maps issue original strings into start and end offsets for underline decorations.
- Default export provides buildHighlightRanges to the container.

textRange.js: Finds substring ranges.

- Function findMatchRange({text, target}) performs a case-insensitive search for target and returns start and end offsets.
- Default export exposes findMatchRange for other helpers.

textReplacement.js: Applies replacements and reports ranges.

- Function replaceFirstOccurrence({essayText, original, suggestion}) uses findMatchRange to build nextText and returns {nextText, range}.
- Default export exposes replaceFirstOccurrence to the container.

tiptapHighlights.js: Bridges plain-text offsets into TipTap highlight decorations.

- Constant issueHighlightPluginKey stores the plugin key so updates can target the highlight plugin.
- Function createIssueHighlightPlugin() builds a ProseMirror plugin that keeps issue underline decorations in state.
- Function offsetsToDocRanges({doc, offsets}) converts plain text offsets into ProseMirror positions.
- Function updateIssueHighlights({editor, offsets}) maps offsets to doc ranges and dispatches the plugin meta to redraw the decorations.

# Theme

theme/index.js: Extends Chakra theme for the app shell.

- Constant config sets light mode as default without system preference.
- Constant theme uses extendTheme with the config, global body background, and a reusable raisedPanel layer style.
- Default export exposes theme for the Chakra provider.

# Styles

index.css: Supplies global and editor-specific styles required by the outline.

- Rule for html, body, #root sets full height and removes margins.
- Rule for body sets the font family, background color, and text color to match the outline.
- Rule for .proofreader-editor class makes the TipTap surface transparent, borderless, and sets typography.
- Rule for .proofreader-editor .ProseMirror ensures the editor fills the available height and removes borders.
- Rule for .proofreader-editor .ProseMirror p sets comfortable line height inside paragraphs.
- Rule for .proofreader-editor .ProseMirror p.is-editor-empty::before styles the placeholder in gray.
- Rule for .proofread-highlight class applies the wavy underline used for issue highlights.

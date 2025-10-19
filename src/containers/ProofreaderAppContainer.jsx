import {useRef, useState} from "react";
import {useToast} from "@chakra-ui/react";
import AppLayout from "../presentational/AppLayout";
import CommandPanel from "../presentational/CommandPanel";
import EditorPane from "../presentational/EditorPane";
import IssuesPanel from "../presentational/IssuesPanel";
import {useProofreader} from "../hooks/useProofreader";
import buildHighlightRanges from "../utils/highlights";
import replaceFirstOccurrence from "../utils/textReplacement";

// ProofreaderAppContainer.jsx: Coordinates the essay workflow and syncs the TipTap editor with proofreading data.
function ProofreaderAppContainer() {
    // State essayText stores the current editor text before sending it to EditorPane as the content prop.
    const [essayText, setEssayText] = useState("");
    // State issues holds the suggestion list before handing it to IssuesPanel as the issues prop.
    const [issues, setIssues] = useState([]);
    // State isAcceptingId tracks the issue id currently being accepted before passing it to IssuesPanel as the isAcceptingId prop.
    const [isAcceptingId, setIsAcceptingId] = useState(null);
    // State lastRunAt keeps the last proofread Date so helper text can mention the analysis time.
    const [lastRunAt, setLastRunAt] = useState(null);
    // Ref editorRef stores the TipTap editor instance before passing it into EditorPane through the onReady prop.
    const editorRef = useRef(null);
    // Hook result {runProofread, isLoading} comes from useProofreader() and feeds button loading props.
    const {runProofread, isLoading} = useProofreader();
    // Hook toast = useToast() prepares Chakra toasts for success and info feedback.
    const toast = useToast();
    // Derived value highlightRanges calls buildHighlightRanges({essayText, issues}) before feeding EditorPane as the highlightRanges prop.
    const highlightRanges = buildHighlightRanges({essayText, issues});

    // Function handleEditorChange({nextText}) updates essayText and clears issues when nextText is blank before forwarding to EditorPane as onChange.
    function handleEditorChange({nextText}) {
        setEssayText(nextText);
        if (!nextText.trim()) {
            setIssues([]);
        }
    }

    // Function focusEditor() calls editorRef.current?.commands.focus("end") so buttons return focus to the editor.
    function focusEditor() {
        editorRef.current?.commands.focus("end");
    }

    // Function handleProofread() blocks empty input, fires the info toast, runs runProofread with essayText, updates issues, records lastRunAt, shows the success toast, and refocuses the editor before passing to CommandPanel as onProofread.
    async function handleProofread() {
        if (!essayText.trim()) {
            // Info toast with title "Add some writing first" and description "Type or paste your essay before running proofread." appears when essayText is blank.
            toast({
                title: "Add some writing first",
                description:
                    "Type or paste your essay before running proofread.",
                status: "info",
                duration: 4000,
                isClosable: true
            });

            return;
        }

        try {
            const nextIssues = await runProofread({text: essayText});
            setIssues(nextIssues);
            setLastRunAt(new Date());

            // Success toast with title "Proofreading complete" and a count-based description appears after runProofread resolves.
            toast({
                title: "Proofreading complete",
                description: nextIssues.length
                    ? `We found ${nextIssues.length} ${
                          nextIssues.length === 1 ? "suggestion" : "suggestions"
                      }.`
                    : "No issues detected. Nicely done!",
                status: "success",
                duration: 4000,
                isClosable: true
            });
        } catch {
            // Catch block relies on the hook's error toast so the container does not show a duplicate message.
        } finally {
            focusEditor();
        }
    }

    // Function syncEditorContent({nextText}) converts nextText into TipTap JSON and calls editorRef.current.commands.setContent to align the editor value.
    function syncEditorContent({nextText}) {
        if (!editorRef.current) {
            return;
        }

        const docContent =
            nextText.length === 0
                ? [{type: "paragraph"}]
                : nextText.split("\n").map(line => ({
                      type: "paragraph",
                      content: line.length ? [{type: "text", text: line}] : []
                  }));

        editorRef.current.commands.setContent(
            {
                type: "doc",
                content: docContent
            },
            false
        );
    }

    // Function handleAccept({issueId}) finds the target issue, sets isAcceptingId, replaces text with replaceFirstOccurrence, handles the missing-match toast, updates essayText, prunes the accepted issue, syncs the editor, shows the success toast, clears isAcceptingId, and refocuses the editor before passing to IssuesPanel as onAccept.
    function handleAccept({issueId}) {
        const targetIssue = issues.find(issue => issue.id === issueId);
        if (!targetIssue) {
            return;
        }

        setIsAcceptingId(issueId);
        try {
            const {nextText, range} = replaceFirstOccurrence({
                essayText,
                original: targetIssue.original,
                suggestion: targetIssue.suggestion
            });

            if (!range) {
                // Info toast with title "Text already updated" and description "We could not locate the original phrasing to replace." appears when replaceFirstOccurrence returns no range.
                toast({
                    title: "Text already updated",
                    description:
                        "We could not locate the original phrasing to replace.",
                    status: "info",
                    duration: 3000,
                    isClosable: true
                });

                return;
            }

            setEssayText(nextText);
            setIssues(prevIssues =>
                prevIssues.filter(issue => issue.id !== issueId)
            );
            syncEditorContent({nextText});

            // Success toast with title "Suggestion applied" and description Updated "{original}" appears after a replacement.
            toast({
                title: "Suggestion applied",
                description: `Updated "${targetIssue.original}".`,
                status: "success",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsAcceptingId(null);
            focusEditor();
        }
    }

    // Function handleDismiss({issueId}) removes the matching issue from issues before forwarding to IssuesPanel as onDismiss.
    function handleDismiss({issueId}) {
        setIssues(prevIssues =>
            prevIssues.filter(issue => issue.id !== issueId)
        );
    }

    // Derived string helperText turns lastRunAt into "Last analyzed HH:MM" before supplying CommandPanel as the helperText prop.
    const helperText = lastRunAt
        ? `Last analyzed ${lastRunAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
          })}`
        : null;

    // Derived boolean disabled equals !essayText.trim() || isLoading before controlling the proofread button.
    const disabled = !essayText.trim() || isLoading;

    // JSX return renders AppLayout with CommandPanel, EditorPane, and IssuesPanel supplied as props.
    return (
        <AppLayout
            commandPanel={
                <CommandPanel
                    onProofread={handleProofread}
                    disabled={disabled}
                    isLoading={isLoading}
                    helperText={helperText}
                />
            }
            editor={
                <EditorPane
                    content={essayText}
                    placeholder="Start writing your masterpiece"
                    onChange={handleEditorChange}
                    highlightRanges={highlightRanges}
                    onReady={({editor}) => {
                        // Inline onReady handler stores the editor instance inside editorRef.
                        editorRef.current = editor;
                    }}
                />
            }
            issuesPanel={
                <IssuesPanel
                    issues={issues}
                    onAccept={handleAccept}
                    onDismiss={handleDismiss}
                    isAcceptingId={isAcceptingId}
                />
            }
        />
    );
}

// Default export exposes ProofreaderAppContainer to App.jsx.
export default ProofreaderAppContainer;

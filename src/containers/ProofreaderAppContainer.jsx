import {useCallback, useMemo, useRef, useState} from "react";
import {useToast} from "@chakra-ui/react";
import AppLayout from "../presentational/AppLayout";
import CommandPanel from "../presentational/CommandPanel";
import EditorPane from "../presentational/EditorPane";
import IssuesPanel from "../presentational/IssuesPanel";
import {useProofreader} from "../hooks/useProofreader";
import {buildHighlightRanges} from "../utils/highlights";
import {replaceFirstOccurrence} from "../utils/textReplacement";

// ProofreaderAppContainer.jsx: Coordinates the essay workflow and syncs the TipTap editor with proofreading data.
function ProofreaderAppContainer() {
    // State essayText stores the current editor text and passes to EditorPane as the content prop.
    const [essayText, setEssayText] = useState("");
    // State issues keeps the list of issue objects and passes to IssuesPanel as the issues prop.
    const [issues, setIssues] = useState([]);
    // State isAcceptingId tracks the id that is being accepted and passes to IssuesPanel as the isAcceptingId prop.
    const [isAcceptingId, setIsAcceptingId] = useState(null);
    // State lastRunAt stores the last proofread Date and drives the helper text shown in CommandPanel.
    const [lastRunAt, setLastRunAt] = useState(null);

    // Ref editorRef holds the TipTap editor instance so actions can refocus the editor and passes to EditorPane through the onReady prop.
    const editorRef = useRef(null);

    // Hook result {runProofread, isLoading} comes from useProofreader() and feeds loading flags into the command button.
    const {runProofread, isLoading} = useProofreader();
    // Hook toast = useToast() prepares Chakra toasts for user feedback.
    const toast = useToast();

    // Derived value highlightRanges uses buildHighlightRanges(essayText, issues) and passes to EditorPane as the highlightRanges prop.
    const highlightRanges = useMemo(
        () => buildHighlightRanges(essayText, issues),
        [essayText, issues]
    );

    // Callback handleEditorChange(nextText) ignores repeats, updates essayText, and clears issues when the trimmed text is empty before passing to EditorPane as onChange.
    const handleEditorChange = useCallback(
        nextText => {
            if (nextText === essayText) {
                return;
            }

            setEssayText(nextText);
            if (!nextText.trim()) {
                setIssues([]);
            }
        },
        [essayText]
    );

    // Callback focusEditor() calls editorRef.current?.commands.focus('end') so buttons return focus to the editor.
    const focusEditor = useCallback(() => {
        editorRef.current?.commands.focus("end");
    }, []);

    // Async callback handleProofread() blocks empty input, fires the info toast, awaits runProofread(essayText), updates issues, records lastRunAt, fires the success toast, and then calls focusEditor() before passing to CommandPanel as onProofread.
    const handleProofread = useCallback(async () => {
        if (!essayText.trim()) {
            // Info toast with title "Add some writing first" and description "Type or paste your essay before running proofread." appears when handleProofread rejects empty text.
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
            const nextIssues = await runProofread(essayText);
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
    }, [essayText, focusEditor, runProofread, toast]);

    // Callback syncEditorContent(nextText) sets the TipTap document to nextText through editorRef.current so Accept keeps the editor and state aligned.
    const syncEditorContent = useCallback(nextText => {
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
    }, []);

    // Async callback handleAccept(issueId) guards the lookup, sets isAcceptingId, uses replaceFirstOccurrence to build nextText, shows the missing-match toast when no range is found, updates essayText, removes the accepted issue, calls syncEditorContent(nextText), fires the success toast, clears isAcceptingId, and calls focusEditor() before passing to IssuesPanel as onAccept.
    const handleAccept = useCallback(
        issueId => {
            const targetIssue = issues.find(issue => issue.id === issueId);
            if (!targetIssue) {
                return;
            }

            setIsAcceptingId(issueId);
            try {
                const {nextText, range} = replaceFirstOccurrence(
                    essayText,
                    targetIssue.original,
                    targetIssue.suggestion
                );

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
                setIssues(prev => prev.filter(issue => issue.id !== issueId));
                syncEditorContent(nextText);

                // Success toast with title "Suggestion applied" and description `Updated "{targetIssue.original}".` appears after the replacement.
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
        },
        [essayText, focusEditor, issues, syncEditorContent, toast]
    );

    // Callback handleDismiss(issueId) removes the matching issue from issues and passes to IssuesPanel as onDismiss.
    const handleDismiss = useCallback(issueId => {
        setIssues(prev => prev.filter(issue => issue.id !== issueId));
    }, []);

    // Derived string helperText reads lastRunAt with toLocaleTimeString and passes to CommandPanel as the helperText prop.
    const helperText = useMemo(() => {
        if (!lastRunAt) {
            return null;
        }

        return `Last analyzed ${lastRunAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;
    }, [lastRunAt]);

    // Prop disabled equals !essayText.trim() || isLoading so the proofread button ignores blank or busy states.
    const disabled = !essayText.trim() || isLoading;

    // JSX return renders AppLayout with CommandPanel, EditorPane, and IssuesPanel provided through props.
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
                    onReady={editor => {
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

import {useCallback, useMemo, useRef, useState} from "react";
import {useToast} from "@chakra-ui/react";
import AppLayout from "../presentational/AppLayout";
import CommandPanel from "../presentational/CommandPanel";
import EditorPane from "../presentational/EditorPane";
import IssuesPanel from "../presentational/IssuesPanel";
import {useProofreader} from "../hooks/useProofreader";
import {buildHighlightRanges} from "../utils/highlights";
import {replaceFirstOccurrence} from "../utils/textReplacement";

// ProofreaderAppContainer.jsx: Coordinates the essay workflow and passes data to presentational pieces.
function ProofreaderAppContainer() {
    // State essayText keeps the editor text string and passes to EditorPane as the value prop.
    const [essayText, setEssayText] = useState("");
    // State issues keeps the array of issue objects and passes to IssuesPanel as the issues prop.
    const [issues, setIssues] = useState([]);
    // State isAcceptingId tracks which issue is being accepted to disable its controls and passes to IssuesPanel as the isAcceptingId prop.
    const [isAcceptingId, setIsAcceptingId] = useState(null);
    // State lastRunAt stores the Date of the most recent proofread run and formats a helper string for the CommandPanel.
    const [lastRunAt, setLastRunAt] = useState(null);

    // Hook result {runProofread, isLoading} comes from useProofreader() and passes isLoading to CommandPanel and the runProofread function into handlers.
    const {runProofread, isLoading} = useProofreader();
    // Hook toast = useToast() gives access to Chakra toasts used for user messages inside handlers.
    const toast = useToast();
    // Ref editorRef holds the textarea instance so handlers can restore focus and passes to EditorPane as the editorRef prop.
    const editorRef = useRef(null);

    // Derived value highlightRanges uses useMemo to call buildHighlightRanges(essayText, issues) and passes the result to EditorPane as the highlightRanges prop.
    const highlightRanges = useMemo(
        () => buildHighlightRanges(essayText, issues),
        [essayText, issues]
    );

    // Callback handleTextChange(nextText) exits early if text did not change, updates essayText, and clears issues when the trimmed text is empty before passing to EditorPane as onChange.
    const handleTextChange = useCallback(
        nextText => {
            if (nextText === essayText) {
                return;
            }

            setEssayText(nextText);
            if (!nextText.trim()) {
                setIssues([]);
            }
        },
        [essayText, setIssues]
    );

    // Callback focusEditor() focuses editorRef.current so the editor regains focus after actions.
    const focusEditor = useCallback(() => {
        editorRef.current?.focus();
    }, []);

    // Async callback handleProofread() blocks empty essays, shows an info toast prompting writing, awaits runProofread(essayText), updates issues, updates lastRunAt, shows a success toast summarizing results, and calls focusEditor() before passing to CommandPanel as onProofread.
    const handleProofread = useCallback(async () => {
        if (!essayText.trim()) {
            // Info toast with title "Add some writing first" and description "Type or paste your essay before running proofread." appears inside handleProofread whenever the trimmed essay is empty.
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

            // Success toast with title "Proofreading complete" and dynamic description reports the number of suggestions after runProofread resolves.
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
        } catch (error) {
            // Catch block relies on the hook's error toast so the container does not show a duplicate message.
        } finally {
            focusEditor();
        }
    }, [essayText, focusEditor, runProofread, toast]);

    // Async callback handleAccept(issueId) finds the target issue, sets isAcceptingId, calls replaceFirstOccurrence to build the next editor text, shows an info toast if no match is found, updates essayText, filters the accepted issue out of issues, shows a success toast when the replacement happens, clears isAcceptingId, and calls focusEditor() before passing to IssuesPanel as onAccept.
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
                    // Info toast with title "Text already updated" and description "We could not locate the original phrasing to replace." appears when replaceFirstOccurrence cannot find a range.
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

                // Success toast with title "Suggestion applied" and description `Updated "{targetIssue.original}".` confirms the replacement.
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
        [essayText, focusEditor, issues, toast]
    );

    // Callback handleDismiss(issueId) removes the matching issue from issues and passes to IssuesPanel as onDismiss.
    const handleDismiss = useCallback(issueId => {
        setIssues(prev => prev.filter(issue => issue.id !== issueId));
    }, []);

    // JSX return renders AppLayout and passes the composed CommandPanel, EditorPane, and IssuesPanel elements through the commandPanel, editor, and issuesPanel props.
    return (
        <AppLayout
            commandPanel={
                <CommandPanel
                    onProofread={handleProofread}
                    // Disabled state for the proofread button uses !essayText.trim() || isLoading to prevent empty or duplicate runs.
                    disabled={!essayText.trim() || isLoading}
                    isLoading={isLoading}
                    // Helper text string uses lastRunAt.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}) when available and passes to CommandPanel as helperText.
                    helperText={
                        lastRunAt &&
                        `Last analyzed ${lastRunAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}`
                    }
                />
            }
            editor={
                <EditorPane
                    value={essayText}
                    placeholder="Start writing your masterpiece"
                    onChange={handleTextChange}
                    highlightRanges={highlightRanges}
                    editorRef={editorRef}
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

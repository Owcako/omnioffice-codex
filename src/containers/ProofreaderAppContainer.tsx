import {useCallback, useMemo, useRef, useState} from "react";
import {useToast} from "@chakra-ui/react";
import type {Editor} from "draft-js";
import AppLayout from "../presentational/AppLayout";
import CommandPanel from "../presentational/CommandPanel";
import EditorPane from "../presentational/EditorPane";
import IssuesPanel from "../presentational/IssuesPanel";
import {useProofreader} from "../hooks/useProofreader";
import type {ProofreadIssue} from "../interfaces/proofreader";
import {buildHighlightRanges} from "../utils/highlights";
import {replaceFirstOccurrence} from "../utils/textReplacement";

function ProofreaderAppContainer() {
    const [essayText, setEssayText] = useState("");
    const [issues, setIssues] = useState<ProofreadIssue[]>([]);
    const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);
    const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

    const {runProofread, isLoading} = useProofreader();
    const toast = useToast();
    const editorRef = useRef<Editor | null>(null);

    const highlightRanges = useMemo(
        () => buildHighlightRanges(essayText, issues),
        [essayText, issues]
    );

    const handleTextChange = useCallback(
        (nextText: string) => {
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

    const focusEditor = useCallback(() => {
        editorRef.current?.focus();
    }, []);

    const handleProofread = useCallback(async () => {
        if (!essayText.trim()) {
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
            // Error toast handled inside hook.
        } finally {
            focusEditor();
        }
    }, [essayText, focusEditor, runProofread, toast]);

    const handleAccept = useCallback(
        (issueId: string) => {
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

    const handleDismiss = useCallback((issueId: string) => {
        setIssues(prev => prev.filter(issue => issue.id !== issueId));
    }, []);

    return (
        <AppLayout
            commandPanel={
                <CommandPanel
                    onProofread={handleProofread}
                    disabled={!essayText.trim() || isLoading}
                    isLoading={isLoading}
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

export default ProofreaderAppContainer;

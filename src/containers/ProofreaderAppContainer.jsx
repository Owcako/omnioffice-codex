import {useEffect, useRef, useState} from "react";
import {useToast} from "@chakra-ui/react";
import AppLayout from "../presentational/AppLayout";
import CommandPanel from "../presentational/CommandPanel";
import OutlineGoalPanel from "../presentational/OutlineGoalPanel";
import OutlineOverlay from "../presentational/OutlineOverlay";
import EditorPane from "../presentational/EditorPane";
import IssuesPanel from "../presentational/IssuesPanel";
import {useProofreader} from "../hooks/useProofreader";
import {useOutline} from "../hooks/useOutline";
import buildHighlightRanges from "../utils/highlights";
import replaceFirstOccurrence from "../utils/textReplacement";
import {mapSegmentsToMarkers} from "../utils/outlinePositions";

// ProofreaderAppContainer.jsx: Coordinates proofread and outline flows before assembling the layout.
function ProofreaderAppContainer() {
    // State essayText stores the current editor text before we pass it to EditorPane as the content prop.
    const [essayText, setEssayText] = useState("");
    // State issues holds the proofreading suggestions list before we pass it to IssuesPanel as the issues prop.
    const [issues, setIssues] = useState([]);
    // State isAcceptingId tracks the issue id currently being accepted before we pass it to IssuesPanel as the isAcceptingId prop.
    const [isAcceptingId, setIsAcceptingId] = useState(null);
    // State lastRunAt keeps the Date of the last proofread run before we derive the helper text for CommandPanel.
    const [lastRunAt, setLastRunAt] = useState(null);
    // State isOutlineView toggles the Outline Goal panel before we choose which command panel component to render.
    const [isOutlineView, setIsOutlineView] = useState(false);
    // State outlineGoal keeps the Outline Goal input value before we hand it to OutlineGoalPanel as the outlineGoal prop.
    const [outlineGoal, setOutlineGoal] = useState("");
    // State outlineSegments stores the latest outline objects before we compute overlay markers.
    const [outlineSegments, setOutlineSegments] = useState([]);
    // State outlineMarkers keeps the positioned overlay labels before we hand them to OutlineOverlay as the markers prop.
    const [outlineMarkers, setOutlineMarkers] = useState([]);
    // State isGeneratingOutline tracks the outline request status before we disable Create Outline inside OutlineGoalPanel.
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    // Ref editorRef stores the TipTap editor instance before we call focus and content sync operations.
    const editorRef = useRef(null);
    // Ref outlineOverlayRef supplies the overlay container element before we measure marker positions.
    const outlineOverlayRef = useRef(null);
    // Ref pendingReflowFrameRef caches the requestAnimationFrame id before we throttle outline marker recomputes.
    const pendingReflowFrameRef = useRef(null);
    // Hook result {runProofread, isLoading} comes from useProofreader before we wire proofread actions.
    const {runProofread, isLoading} = useProofreader();
    // Hook result {runOutline, isLoading: isOutlineLoading} comes from useOutline before we run outline generation.
    const {runOutline, isLoading: isOutlineLoading} = useOutline();
    // Hook toast = useToast() prepares Chakra toasts for success and info feedback.
    const toast = useToast();
    // Derived value highlightRanges calls buildHighlightRanges({essayText, issues}) before we pass it to EditorPane as the highlightRanges prop.
    const highlightRanges = buildHighlightRanges({essayText, issues});
    // Derived value helperText formats lastRunAt into “Last analyzed HH:MM” before we hand it to CommandPanel.
    const helperText = lastRunAt
        ? `Last analyzed ${lastRunAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
          })}`
        : null;
    // Derived value proofreadDisabled becomes true when essayText is blank or proofread is loading before we disable the Proofread button.
    const proofreadDisabled = !essayText.trim() || isLoading;
    // Derived value outlineDisabled becomes true when essayText is blank or outline is loading before we disable Create Outline.
    const outlineDisabled = !essayText.trim() || isGeneratingOutline;

    // Function handleEditorChange({nextText}) updates essayText and clears issues and outline data when the editor becomes empty before we forward it to EditorPane as onChange.
    function handleEditorChange({nextText}) {
        setEssayText(nextText);
        if (!nextText.trim()) {
            setIssues([]);
            setOutlineSegments([]);
            setOutlineMarkers([]);
        }
    }

    // Function focusEditor() calls editorRef.current?.commands.focus("end") before we return focus after actions.
    function focusEditor() {
        editorRef.current?.commands.focus("end");
    }

    // Function handleProofread() blocks empty essays, shows the info toast, runs runProofread, updates issues, records lastRunAt, shows the success toast, and refocuses the editor before we pass it to CommandPanel as onProofread.
    async function handleProofread() {
        if (!essayText.trim()) {
            // UI toast Add some writing first uses status info when essayText is blank.
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

            // UI toast Proofreading complete uses status success when runProofread resolves.
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
            // Errors propagate because the hook toast already covers failure states.
        } finally {
            focusEditor();
        }
    }

    // Function syncEditorContent({nextText}) converts plain text into TipTap JSON and calls editorRef.current.commands.setContent before we keep the editor aligned with essayText.
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

    // Function handleAccept({issueId}) finds the issue, sets isAcceptingId, replaces the text with replaceFirstOccurrence, handles missing matches with a toast, updates essayText, prunes the issue, syncs the editor, shows the success toast, clears isAcceptingId, and refocuses the editor before we pass it to IssuesPanel as onAccept.
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
                // UI toast Text already updated uses status info when replaceFirstOccurrence finds no range.
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

            // UI toast Suggestion applied uses status success after a replacement succeeds.
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

    // Function handleDismiss({issueId}) removes the issue from issues before we pass it to IssuesPanel as onDismiss.
    function handleDismiss({issueId}) {
        setIssues(prevIssues =>
            prevIssues.filter(issue => issue.id !== issueId)
        );
    }

    // Function handleOpenOutline() sets isOutlineView true and clears outlineMarkers before we switch to the Outline Goal panel.
    function handleOpenOutline() {
        setIsOutlineView(true);
        setOutlineMarkers([]);
    }

    // Function handleOutlineGoalChange({value}) updates outlineGoal before we control OutlineGoalPanel.
    function handleOutlineGoalChange({value}) {
        setOutlineGoal(value);
    }

    // Function logOutlineRequest({essayLength, goalLength}) writes console.log with the payload lengths before we send the outline request.
    function logOutlineRequest({essayLength, goalLength}) {
        // Function logOutlineRequest({essayLength, goalLength}) writes console.log with the payload lengths before we send the outline request.
        console.log("Outline request payload", {
            essayLength,
            goalLength
        });
    }

    // Function handleCreateOutline() checks for blank essays, shows the info toast, logs the payload, runs runOutline, stores outlineSegments, toggles isOutlineView, computes markers, shows the success toast, and handles errors before we pass it to OutlineGoalPanel as onCreateOutline.
    async function handleCreateOutline() {
        if (!essayText.trim()) {
            // UI toast Need essay text uses status info when essayText is blank during outline creation.
            toast({
                title: "Need essay text",
                description:
                    "Type or paste your essay before asking for an outline.",
                status: "info",
                duration: 4000,
                isClosable: true
            });

            return;
        }

        logOutlineRequest({
            essayLength: essayText.length,
            goalLength: outlineGoal.length
        });

        try {
            const outline = await runOutline({
                essayText,
                outlineGoal
            });
            setOutlineSegments(outline);
            setIsOutlineView(false);
            computeOutlineMarkers({segments: outline});

            // UI toast Outline ready uses status success when runOutline returns data.
            toast({
                title: "Outline ready",
                description: outline.length
                    ? "We placed structure labels next to your draft."
                    : "No outline suggestions were returned.",
                status: "success",
                duration: 4000,
                isClosable: true
            });
        } catch {
            // Errors propagate because the hook toast already covers failure states.
        }
    }

    // Function computeOutlineMarkers() measures overlay positions with mapSegmentsToMarkers, converts them to relative coordinates, and updates outlineMarkers before we render OutlineOverlay.
    function computeOutlineMarkers({segments = outlineSegments} = {}) {
        const overlayEl = outlineOverlayRef.current;
        if (!overlayEl || !Array.isArray(segments) || segments.length === 0) {
            setOutlineMarkers([]);
            return;
        }

        const editorElement = document.querySelector(".proofreader-editor");
        if (!editorElement) {
            setOutlineMarkers([]);
            return;
        }

        const overlayRect = overlayEl.getBoundingClientRect();
        const mapped = mapSegmentsToMarkers({
            rootElement: editorElement,
            segments
        });

        setOutlineMarkers(
            mapped.map(marker => ({
                structure: marker.structure,
                top: marker.top - overlayRect.top + marker.height / 2
            }))
        );
    }

    // Function clearAndScheduleOutlineReflow() clears outlineMarkers and schedules computeOutlineMarkers in requestAnimationFrame before we respond to scroll changes.
    function clearAndScheduleOutlineReflow() {
        setOutlineMarkers([]);
        if (pendingReflowFrameRef.current) {
            cancelAnimationFrame(pendingReflowFrameRef.current);
        }

        pendingReflowFrameRef.current = requestAnimationFrame(() => {
            computeOutlineMarkers();
            pendingReflowFrameRef.current = null;
        });
    }

    // Function handleWindowScroll() calls clearAndScheduleOutlineReflow before we keep overlays synced while the user scrolls.
    function handleWindowScroll() {
        clearAndScheduleOutlineReflow();
    }

    // Effect hook attaches window scroll listeners when outlineSegments exist and cleans up before unmounting.
    useEffect(() => {
        if (!outlineSegments.length) {
            return;
        }

        function onScroll() {
            handleWindowScroll();
        }

        window.addEventListener("scroll", onScroll, {passive: true});

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [outlineSegments]);

    // Effect hook recomputes outlineMarkers whenever outlineSegments, isOutlineView, or essayText change before we keep overlays accurate.
    useEffect(() => {
        if (!outlineSegments.length || isOutlineView) {
            setOutlineMarkers([]);
            return;
        }

        computeOutlineMarkers();
    }, [outlineSegments, isOutlineView, essayText]);

    // Effect hook updates isGeneratingOutline when isOutlineLoading changes before we reflect loading state in the UI.
    useEffect(() => {
        setIsGeneratingOutline(isOutlineLoading);
    }, [isOutlineLoading]);

    // Return block renders AppLayout with CommandPanel or OutlineGoalPanel, OutlineOverlay, EditorPane, and IssuesPanel before we present the full experience.
    return (
        <AppLayout
            commandPanel={
                isOutlineView ? (
                    <OutlineGoalPanel
                        outlineGoal={outlineGoal}
                        onOutlineGoalChange={handleOutlineGoalChange}
                        onCreateOutline={handleCreateOutline}
                        isGeneratingOutline={isGeneratingOutline}
                        outlineDisabled={outlineDisabled}
                    />
                ) : (
                    <CommandPanel
                        onProofread={handleProofread}
                        disabled={proofreadDisabled}
                        isLoading={isLoading}
                        helperText={helperText}
                        onOutline={handleOpenOutline}
                        isOutlineView={isOutlineView}
                    />
                )
            }
            outlineOverlay={
                <OutlineOverlay
                    markers={outlineMarkers}
                    ref={outlineOverlayRef}
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
                    onScroll={() => {
                        handleWindowScroll();
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

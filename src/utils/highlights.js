import findMatchRange from "./textRange";

// highlights.js: Builds highlight ranges for the editor.
// Function buildHighlightRanges({essayText, issues}) maps issue original strings into start and end offsets for underline decorations.
function buildHighlightRanges({essayText, issues}) {
    return issues
        .map(issue =>
            findMatchRange({
                text: essayText,
                target: issue.original
            })
        )
        .filter(Boolean);
}

// Default export provides buildHighlightRanges to the container.
export default buildHighlightRanges;

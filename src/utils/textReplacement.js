import findMatchRange from "./textRange";

// textReplacement.js: Applies replacements and reports ranges.
// Function replaceFirstOccurrence({essayText, original, suggestion}) uses findMatchRange to build nextText and returns {nextText, range}.
function replaceFirstOccurrence({essayText, original, suggestion}) {
    const range = findMatchRange({
        text: essayText,
        target: original
    });

    if (!range) {
        return {nextText: essayText, range: null};
    }

    const nextText = `${essayText.slice(
        0,
        range.start
    )}${suggestion}${essayText.slice(range.end)}`;

    return {
        nextText,
        range: {
            start: range.start,
            end: range.start + suggestion.length
        }
    };
}

// Default export exposes replaceFirstOccurrence to the container.
export default replaceFirstOccurrence;

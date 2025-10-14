import {findMatchRange} from "./textRange";

// utils/textReplacement.js: Replaces the first occurrence of a needle.
export function replaceFirstOccurrence(haystack, needle, replacement) {
    const range = findMatchRange(haystack, needle);

    if (!range) {
        return {nextText: haystack, range: null};
    }

    const nextText = `${haystack.slice(
        0,
        range.start
    )}${replacement}${haystack.slice(range.end)}`;

    return {
        nextText,
        range: {
            start: range.start,
            end: range.start + replacement.length
        }
    };
}

// Module exports replaceFirstOccurrence for the container.

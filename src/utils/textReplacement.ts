import type {TextRange} from "./textRange";
import {findMatchRange} from "./textRange";

interface ReplacementResult {
    nextText: string;
    range: TextRange | null;
}

export function replaceFirstOccurrence(
    haystack: string,
    needle: string,
    replacement: string
): ReplacementResult {
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

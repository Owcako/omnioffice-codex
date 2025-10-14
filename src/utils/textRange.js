// utils/textRange.js: Finds the first case-insensitive range in a string.
export function findMatchRange(haystack, needle) {
    // Guard if (!needle.trim()) returns null so blank strings do not create highlights.
    if (!needle.trim()) {
        return null;
    }

    const lowerHaystack = haystack.toLowerCase();
    const lowerNeedle = needle.toLowerCase();
    const index = lowerHaystack.indexOf(lowerNeedle);

    if (index === -1) {
        return null;
    }

    return {
        start: index,
        end: index + needle.length
    };
}

// Module exports findMatchRange for reuse.

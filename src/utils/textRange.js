export function findMatchRange(haystack, needle) {
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

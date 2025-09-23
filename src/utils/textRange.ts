export interface TextRange {
    start: number;
    end: number;
}

export function findMatchRange(
    haystack: string,
    needle: string
): TextRange | null {
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

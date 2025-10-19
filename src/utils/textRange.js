// textRange.js: Finds substring ranges.
// Function findMatchRange({text, target}) performs a case-insensitive search for target and returns start and end offsets.
function findMatchRange({text, target}) {
    if (!target.trim()) {
        return null;
    }

    const lowerHaystack = text.toLowerCase();
    const lowerNeedle = target.toLowerCase();
    const index = lowerHaystack.indexOf(lowerNeedle);

    if (index === -1) {
        return null;
    }

    return {
        start: index,
        end: index + target.length
    };
}

// Default export exposes findMatchRange for other helpers.
export default findMatchRange;

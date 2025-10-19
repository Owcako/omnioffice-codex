import findMatchRange from "../utils/textRange";

// proofreader.service.js: Handles API calls and fallback mock issues.
// Constant API_ENDPOINT stores "/api/proofread" for reuse.
const API_ENDPOINT = "/api/proofread";

// Function createId() generates stable ids using crypto.randomUUID when available with a random fallback.
function createId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 10);
}

// Function normalizeIssue({issue, index}) validates fields and builds a clean issue object.
function normalizeIssue({issue, index}) {
    if (!issue || typeof issue !== "object") {
        return null;
    }

    if (!issue.original || !issue.suggestion || !issue.description) {
        return null;
    }

    return {
        id: issue.id ?? `${index}-${issue.original}-${issue.suggestion}`,
        category: issue.category ?? "General",
        original: issue.original,
        suggestion: issue.suggestion,
        description: issue.description
    };
}

// Function normalizeResponse(payload) guards payload shape, logs it, and returns an array of normalized issues.
function normalizeResponse({payload}) {
    if (!payload || typeof payload !== "object") {
        return [];
    }

    const data = payload;

    // Console log console.log("normalizeResponse data:", data) surfaces raw payloads for inspection during development.
    console.log("normalizeResponse data:", data);

    const issues = Array.isArray(data)
        ? data
        : Array.isArray(data.issues)
          ? data.issues
          : [];

    return issues
        .map((issue, index) => normalizeIssue({issue, index}))
        .filter(Boolean);
}

// Function generateMockIssues({text}) assembles deterministic fallback issues like double spaces, repeated "very very", and missing punctuation by using findMatchRange.
function generateMockIssues({text}) {
    const results = [];

    if (!text.trim()) {
        return results;
    }

    // Double space check calls findMatchRange({text, target: "  "}) and pushes a clarity issue with a space replacement.
    const doubleSpaceRange = findMatchRange({text, target: "  "});
    if (doubleSpaceRange) {
        results.push({
            id: createId(),
            category: "Clarity",
            original: text.slice(doubleSpaceRange.start, doubleSpaceRange.end),
            suggestion: " ",
            description:
                "Two spaces found together. Replace with a single space for readability."
        });
    }

    // Repeated "very very" check finds the phrase and pushes a style issue suggesting "extremely".
    const veryIndex = text.toLowerCase().indexOf("very very");
    if (veryIndex !== -1) {
        results.push({
            id: createId(),
            category: "Style",
            original: text.slice(veryIndex, veryIndex + "very very".length),
            suggestion: "extremely",
            description:
                "Repeated modifier detected. Consider a stronger single word."
        });
    }

    // Missing period check uses a regex to find long sentences ending without punctuation and suggests appending a period.
    const sentenceWithoutPeriod = /\b([A-Z][^.!?]{20,})(?=$|\s{2,})/m.exec(
        text
    );
    if (sentenceWithoutPeriod) {
        const matchText = sentenceWithoutPeriod[1].trim();
        const range = findMatchRange({text, target: matchText});
        if (range) {
            results.push({
                id: createId(),
                category: "Grammar",
                original: matchText,
                suggestion: `${matchText}.`,
                description:
                    "Sentence appears to be missing terminal punctuation."
            });
        }
    }

    return results;
}

// Function requestProofreading({text}) posts to the API, throws on HTTP errors, parses JSON, normalizes issues, appends ids, warns and falls back to mocks on failure, and returns the issue list.
export async function requestProofreading({text}) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text
            })
        });

        if (!response.ok) {
            throw new Error(
                `Proofreading request failed with status ${response.status}`
            );
        }

        const payload = await response.json();

        // # Template comment marks the Gemini integration placeholder.
        const normalized = normalizeResponse({payload});

        if (normalized.length) {
            return normalized.map((issue, index) => ({
                ...issue,
                id: issue.id ?? `${index}-${createId()}`
            }));
        }
    } catch (error) {
        // Console warn console.warn("Falling back to mock proofreading issues:", error) announces when the mock path runs.
        console.warn("Falling back to mock proofreading issues:", error);
    }

    return generateMockIssues({text});
}

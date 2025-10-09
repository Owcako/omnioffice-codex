import {findMatchRange} from "../utils/textRange";

const API_ENDPOINT = "/api/proofread";

function createId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 10);
}

function normalizeIssue(issue, index) {
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

function normalizeResponse(payload) {
    if (!payload || typeof payload !== "object") {
        return [];
    }

    const data = payload;
    console.log("normalizeResponse data:", data);

    const issues = Array.isArray(data)
        ? data
        : Array.isArray(data.issues)
          ? data.issues
          : [];

    return issues
        .map((issue, index) => normalizeIssue(issue, index))
        .filter(Boolean);
}

function generateMockIssues(text) {
    const results = [];

    if (!text.trim()) {
        return results;
    }

    const doubleSpaceRange = findMatchRange(text, "  ");
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

    const sentenceWithoutPeriod = /\b([A-Z][^.!?]{20,})(?=$|\s{2,})/m.exec(
        text
    );
    if (sentenceWithoutPeriod) {
        const matchText = sentenceWithoutPeriod[1].trim();
        const range = findMatchRange(text, matchText);
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

export async function requestProofreading(text) {
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

        // # Template: replace normalization when integrating the Gemini-powered proofreading service payload shape.
        const normalized = normalizeResponse(payload);

        if (normalized.length) {
            return normalized.map((issue, index) => ({
                ...issue,
                id: issue.id ?? `${index}-${createId()}`
            }));
        }
    } catch (error) {
        console.warn("Falling back to mock proofreading issues:", error);
    }

    return generateMockIssues(text);
}

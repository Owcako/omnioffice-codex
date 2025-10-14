import {findMatchRange} from "./textRange";

// utils/highlights.js: Maps issues to highlight ranges.
// Function mapIssueToRange(text, issue) calls findMatchRange with issue.original.
export function mapIssueToRange(text, issue) {
    return findMatchRange(text, issue.original);
}

// Function buildHighlightRanges(text, issues) maps the list through mapIssueToRange and filters out nulls.
export function buildHighlightRanges(text, issues) {
    return issues.map(issue => mapIssueToRange(text, issue)).filter(Boolean);
}

// Module exports both helpers for other files.

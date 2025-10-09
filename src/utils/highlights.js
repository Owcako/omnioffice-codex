import {findMatchRange} from "./textRange";

export function mapIssueToRange(text, issue) {
    return findMatchRange(text, issue.original);
}

export function buildHighlightRanges(text, issues) {
    return issues.map(issue => mapIssueToRange(text, issue)).filter(Boolean);
}

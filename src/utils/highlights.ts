import type {ProofreadIssue} from "../interfaces/proofreader";
import type {TextRange} from "./textRange";
import {findMatchRange} from "./textRange";

export function mapIssueToRange(
    text: string,
    issue: ProofreadIssue
): TextRange | null {
    return findMatchRange(text, issue.original);
}

export function buildHighlightRanges(
    text: string,
    issues: ProofreadIssue[]
): TextRange[] {
    return issues
        .map(issue => mapIssueToRange(text, issue))
        .filter((range): range is TextRange => Boolean(range));
}

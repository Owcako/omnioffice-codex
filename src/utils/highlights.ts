import type { ProofreadIssue } from "../interfaces/proofreader";
import type { TextRange } from "./textRange";
import { findMatchRange } from "./textRange";

export const mapIssueToRange = (
  text: string,
  issue: ProofreadIssue
): TextRange | null => {
  if (typeof issue.start === "number" && typeof issue.end === "number") {
    return {
      start: issue.start,
      end: issue.end,
    };
  }

  return findMatchRange(text, issue.original);
};

export const buildHighlightRanges = (
  text: string,
  issues: ProofreadIssue[]
): TextRange[] => {
  return issues
    .map((issue) => mapIssueToRange(text, issue))
    .filter((range): range is TextRange => Boolean(range));
};

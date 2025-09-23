export interface ProofreadIssue {
  id: string;
  category: string;
  original: string;
  suggestion: string;
  description: string;
  start?: number;
  end?: number;
}

export type ProofreadResponse = ProofreadIssue[];

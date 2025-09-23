export interface ProofreadIssue {
    id: string;
    category: string;
    original: string;
    suggestion: string;
    description: string;
}

export type ProofreadResponse = ProofreadIssue[];

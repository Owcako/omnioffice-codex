import {Box, Stack, Text} from "@chakra-ui/react";
import type {ProofreadIssue} from "../interfaces/proofreader";
import IssueCard from "./IssueCard";

interface IssuesPanelProps {
    issues: ProofreadIssue[];
    onAccept(issueId: string): void;
    onDismiss(issueId: string): void;
    isAcceptingId: string | null;
}

function IssuesPanel({
    issues,
    onAccept,
    onDismiss,
    isAcceptingId
}: IssuesPanelProps) {
    return (
        <Box
            w="100%"
            minH="100vh"
            px={6}
            py={10}
            overflowY="auto"
        >
            <Text
                fontSize="lg"
                fontWeight="semibold"
                mb={4}
                color="gray.700"
            >
                Suggestions
            </Text>
            {issues.length === 0 ? (
                <Box
                    color="gray.500"
                    mt={10}
                    fontSize="sm"
                >
                    Proofreading suggestions will appear here after you analyze
                    your writing.
                </Box>
            ) : (
                <Stack spacing={4}>
                    {issues.map(issue => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            onAccept={() => {
                                onAccept(issue.id);
                            }}
                            onDismiss={() => {
                                onDismiss(issue.id);
                            }}
                            isProcessing={isAcceptingId === issue.id}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default IssuesPanel;

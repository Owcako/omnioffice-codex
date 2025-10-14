import {Box, Stack, Text} from "@chakra-ui/react";
import IssueCard from "./IssueCard";

// IssuesPanel.jsx: Renders the right column suggestion stack.
function IssuesPanel({issues, onAccept, onDismiss, isAcceptingId}) {
    // Function IssuesPanel receives issues, onAccept, onDismiss, and isAcceptingId props.
    // Wrapper Box stretches full height with padding and vertical scroll.
    return (
        <Box
            w="100%"
            minH="100vh"
            px={6}
            py={10}
            overflowY="auto"
        >
            {/* Heading text labels the section as "Suggestions". */}
            <Text
                fontSize="lg"
                fontWeight="semibold"
                mb={4}
                color="gray.700"
            >
                Suggestions
            </Text>
            {issues.length === 0 ? (
                <>
                    {/* Empty state message explains that suggestions appear after analysis when issues is empty. */}
                    <Box
                        color="gray.500"
                        mt={10}
                        fontSize="sm"
                    >
                        Proofreading suggestions will appear here after you
                        analyze your writing.
                    </Box>
                </>
            ) : (
                <>
                    {/* Stack iterates over issues and renders IssueCard for each item while passing callbacks. */}
                    <Stack spacing={4}>
                        {issues.map(issue => {
                            // IssueCard receives isProcessing as isAcceptingId === issue.id to show the loading state.
                            const isProcessing = isAcceptingId === issue.id;

                            return (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    onAccept={() => {
                                        // Inline handler () => onAccept(issue.id) wraps the accept prop so each card sends its own id.
                                        onAccept(issue.id);
                                    }}
                                    onDismiss={() => {
                                        // Inline handler () => onDismiss(issue.id) wraps the dismiss prop so each card sends its own id.
                                        onDismiss(issue.id);
                                    }}
                                    isProcessing={isProcessing}
                                />
                            );
                        })}
                    </Stack>
                </>
            )}
        </Box>
    );
}

// Default export exposes IssuesPanel for the container.
export default IssuesPanel;

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
                    {/* Empty state copy explains that suggestions appear after analysis when issues is empty. */}
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
                            // isProcessing equals isAcceptingId === issue.id so the Accept button shows loading per card.
                            const isProcessing = isAcceptingId === issue.id;

                            return (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    onAccept={() => {
                                        // Inline handler () => onAccept(issue.id) lets every card send its id to the accept callback.
                                        onAccept(issue.id);
                                    }}
                                    onDismiss={() => {
                                        // Inline handler () => onDismiss(issue.id) lets every card send its id to the dismiss callback.
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

import {Box, Button, HStack, Heading, Text, VStack} from "@chakra-ui/react";

// IssueCard.jsx: Displays each suggestion card.
function IssueCard({issue, onAccept, onDismiss, isProcessing}) {
    // Function IssueCard receives issue, onAccept, onDismiss, and isProcessing props.
    return (
        <Box
            bg="white"
            borderRadius="md"
            boxShadow="base"
            p={4}
            borderLeft="4px solid"
            borderColor="purple.300"
        >
            {/* Outer Box uses white background, purple border accent, and shadow per outline. */}
            <VStack
                align="stretch"
                spacing={3}
            >
                {/* Upper Text shows the issue.category in uppercase micro copy. */}
                <Text
                    fontSize="xs"
                    textTransform="uppercase"
                    color="gray.500"
                    letterSpacing="wider"
                >
                    {issue.category}
                </Text>
                {/* Heading shows {issue.original} -> and bolds the suggestion. */}
                <Heading
                    as="h3"
                    size="sm"
                    color="gray.800"
                    fontWeight="semibold"
                >
                    {issue.original}
                    {" -> "}
                    <Text
                        as="span"
                        fontWeight="bold"
                    >
                        {issue.suggestion}
                    </Text>
                </Heading>
                {/* Body Text renders issue.description for additional context. */}
                <Text
                    fontSize="sm"
                    color="gray.600"
                >
                    {issue.description}
                </Text>
                {/* HStack holds the action buttons in a row. */}
                <HStack
                    spacing={3}
                    pt={2}
                >
                    {/* Accept button calls onAccept and shows a loading spinner when isProcessing is true. */}
                    <Button
                        colorScheme="purple"
                        size="sm"
                        onClick={onAccept}
                        isLoading={isProcessing}
                    >
                        Accept
                    </Button>
                    {/* Dismiss button calls onDismiss and disables while processing to block duplicate clicks. */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDismiss}
                        isDisabled={isProcessing}
                    >
                        Dismiss
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}

// Default export exposes IssueCard to the panel.
export default IssueCard;

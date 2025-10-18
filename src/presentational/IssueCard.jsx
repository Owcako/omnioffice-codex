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
            {/* Outer Box uses a white background, purple border accent, and shadow per outline. */}
            <VStack
                align="stretch"
                spacing={3}
            >
                {/* Upper text shows issue.category in uppercase micro copy. */}
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
                {/* Button row stacks the Accept and Dismiss buttons horizontally. */}
                <HStack
                    spacing={3}
                    pt={2}
                >
                    {/* Accept button calls onAccept and shows the spinner when isProcessing is true. */}
                    <Button
                        colorScheme="purple"
                        size="sm"
                        onClick={onAccept}
                        isLoading={isProcessing}
                    >
                        Accept
                    </Button>
                    {/* Dismiss button calls onDismiss and disables while processing. */}
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

import {Box, Button, HStack, Heading, Text, VStack} from "@chakra-ui/react";

function IssueCard({issue, onAccept, onDismiss, isProcessing}) {
    return (
        <Box
            bg="white"
            borderRadius="md"
            boxShadow="base"
            p={4}
            borderLeft="4px solid"
            borderColor="purple.300"
        >
            <VStack
                align="stretch"
                spacing={3}
            >
                <Text
                    fontSize="xs"
                    textTransform="uppercase"
                    color="gray.500"
                    letterSpacing="wider"
                >
                    {issue.category}
                </Text>
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
                <Text
                    fontSize="sm"
                    color="gray.600"
                >
                    {issue.description}
                </Text>
                <HStack
                    spacing={3}
                    pt={2}
                >
                    <Button
                        colorScheme="purple"
                        size="sm"
                        onClick={onAccept}
                        isLoading={isProcessing}
                    >
                        Accept
                    </Button>
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

export default IssueCard;

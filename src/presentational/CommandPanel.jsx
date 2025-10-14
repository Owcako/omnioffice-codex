import {Box, Button, Text, VStack} from "@chakra-ui/react";

// CommandPanel.jsx: Shows the left vertical toolbar.
function CommandPanel({onProofread, disabled, isLoading, helperText}) {
    // Function CommandPanel receives onProofread, disabled, isLoading, and helperText props to control the proofread button and helper copy.
    // VStack wrapper stretches full height with padding to match the outlined left panel.
    return (
        <VStack
            align="stretch"
            spacing={6}
            px={6}
            py={10}
            w="100%"
            minH="100vh"
        >
            <Box>
                {/* Tools heading text introduces the button group. */}
                <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    mb={4}
                    color="gray.700"
                >
                    Tools
                </Text>
                {/* Proofread button uses colorScheme="purple", calls onProofread, obeys disabled, and shows the loading spinner when isLoading is true. */}
                <Button
                    colorScheme="purple"
                    onClick={onProofread}
                    isDisabled={disabled}
                    isLoading={isLoading}
                >
                    Proofread
                </Button>
            </Box>
            {/* Optional helper text box shows helperText under the controls when available. */}
            {helperText && <Box color="gray.500">{helperText}</Box>}
        </VStack>
    );
}

// Default export exposes CommandPanel for layout composition.
export default CommandPanel;

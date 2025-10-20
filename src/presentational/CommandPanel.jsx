import {Box, Button, Text, VStack} from "@chakra-ui/react";

// CommandPanel.jsx: Shows the Tools panel with Proofread and Outline actions.
function CommandPanel({
    onProofread,
    disabled,
    isLoading,
    helperText,
    onOutline,
    isOutlineView
}) {
    // Prop onProofread triggers handleProofread when the Proofread button is clicked.
    // Prop disabled drives the disabled state of the Proofread button.
    // Prop isLoading drives the Proofread button spinner.
    // Prop helperText renders schedule information under the buttons.
    // Prop onOutline triggers handleOpenOutline when the Outline button is clicked.
    // Prop isOutlineView disables the Outline button when the Outline panel is already open.
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
                {/* Text heading displays “Tools” above the buttons. */}
                <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    mb={4}
                    color="gray.700"
                >
                    Tools
                </Text>
                {/* Button Proofread uses colorScheme purple and calls onProofread when clicked. */}
                <Button
                    colorScheme="purple"
                    onClick={() => {
                        onProofread({});
                    }}
                    isDisabled={disabled}
                    isLoading={isLoading}
                    mb={3}
                >
                    Proofread
                </Button>

                {/* Button Outline uses bg blue.400, white text, and calls onOutline when clicked. */}
                <Button
                    bg="blue.400"
                    color="white"
                    _hover={{bg: "blue.500"}}
                    onClick={() => {
                        onOutline({});
                    }}
                    isDisabled={isOutlineView}
                >
                    Outline
                </Button>
            </Box>
            {/* Prop helperText renders schedule information under the buttons. */}
            {helperText && <Box color="gray.500">{helperText}</Box>}
        </VStack>
    );
}

// Default export exposes CommandPanel for layout composition.
export default CommandPanel;

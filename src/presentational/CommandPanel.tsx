import {Box, Button, Text, VStack} from "@chakra-ui/react";
import type {ReactNode} from "react";

interface CommandPanelProps {
    onProofread(): void;
    disabled?: boolean;
    isLoading?: boolean;
    helperText?: ReactNode;
}

function CommandPanel({
    onProofread,
    disabled,
    isLoading,
    helperText
}: CommandPanelProps) {
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
                <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    mb={4}
                    color="gray.700"
                >
                    Tools
                </Text>
                <Button
                    colorScheme="purple"
                    onClick={onProofread}
                    isDisabled={disabled}
                    isLoading={isLoading}
                >
                    Proofread
                </Button>
            </Box>
            {helperText && <Box color="gray.500">{helperText}</Box>}
        </VStack>
    );
}

export default CommandPanel;

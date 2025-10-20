import {Button, Heading, Text, Textarea, VStack} from "@chakra-ui/react";

// OutlineGoalPanel.jsx: Presents the Outline Goal workflow when Outline mode is active.
function OutlineGoalPanel({
    outlineGoal,
    onOutlineGoalChange,
    onCreateOutline,
    isGeneratingOutline,
    outlineDisabled
}) {
    // Prop outlineGoal provides the controlled textarea value.
    // Prop onOutlineGoalChange updates outlineGoal when the textarea changes.
    // Prop onCreateOutline triggers handleCreateOutline when the Create Outline button is clicked.
    // Prop isGeneratingOutline shows the loading state on the Create Outline button.
    // Prop outlineDisabled disables the Create Outline button when outlineDisabled is true.
    return (
        <VStack
            align="stretch"
            spacing={6}
            px={6}
            py={10}
            w="100%"
            minH="100vh"
        >
            {/* Heading Outline Goal renders the title text at the top. */}
            <Heading
                as="h2"
                size="lg"
                color="gray.700"
            >
                Outline Goal
            </Heading>

            {/* Text helper description shows “Describe the essay's goal so I can create a custom outline for you”. */}
            <Text color="gray.500">
                Describe the essay{"'"}s goal so I can create a custom outline
                for you
            </Text>

            {/* Textarea outlineGoalInput shows a light blue border and uses onOutlineGoalChange. */}
            <Textarea
                value={outlineGoal}
                onChange={event => {
                    onOutlineGoalChange({value: event.target.value});
                }}
                borderColor="blue.200"
                focusBorderColor="blue.400"
                minH="160px"
            />

            {/* Button Create Outline uses bg blue.400, white text, respects outlineDisabled, and calls onCreateOutline. */}
            <Button
                bg="blue.400"
                color="white"
                _hover={{bg: "blue.500"}}
                onClick={() => {
                    onCreateOutline({});
                }}
                isLoading={isGeneratingOutline}
                isDisabled={outlineDisabled}
            >
                Create Outline
            </Button>
        </VStack>
    );
}

// Default export exposes OutlineGoalPanel for container use.
export default OutlineGoalPanel;

import {forwardRef} from "react";
import {Box, Text} from "@chakra-ui/react";

// OutlineOverlay.jsx: Renders positioned structure labels inside the transparent overlay column.
const OutlineOverlay = forwardRef(function OutlineOverlay({markers}, ref) {
    // Prop markers receives outlineMarkers from the container.
    // Forwarded ref overlayRef exposes the container element to the parent for measurements.
    // Container Box uses position relative, transparent background, and pointerEvents none.
    return (
        <Box
            ref={ref}
            position="relative"
            w="100%"
            minH="100vh"
            pointerEvents="none"
        >
            {/* Mapped boxes render each marker with absolute positioning, white background, and gray border. */}
            {markers.map(marker => (
                <Box
                    key={`${marker.structure}-${marker.top}`}
                    position="absolute"
                    top={marker.top}
                    left={0}
                    right={0}
                    transform="translateY(-50%)"
                    pointerEvents="none"
                >
                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.300"
                        borderRadius="md"
                        boxShadow="sm"
                        px={3}
                        py={2}
                    >
                        <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700"
                        >
                            {marker.structure}
                        </Text>
                    </Box>
                </Box>
            ))}
        </Box>
    );
});

// Default export exposes OutlineOverlay for layout composition.
export default OutlineOverlay;

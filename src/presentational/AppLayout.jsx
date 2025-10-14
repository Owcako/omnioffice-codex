import {Grid, GridItem} from "@chakra-ui/react";

// AppLayout.jsx: Defines the three-column layout shell from the outline.
function AppLayout({commandPanel, editor, issuesPanel}) {
    // Function AppLayout receives commandPanel, editor, and issuesPanel props and returns a Grid with left and right gray panels and the center editor column.
    return (
        <Grid
            templateColumns="220px 1fr 360px"
            minH="100vh"
        >
            {/* Left GridItem uses bg="gray.50" and a right-edge shadow while rendering the commandPanel prop. */}
            <GridItem
                display="flex"
                bg="gray.50"
                boxShadow="4px 0 16px rgba(0, 0, 0, 0.08)"
                zIndex={1}
            >
                {commandPanel}
            </GridItem>
            {/* Center GridItem keeps a transparent background with padding and renders the editor prop. */}
            <GridItem
                bg="transparent"
                display="flex"
                justifyContent="center"
                px={12}
                py={10}
            >
                {editor}
            </GridItem>
            {/* Right GridItem uses bg="gray.50" and a left-edge shadow while rendering the issuesPanel prop. */}
            <GridItem
                display="flex"
                bg="gray.50"
                boxShadow="-4px 0 16px rgba(0, 0, 0, 0.08)"
                zIndex={1}
            >
                {issuesPanel}
            </GridItem>
        </Grid>
    );
}

// Default export exposes AppLayout for the container.
export default AppLayout;

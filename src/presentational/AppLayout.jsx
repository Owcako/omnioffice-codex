import {Grid, GridItem} from "@chakra-ui/react";

// AppLayout.jsx: Defines the four-column layout with the transparent overlay column.
function AppLayout({commandPanel, outlineOverlay, editor, issuesPanel}) {
    // Prop commandPanel renders the left column content.
    // Prop outlineOverlay renders the transparent overlay column content.
    // Prop editor renders the editor column.
    // Prop issuesPanel renders the right column.
    return (
        <Grid
            templateColumns="220px 140px 1fr 360px"
            minH="100vh"
        >
            {/* GridItem for commandPanel uses bg="gray.50" with a right-edge shadow while rendering commandPanel. */}
            <GridItem
                display="flex"
                bg="gray.50"
                boxShadow="4px 0 16px rgba(0, 0, 0, 0.08)"
                zIndex={1}
            >
                {commandPanel}
            </GridItem>
            {/* Overlay GridItem keeps bg transparent and renders outlineOverlay. */}
            <GridItem
                display="flex"
                bg="transparent"
            >
                {outlineOverlay}
            </GridItem>
            {/* GridItem for editor keeps a transparent background with padding and renders editor. */}
            <GridItem
                bg="transparent"
                display="flex"
                justifyContent="center"
                px={12}
                py={10}
            >
                {editor}
            </GridItem>
            {/* GridItem for issuesPanel uses bg="gray.50" with a left-edge shadow while rendering issuesPanel. */}
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

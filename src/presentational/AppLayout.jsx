import {Grid, GridItem} from "@chakra-ui/react";

function AppLayout({commandPanel, editor, issuesPanel}) {
    return (
        <Grid
            templateColumns="220px 1fr 360px"
            minH="100vh"
        >
            <GridItem
                display="flex"
                bg="gray.50"
                boxShadow="4px 0 16px rgba(0, 0, 0, 0.08)"
                zIndex={1}
            >
                {commandPanel}
            </GridItem>
            <GridItem
                bg="transparent"
                display="flex"
                justifyContent="center"
                px={12}
                py={10}
            >
                {editor}
            </GridItem>
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

export default AppLayout;

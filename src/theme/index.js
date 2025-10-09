import {extendTheme} from "@chakra-ui/react";

const config = {
    initialColorMode: "light",
    useSystemColorMode: false
};

const theme = extendTheme({
    config,
    styles: {
        global: {
            body: {
                bg: "gray.100",
                color: "gray.900"
            }
        }
    },
    layerStyles: {
        raisedPanel: {
            bg: "gray.50",
            boxShadow: "0 0 16px rgba(0, 0, 0, 0.08)"
        }
    }
});

export default theme;

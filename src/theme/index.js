import {extendTheme} from "@chakra-ui/react";

// theme/index.js: Extends Chakra theme for the app shell.
// Constant config sets light mode as default without system preference.
const config = {
    initialColorMode: "light",
    useSystemColorMode: false
};

// Constant theme uses extendTheme with the config, global body background, and a reusable raisedPanel layer style.
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

// Default export exposes theme for the Chakra provider.
export default theme;

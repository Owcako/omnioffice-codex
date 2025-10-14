import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import App from "./App";
import theme from "./theme";
import "./index.css";

// Constant rootElement grabs the DOM node with id "root" before rendering starts.
const rootElement = document.getElementById("root");

// Guard throws an error if rootElement is missing so the app fails fast during boot.
if (!rootElement) {
    throw new Error("Root element not found");
}

// Render call wraps <App /> inside StrictMode, ChakraProvider, and ColorModeScript using our custom theme to prepare Chakra styling.
createRoot(rootElement).render(
    <StrictMode>
        <ChakraProvider theme={theme}>
            <ColorModeScript
                initialColorMode={theme.config?.initialColorMode}
            />
            <App />
        </ChakraProvider>
    </StrictMode>
);

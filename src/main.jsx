import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import App from "./App";
import theme from "./theme";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found");
}

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

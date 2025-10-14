import {useCallback, useState} from "react";
import {useToast} from "@chakra-ui/react";
import {requestProofreading} from "../services/proofreader.service";

// hooks/useProofreader.js: Wraps the proofreading service with loading state and toast.
export function useProofreader() {
    // State isLoading tracks whether a request is running and returns to the container.
    const [isLoading, setIsLoading] = useState(false);
    // Hook toast = useToast() shows errors when the request fails.
    const toast = useToast();

    // Callback runProofread(text) sets isLoading true, awaits requestProofreading(text), returns the issues, catches errors to log them and show an error toast, and finally sets isLoading back to false.
    const runProofread = useCallback(
        async text => {
            setIsLoading(true);
            try {
                const issues = await requestProofreading(text);
                return issues;
            } catch (error) {
                // Console error console.error("Proofreading request failed", error) records failures for debugging.
                console.error("Proofreading request failed", error);

                // Error toast with title "Proofreading failed" and description "We could not analyze your writing right now. Please try again shortly." informs the user.
                toast({
                    title: "Proofreading failed",
                    description:
                        "We could not analyze your writing right now. Please try again shortly.",
                    status: "error",
                    duration: 6000,
                    isClosable: true
                });
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    // Hook returns {runProofread, isLoading} for container use.
    return {runProofread, isLoading};
}

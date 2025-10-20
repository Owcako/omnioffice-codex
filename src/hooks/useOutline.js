import {useState} from "react";
import {useToast} from "@chakra-ui/react";
import {requestOutline} from "../services/outline.service";

// useOutline.js: Wraps the outline service with loading state and toast.
export function useOutline() {
    // State isLoading tracks whether the outline request is running.
    const [isLoading, setIsLoading] = useState(false);
    // Hook toast = useToast() shows errors when outline generation fails.
    const toast = useToast();

    // Function runOutline({essayText, outlineGoal}) awaits requestOutline, returns the outline, logs failures, shows the error toast, and toggles loading.
    async function runOutline({essayText, outlineGoal}) {
        setIsLoading(true);
        try {
            const outline = await requestOutline({essayText, outlineGoal});
            return outline;
        } catch (error) {
            // Log console.error("Outline request failed", error) records outline failures.
            console.error("Outline request failed", error);

            // UI toast Outline failed uses status error when runOutline catches an error.
            toast({
                title: "Outline failed",
                description:
                    "We could not generate an outline right now. Please try again shortly.",
                status: "error",
                duration: 6000,
                isClosable: true
            });

            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    // Hook returns {runOutline, isLoading} for container use.
    return {runOutline, isLoading};
}

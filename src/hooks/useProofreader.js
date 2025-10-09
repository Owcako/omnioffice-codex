import {useCallback, useState} from "react";
import {useToast} from "@chakra-ui/react";
import {requestProofreading} from "../services/proofreader.service";

export function useProofreader() {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const runProofread = useCallback(
        async text => {
            setIsLoading(true);
            try {
                const issues = await requestProofreading(text);
                return issues;
            } catch (error) {
                console.error("Proofreading request failed", error);
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

    return {runProofread, isLoading};
}

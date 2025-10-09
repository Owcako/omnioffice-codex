import {Box} from "@chakra-ui/react";
import {useMemo} from "react";
import HighlightWithinTextarea from "react-highlight-within-textarea";

function EditorPane({
    value,
    placeholder,
    onChange,
    highlightRanges,
    editorRef
}) {
    const highlightConfig = useMemo(() => {
        if (!highlightRanges.length) {
            return [];
        }

        return highlightRanges.map(range => ({
            highlight: [range.start, range.end],
            className: "proofread-highlight"
        }));
    }, [highlightRanges]);

    return (
        <Box
            w="100%"
            maxW="960px"
            h="100%"
        >
            <HighlightWithinTextarea
                ref={editorRef}
                value={value}
                placeholder={placeholder}
                highlight={highlightConfig}
                onChange={nextValue => {
                    onChange(nextValue);
                }}
                className="proofreader-editor"
            />
        </Box>
    );
}

export default EditorPane;

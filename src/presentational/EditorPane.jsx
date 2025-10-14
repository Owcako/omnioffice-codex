import {Box} from "@chakra-ui/react";
import {useMemo} from "react";
import HighlightWithinTextarea from "react-highlight-within-textarea";

// EditorPane.jsx: Hosts the transparent textbox with highlights.
function EditorPane({
    value,
    placeholder,
    onChange,
    highlightRanges,
    editorRef
}) {
    // Function EditorPane receives value, placeholder, onChange, highlightRanges, and editorRef props.
    // Derived value highlightConfig uses useMemo to map highlightRanges into [start, end] pairs with the proofread-highlight class.
    const highlightConfig = useMemo(() => {
        if (!highlightRanges.length) {
            return [];
        }

        return highlightRanges.map(range => ({
            highlight: [range.start, range.end],
            className: "proofread-highlight"
        }));
    }, [highlightRanges]);

    // Wrapper Box limits the width to 960px so the editor stays readable.
    return (
        <Box
            w="100%"
            maxW="960px"
            h="100%"
        >
            {/* HighlightWithinTextarea renders the editor, forwards the editorRef, binds value, uses the placeholder text, applies the highlightConfig, calls onChange(nextValue) on each edit, and uses the .proofreader-editor class to meet the design. */}
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

// Default export exposes EditorPane for the container.
export default EditorPane;

import {Box} from "@chakra-ui/react";
import {useMemo} from "react";
import HighlightWithinTextarea, {
    type Highlight
} from "react-highlight-within-textarea";
import type {Editor} from "draft-js";
import type {MutableRefObject} from "react";
import type {TextRange} from "../utils/textRange";

interface EditorPaneProps {
    value: string;
    placeholder: string;
    onChange(next: string): void;
    highlightRanges: TextRange[];
    editorRef: MutableRefObject<Editor | null>;
}

function EditorPane({
    value,
    placeholder,
    onChange,
    highlightRanges,
    editorRef
}: EditorPaneProps) {
    const highlightConfig = useMemo<Highlight>(() => {
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
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                {...({className: "proofreader-editor"} as any)}
            />
        </Box>
    );
}

export default EditorPane;

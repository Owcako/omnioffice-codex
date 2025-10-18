import {Box} from "@chakra-ui/react";
import {useCallback, useEffect, useRef} from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
    createIssueHighlightPlugin,
    updateIssueHighlights
} from "../utils/tiptapHighlights";

// EditorPane.jsx: Hosts the TipTap editor with placeholder, change relay, and highlight overlay.
function EditorPane({
    content,
    placeholder,
    onChange,
    highlightRanges,
    onReady
}) {
    // Function EditorPane receives content, placeholder, onChange, highlightRanges, and onReady props.
    const isSyncingRef = useRef(false);
    const lastTextRef = useRef(content ?? "");

    // Callback handleUpdate() grabs editor.getText() and calls onChange when the text changed.
    const handleUpdate = useCallback(
        editorInstance => {
            if (!editorInstance) {
                return;
            }

            if (isSyncingRef.current) {
                isSyncingRef.current = false;
                return;
            }

            const nextText = editorInstance.getText();
            if (lastTextRef.current === nextText) {
                return;
            }

            lastTextRef.current = nextText;
            onChange(nextText);
        },
        [onChange]
    );

    // Hook editor = useEditor(...) initializes TipTap with StarterKit, the placeholder extension, and the issue highlight plugin.
    const editor = useEditor(() => {
        const initialText = content ?? "";
        const docContent =
            initialText.length === 0
                ? [{type: "paragraph"}]
                : initialText.split("\n").map(line => ({
                      type: "paragraph",
                      content: line.length ? [{type: "text", text: line}] : []
                  }));

        return {
            extensions: [
                StarterKit.configure({
                    hardBreak: false
                }),
                Placeholder.configure({
                    placeholder,
                    includeChildren: true
                })
            ],
            content: {
                type: "doc",
                content: docContent
            },
            onUpdate: ({editor: editorInstance}) => {
                handleUpdate(editorInstance);
            }
        };
    }, [handleUpdate, placeholder]);

    // Hook useEffect registers createIssueHighlightPlugin() once the editor instance exists.
    useEffect(() => {
        if (!editor) {
            return;
        }

        const plugin = createIssueHighlightPlugin();
        editor.registerPlugin(plugin);

        return () => {
            editor.unregisterPlugin(plugin.key);
        };
    }, [editor]);

    // Hook useEffect calls onReady(editor) once so the container can store the instance.
    useEffect(() => {
        if (!editor) {
            return;
        }

        onReady(editor);
    }, [editor, onReady]);

    // Hook useEffect keeps the TipTap document in sync with the content prop without re-triggering onChange.
    useEffect(() => {
        if (!editor) {
            return;
        }

        const nextText = content ?? "";
        if (editor.getText() === nextText) {
            return;
        }

        isSyncingRef.current = true;
        lastTextRef.current = nextText;

        const docContent =
            nextText.length === 0
                ? [{type: "paragraph"}]
                : nextText.split("\n").map(line => ({
                      type: "paragraph",
                      content: line.length ? [{type: "text", text: line}] : []
                  }));

        editor.commands.setContent(
            {
                type: "doc",
                content: docContent
            },
            false
        );
    }, [content, editor]);

    // Hook useEffect calls updateIssueHighlights({editor, offsets: highlightRanges}) whenever highlightRanges change.
    useEffect(() => {
        if (!editor) {
            return;
        }

        updateIssueHighlights({
            editor,
            offsets: highlightRanges
        });
    }, [editor, highlightRanges]);

    // Return block renders a Box wrapper and the <EditorContent> element with the proper classes and placeholder.
    return (
        <Box
            w="100%"
            maxW="960px"
            h="100%"
        >
            <EditorContent
                className="proofreader-editor"
                editor={editor}
            />
        </Box>
    );
}

// Default export exposes EditorPane for the container.
export default EditorPane;

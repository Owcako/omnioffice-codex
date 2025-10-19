import {Box} from "@chakra-ui/react";
import {useEffect, useMemo, useRef} from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import Document from "@tiptap/extension-document";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
    issueHighlightPluginKey,
    createIssueHighlightPlugin,
    updateIssueHighlights
} from "../utils/tiptapHighlights";

// Constant EditorDocument extends the base document so TipTap only allows block nodes.
const EditorDocument = Document.extend({
    content: "block+"
});

// EditorPane.jsx: Hosts the TipTap editor with placeholder, change relay, and highlight overlay.
function EditorPane({
    content,
    placeholder,
    onChange,
    highlightRanges,
    onReady
}) {
    // Function EditorPane receives content, placeholder, onChange, highlightRanges, and onReady props.
    // Ref isSyncingRef stores a boolean to stop sync loops during TipTap updates.
    const isSyncingRef = useRef(false);
    // Ref lastTextRef keeps the previous text value so duplicate updates can be ignored.
    const lastTextRef = useRef(content ?? "");

    // Function handleUpdate({editorInstance}) reads editorInstance.getText(), skips sync cycles, updates lastTextRef, and calls onChange when text changes.
    function handleUpdate({editorInstance}) {
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
        onChange({nextText});
    }

    // Constant initialDocContent turns the content prop into TipTap JSON paragraphs for the initial mount.
    const initialDocContent = useMemo(() => {
        const initialText = content ?? "";

        return initialText.length === 0
            ? [{type: "paragraph"}]
            : initialText.split("\n").map(line => ({
                  type: "paragraph",
                  content: line.length ? [{type: "text", text: line}] : []
              }));
    }, [content]);

    // Hook editor = useEditor(...) initializes TipTap with EditorDocument, StarterKit, the placeholder extension, and the issue highlight plugin with onUpdate calling handleUpdate.
    const editor = useEditor(
        {
            extensions: [
                EditorDocument,
                StarterKit.configure({
                    document: false,
                    hardBreak: false
                }),
                Placeholder.configure({
                    placeholder,
                    includeChildren: true
                })
            ],
            content: {
                type: "doc",
                content: initialDocContent
            },
            onUpdate: ({editor: editorInstance}) => {
                handleUpdate({editorInstance});
            }
        },
        [placeholder]
    );

    // Hook useEffect registers createIssueHighlightPlugin() once editor exists and cleans it up on unmount.
    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.unregisterPlugin(issueHighlightPluginKey);
        const plugin = createIssueHighlightPlugin();
        editor.registerPlugin(plugin);

        return () => {
            editor.unregisterPlugin(plugin.key);
        };
    }, [editor]);

    // Hook useEffect calls onReady({editor}) when the editor instance becomes available.
    useEffect(() => {
        if (!editor) {
            return;
        }

        onReady({editor});
    }, [editor, onReady]);

    // Hook useEffect keeps the TipTap document in sync with the content prop without re-triggering onChange by flipping isSyncingRef and lastTextRef.
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

    // Hook useEffect calls updateIssueHighlights({editor, offsets: highlightRanges}) whenever highlightRanges changes.
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

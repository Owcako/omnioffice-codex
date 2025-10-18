import {Plugin, PluginKey} from "@tiptap/pm/state";
import {Decoration, DecorationSet} from "@tiptap/pm/view";

// Constant issueHighlightPluginKey stores the plugin key so updates can target the highlight plugin.
export const issueHighlightPluginKey = new PluginKey("issue-highlight");

// Function createIssueHighlightPlugin() builds a ProseMirror plugin that keeps issue underline decorations in state.
export function createIssueHighlightPlugin() {
    return new Plugin({
        key: issueHighlightPluginKey,
        state: {
            init() {
                return DecorationSet.empty;
            },
            apply(tr, old) {
                const meta = tr.getMeta(issueHighlightPluginKey);

                if (meta && Array.isArray(meta.ranges)) {
                    const decorations = meta.ranges.map(range =>
                        Decoration.inline(range.from, range.to, {
                            class: "proofread-highlight"
                        })
                    );

                    return DecorationSet.create(tr.doc, decorations);
                }

                if (tr.docChanged) {
                    return old.map(tr.mapping, tr.doc);
                }

                return old;
            }
        },
        props: {
            decorations(state) {
                return issueHighlightPluginKey.getState(state);
            }
        }
    });
}

// Function offsetsToDocRanges({doc, offsets}) converts plain text offsets into ProseMirror positions.
export function offsetsToDocRanges({doc, offsets}) {
    if (!offsets || offsets.length === 0) {
        return [];
    }

    const ranges = [];
    let textOffset = 0;

    doc.forEach((blockNode, blockOffset, blockIndex) => {
        blockNode.descendants((node, nodeOffset) => {
            if (!node.isText) {
                return true;
            }

            const nodeText = node.text ?? "";
            const nodeStart = textOffset;
            const nodeEnd = nodeStart + nodeText.length;

            offsets.forEach(offset => {
                const {start, end} = offset;

                if (end <= nodeStart || start >= nodeEnd) {
                    return;
                }

                const fromOffset = Math.max(start, nodeStart);
                const toOffset = Math.min(end, nodeEnd);
                const from =
                    blockOffset + nodeOffset + 1 + (fromOffset - nodeStart);
                const to =
                    blockOffset + nodeOffset + 1 + (toOffset - nodeStart);

                ranges.push({from, to});
            });

            textOffset += nodeText.length;

            return true;
        });

        if (blockIndex < doc.childCount - 1) {
            textOffset += 1;
        }
    });

    return ranges;
}

// Function updateIssueHighlights({editor, offsets}) maps offsets to doc ranges and dispatches the plugin meta to redraw the decorations.
export function updateIssueHighlights({editor, offsets}) {
    if (!editor) {
        return;
    }

    const {state, view} = editor;
    const decorationRanges = offsetsToDocRanges({
        doc: state.doc,
        offsets
    }).map(range => ({
        from: range.from,
        to: range.to
    }));

    const transaction = state.tr.setMeta(issueHighlightPluginKey, {
        ranges: decorationRanges
    });
    view.dispatch(transaction);
}

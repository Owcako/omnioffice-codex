// outlinePositions.js: Provides DOM helpers to map outline segments to overlay markers.

// Function findParagraphRect({rootElement, paragraphText}) walks text nodes, finds the first case-insensitive match, and returns the bounding rect.
export function findParagraphRect({rootElement, paragraphText}) {
    if (!rootElement || !paragraphText) {
        return null;
    }

    const target = paragraphText.toLowerCase();
    const walker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        null
    );

    let node = walker.nextNode();
    while (node) {
        const textContent = node.textContent ?? "";
        const lower = textContent.toLowerCase();
        const index = lower.indexOf(target);

        if (index !== -1) {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + target.length);

            const rect = range.getBoundingClientRect();
            if (typeof range.detach === "function") {
                range.detach();
            }

            if (rect && rect.height > 0) {
                return rect;
            }
        }

        node = walker.nextNode();
    }

    return null;
}

// Function mapSegmentsToMarkers({rootElement, segments}) calls findParagraphRect for each segment and returns an array with structure, top, and height.
export function mapSegmentsToMarkers({rootElement, segments}) {
    if (!rootElement || !Array.isArray(segments)) {
        return [];
    }

    return segments
        .map(segment => {
            const rect = findParagraphRect({
                rootElement,
                paragraphText: segment.paragraph
            });

            if (!rect) {
                return null;
            }

            return {
                structure: segment.structure,
                top: rect.top,
                height: rect.height
            };
        })
        .filter(Boolean);
}

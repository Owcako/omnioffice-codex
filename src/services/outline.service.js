// outline.service.js: Calls the backend outline endpoint and normalizes data.
// Function requestOutline({essayText, outlineGoal}) POSTs to /api/outline, checks response.ok, parses JSON, maps objects to {paragraph, structure}, and throws on invalid payloads.
export async function requestOutline({essayText, outlineGoal}) {
    const response = await fetch("/api/outline", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            essayText,
            outlineGoal
        })
    });

    if (!response.ok) {
        throw new Error("Outline request failed");
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
        throw new Error("Invalid outline payload");
    }

    return payload
        .map(item => {
            const paragraph =
                typeof item.Paragraph === "string" ? item.Paragraph : "";
            const structure =
                typeof item.Structure === "string" ? item.Structure : "";

            return {
                paragraph,
                structure
            };
        })
        .filter(item => item.paragraph && item.structure);
}

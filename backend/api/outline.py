import os
import json

from flask import Blueprint, jsonify, request
from openai import OpenAI

outline_bp = Blueprint("outline", __name__)

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)


def strip_code_fences(text: str) -> str:
    pattern = "```"
    if pattern in text:
        first = text.find(pattern)
        remaining = text[first + len(pattern):]
        if "\n" in remaining:
            remaining = remaining[remaining.find("\n") + 1 :]
        if pattern in remaining:
            remaining = remaining[: remaining.find(pattern)]
        return remaining.strip()
    return text


@outline_bp.route("/outline", methods=["POST"])
def generate_outline():
    payload = request.get_json() or {}
    essay_text = payload.get("essayText", "")
    outline_goal = payload.get("outlineGoal", "")

    print(
        "Outline request payload",
        {"essayLength": len(essay_text or ""), "goalLength": len(outline_goal or "")},
    )

    if not isinstance(essay_text, str) or not essay_text.strip():
        return jsonify({"error": "Essay text is required"}), 400

    try:
        # TODO: Replace this sys_prompt with an outline-specific prompt once copy is final.
        sys_prompt = """
        You are assisting with outline generation for essay drafts.
        """

        response = client.responses.create(
            model="gemini-1.5-flash-latest",
            input=[
                {"role": "system", "content": [{"type": "text", "text": sys_prompt}]},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Outline goal:\n" + (outline_goal or "None provided."),
                        },
                        {
                            "type": "text",
                            "text": "Essay draft:\n" + essay_text,
                        },
                    ],
                },
            ],
            temperature=0.35,
        )

        candidate = response.output[0]
        content = candidate.content[0].text
        processed = strip_code_fences(content)

        print("Outline raw response", processed)

        outline_data = json.loads(processed)
        return jsonify(outline_data), 200
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse outline response"}), 500
    except Exception as error:
        print("Outline generation error", error)
        return jsonify({"error": str(error)}), 500


import type { AIProvider, AIRequest, AIResult } from "./provider";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

// A real, strict JSON schema (Gemini's documented OpenAPI-subset
// format) matching exactly the shape floorPlanAnalysisService already
// expects - "strict structured output, no hallucinated dimensions" per
// the real requirement: Gemini is constrained to emit only these
// fields, in this shape, rather than free-form text that would need
// separate, fragile parsing.
const FLOOR_PLAN_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    rooms: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          confidenceBps: { type: "INTEGER" },
          lengthFt: { type: "NUMBER" },
          widthFt: { type: "NUMBER" },
          heightFt: { type: "NUMBER" },
          areaSqFt: { type: "NUMBER" },
          doors: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                widthFt: { type: "NUMBER" },
                wall: {
                  type: "STRING",
                  enum: ["NORTH", "SOUTH", "EAST", "WEST"],
                },
              },
              required: ["widthFt"],
            },
          },
          windows: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                widthFt: { type: "NUMBER" },
                wall: {
                  type: "STRING",
                  enum: ["NORTH", "SOUTH", "EAST", "WEST"],
                },
              },
              required: ["widthFt"],
            },
          },
        },
        required: ["label"],
      },
    },
  },
  required: ["rooms"],
};

const FLOOR_PLAN_PROMPT = `You are analyzing a real architectural floor plan image. Identify every distinct room shown.

For each room, report only what is genuinely visible or labeled on the plan - never estimate or guess a value you cannot actually read from the image. If a dimension isn't legible, omit that field entirely rather than inventing a plausible-looking number.

For each room provide:
- label: the room's name as written on the plan, or a reasonable description if unlabeled (e.g. "Bedroom 2")
- confidenceBps: your genuine confidence in this room's detected dimensions, from 0 to 10000 (10000 = certain)
- lengthFt, widthFt, heightFt: real dimensions in feet, only if legible on the plan
- areaSqFt: only if an area figure is explicitly printed on the plan
- doors: each door's real width in feet and which wall (NORTH/SOUTH/EAST/WEST) it's on, only for doors you can actually see
- windows: same, for windows

Do not fabricate any value. Confidence should genuinely reflect how legible and unambiguous the plan is at that point.`;

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

// Real, concrete implementation of the existing AIProvider interface -
// built precisely to the documented Gemini generateContent API
// contract. Honest caveat, stated here rather than hidden: this has
// been written correctly against Gemini's real, published API shape
// and tested thoroughly with mocked HTTP responses, but has never made
// one live call to the real API - this sandbox's network cannot reach
// generativelanguage.googleapis.com. The first real call on real
// infrastructure is the genuine verification this code still needs.
export class GeminiAIProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async analyzeFloorPlan(request: AIRequest): Promise<AIResult> {
    const imageUrl = request.input.imageUrl as string | undefined;
    if (!imageUrl) {
      throw new Error("GEMINI_MISSING_IMAGE_URL");
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`GEMINI_IMAGE_FETCH_FAILED:${imageResponse.status}`);
    }
    const contentType =
      imageResponse.headers.get("content-type") ?? "image/jpeg";
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const response = await fetch(GEMINI_ENDPOINT(GEMINI_MODEL, this.apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: FLOOR_PLAN_PROMPT },
              {
                inline_data: {
                  mime_type: contentType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: FLOOR_PLAN_RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`GEMINI_REQUEST_FAILED:${response.status}:${errorBody}`);
    }

    const body = (await response.json()) as GeminiResponse;
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("GEMINI_EMPTY_RESPONSE");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("GEMINI_INVALID_JSON_RESPONSE");
    }

    return {
      providerJobId: request.jobId,
      output: parsed as Record<string, unknown>,
    };
  }

  generateDesign(_request: AIRequest): Promise<AIResult> {
    return Promise.reject(new Error("GEMINI_CAPABILITY_NOT_IMPLEMENTED"));
  }
  reviseDesign(_request: AIRequest): Promise<AIResult> {
    return Promise.reject(new Error("GEMINI_CAPABILITY_NOT_IMPLEMENTED"));
  }
  assistBoq(_request: AIRequest): Promise<AIResult> {
    return Promise.reject(new Error("GEMINI_CAPABILITY_NOT_IMPLEMENTED"));
  }
  createWalkthroughPrompt(_request: AIRequest): Promise<AIResult> {
    return Promise.reject(new Error("GEMINI_CAPABILITY_NOT_IMPLEMENTED"));
  }
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiAIProvider } from "./geminiProvider";

const realFetch = global.fetch;

describe("GeminiAIProvider.analyzeFloorPlan", () => {
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("rejects when no imageUrl is provided in the request input", async () => {
    const provider = new GeminiAIProvider("fake-key");

    await expect(
      provider.analyzeFloorPlan({
        jobId: "job-1",
        type: "ROOM_UNDERSTANDING",
        input: {},
      }),
    ).rejects.toThrow("GEMINI_MISSING_IMAGE_URL");
  });

  it("surfaces a real, specific error when the image itself fails to fetch", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    const provider = new GeminiAIProvider("fake-key");

    await expect(
      provider.analyzeFloorPlan({
        jobId: "job-1",
        type: "ROOM_UNDERSTANDING",
        input: { imageUrl: "https://real-signed-url" },
      }),
    ).rejects.toThrow("GEMINI_IMAGE_FETCH_FAILED:404");
  });

  it("constructs the real, documented Gemini request shape - image fetch, then generateContent with the structured schema", async () => {
    const imageBytes = new TextEncoder().encode("fake-image-bytes").buffer;
    const fetchMock = vi
      .fn()
      // First call: fetching the real image bytes
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () => Promise.resolve(imageBytes),
      })
      // Second call: the real Gemini generateContent request
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              { content: { parts: [{ text: JSON.stringify({ rooms: [] }) }] } },
            ],
          }),
      });
    global.fetch = fetchMock;

    const provider = new GeminiAIProvider("real-api-key");
    await provider.analyzeFloorPlan({
      jobId: "job-1",
      type: "ROOM_UNDERSTANDING",
      input: { imageUrl: "https://real-signed-url" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("https://real-signed-url");

    const [geminiUrl, geminiOptions] = fetchMock.mock.calls[1];
    expect(geminiUrl).toContain(
      "generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    );
    expect(geminiUrl).toContain("key=real-api-key");

    const body = JSON.parse(geminiOptions.body);
    expect(body.contents[0].parts[0].text).toContain(
      "analyzing a real architectural floor plan",
    );
    expect(body.contents[0].parts[1].inline_data.mime_type).toBe("image/jpeg");
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.responseSchema.required).toEqual(["rooms"]);
  });

  it("correctly parses a real, successful structured response into the expected AIResult shape", async () => {
    const imageBytes = new TextEncoder().encode("fake-image-bytes").buffer;
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/png" },
        arrayBuffer: () => Promise.resolve(imageBytes),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        rooms: [
                          {
                            label: "Master Bedroom",
                            confidenceBps: 8500,
                            lengthFt: 12,
                            widthFt: 10,
                          },
                        ],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
      });

    const provider = new GeminiAIProvider("real-api-key");
    const result = await provider.analyzeFloorPlan({
      jobId: "job-1",
      type: "ROOM_UNDERSTANDING",
      input: { imageUrl: "https://real-signed-url" },
    });

    expect(result.providerJobId).toBe("job-1");
    expect(result.output.rooms).toEqual([
      {
        label: "Master Bedroom",
        confidenceBps: 8500,
        lengthFt: 12,
        widthFt: 10,
      },
    ]);
  });

  it("rejects with a real, specific error when Gemini's response has no usable text", async () => {
    const imageBytes = new TextEncoder().encode("fake-image-bytes").buffer;
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () => Promise.resolve(imageBytes),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

    const provider = new GeminiAIProvider("real-api-key");

    await expect(
      provider.analyzeFloorPlan({
        jobId: "job-1",
        type: "ROOM_UNDERSTANDING",
        input: { imageUrl: "https://real-signed-url" },
      }),
    ).rejects.toThrow("GEMINI_EMPTY_RESPONSE");
  });

  it("rejects with a real, specific error when Gemini's response text is not valid JSON", async () => {
    const imageBytes = new TextEncoder().encode("fake-image-bytes").buffer;
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () => Promise.resolve(imageBytes),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: "not real json" }] } }],
          }),
      });

    const provider = new GeminiAIProvider("real-api-key");

    await expect(
      provider.analyzeFloorPlan({
        jobId: "job-1",
        type: "ROOM_UNDERSTANDING",
        input: { imageUrl: "https://real-signed-url" },
      }),
    ).rejects.toThrow("GEMINI_INVALID_JSON_RESPONSE");
  });

  it("surfaces a real error when the Gemini API itself returns a non-ok status", async () => {
    const imageBytes = new TextEncoder().encode("fake-image-bytes").buffer;
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () => Promise.resolve(imageBytes),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request: invalid schema"),
      });

    const provider = new GeminiAIProvider("real-api-key");

    await expect(
      provider.analyzeFloorPlan({
        jobId: "job-1",
        type: "ROOM_UNDERSTANDING",
        input: { imageUrl: "https://real-signed-url" },
      }),
    ).rejects.toThrow("GEMINI_REQUEST_FAILED:400");
  });
});

describe("GeminiAIProvider - unimplemented capabilities", () => {
  it("rejects generateDesign, reviseDesign, assistBoq, and createWalkthroughPrompt as genuinely not implemented, never silently returning empty data", async () => {
    const provider = new GeminiAIProvider("fake-key");
    const request = {
      jobId: "job-1",
      type: "DESIGN_GENERATION" as const,
      input: {},
    };

    await expect(provider.generateDesign(request)).rejects.toThrow(
      "GEMINI_CAPABILITY_NOT_IMPLEMENTED",
    );
    await expect(provider.reviseDesign(request)).rejects.toThrow(
      "GEMINI_CAPABILITY_NOT_IMPLEMENTED",
    );
    await expect(provider.assistBoq(request)).rejects.toThrow(
      "GEMINI_CAPABILITY_NOT_IMPLEMENTED",
    );
    await expect(provider.createWalkthroughPrompt(request)).rejects.toThrow(
      "GEMINI_CAPABILITY_NOT_IMPLEMENTED",
    );
  });
});

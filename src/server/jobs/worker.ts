import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { getAIProvider, type AIRequest } from "@/server/ai/provider";
import { transitionJob } from "./jobService";
import { NivasaJobQueue } from "./queue";

type WorkerPayload = Record<string, unknown>;

function providerMethod(type: string) {
  switch (type) {
    case "ROOM_UNDERSTANDING":
      return "analyzeFloorPlan" as const;
    case "DESIGN_GENERATION":
      return "generateDesign" as const;
    case "DESIGN_REVISION":
      return "reviseDesign" as const;
    case "BOQ_GENERATION":
      return "assistBoq" as const;
    case "WALKTHROUGH":
      return "createWalkthroughPrompt" as const;
    default:
      return null;
  }
}

export function createNivasaWorker() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_NOT_CONFIGURED");
  return new Worker(
    NivasaJobQueue,
    async (job: Job<WorkerPayload>) => {
      const method = providerMethod(job.name);
      if (!method) throw new Error(`UNSUPPORTED_JOB_TYPE:${job.name}`);
      await transitionJob({ jobId: String(job.id), status: "RUNNING" });
      try {
        const provider = getAIProvider();
        const request: AIRequest = {
          jobId: String(job.id),
          type:
            method === "assistBoq"
              ? "BOQ_ASSISTANCE"
              : method === "createWalkthroughPrompt"
                ? "WALKTHROUGH_PROMPT"
                : (job.name as AIRequest["type"]),
          input: job.data,
        };
        const result = await provider[method](request);
        await transitionJob({
          jobId: String(job.id),
          status: "SUCCEEDED",
          provider: process.env.AI_PROVIDER,
          providerJobId: result.providerJobId,
          output: result.output,
        });
        return result.output;
      } catch (error) {
        await transitionJob({
          jobId: String(job.id),
          status: "FAILED",
          errorCode: "PROVIDER_ERROR",
          errorMessage:
            error instanceof Error ? error.message : "Provider failed",
        });
        throw error;
      }
    },
    {
      connection: new IORedis(url, { maxRetriesPerRequest: null }),
      concurrency: Number(process.env.JOB_CONCURRENCY ?? 4),
    },
  );
}

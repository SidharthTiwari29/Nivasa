import type { AIJobInput } from '@/server/ai/provider';

export type QueuedAIJob = AIJobInput & { status: 'QUEUED'; createdAt: Date };
export function createQueuedAIJob(input: AIJobInput): QueuedAIJob {
  return { ...input, status: 'QUEUED', createdAt: new Date() };
}

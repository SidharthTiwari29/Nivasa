export type JobLifecycle = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

const allowed: Record<JobLifecycle, readonly JobLifecycle[]> = {
  QUEUED: ['RUNNING', 'CANCELLED'],
  RUNNING: ['SUCCEEDED', 'FAILED', 'CANCELLED'],
  SUCCEEDED: [],
  FAILED: ['QUEUED', 'CANCELLED'],
  CANCELLED: [],
};

export function canTransition(from: JobLifecycle, to: JobLifecycle): boolean {
  return allowed[from].includes(to);
}

export function assertTransition(from: JobLifecycle, to: JobLifecycle): void {
  if (!canTransition(from, to)) {
    throw new Error(`INVALID_JOB_TRANSITION:${from}->${to}`);
  }
}

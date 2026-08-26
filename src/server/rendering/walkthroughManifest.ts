export interface WalkthroughRoom {
  roomId: string;
  sequence: number;
  entryPoint: { x: number; y: number; z: number };
}

export interface WalkthroughManifest {
  designProjectId: string;
  mode: "FREE_ROAM";
  rooms: readonly WalkthroughRoom[];
  includeNookAndCornerCoverage: boolean;
}

export function createWalkthroughManifest(
  designProjectId: string,
  rooms: readonly WalkthroughRoom[],
): WalkthroughManifest {
  if (!designProjectId.trim()) throw new Error("design project is required");
  if (!rooms.length) throw new Error("walkthrough requires at least one room");
  const sorted = [...rooms].sort((a, b) => a.sequence - b.sequence);
  const sequences = sorted.map((room) => room.sequence);
  if (
    new Set(sequences).size !== sequences.length ||
    sequences.some((value) => !Number.isInteger(value) || value < 0)
  ) {
    throw new Error("room sequence must be unique non-negative integers");
  }
  return {
    designProjectId,
    mode: "FREE_ROAM",
    rooms: sorted,
    includeNookAndCornerCoverage: true,
  };
}

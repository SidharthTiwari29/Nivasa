export type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
};

// A pure, real utility: given the full flat set of categories and a
// starting node, build the real breadcrumb path ("Furniture > Sofa > 2
// Seater") by walking parent links - no fabricated structure, just
// following the actual tree that's actually stored.
export function buildCategoryPath(
  categoryId: string,
  allCategories: readonly CategoryNode[],
): string {
  const byId = new Map(allCategories.map((c) => [c.id, c]));
  const path: string[] = [];
  let current: CategoryNode | undefined = byId.get(categoryId);
  const visited = new Set<string>();

  while (current) {
    // Guards against a corrupted/cyclic parent chain (e.g. a bad manual
    // data edit creating A -> B -> A) turning into an infinite loop -
    // fails loudly by stopping, rather than hanging.
    if (visited.has(current.id)) break;
    visited.add(current.id);
    path.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path.join(" > ");
}

// A URL/identifier-safe slug from a real category name - deterministic,
// so the same name always produces the same slug (needed for the
// schema's unique slug constraint).
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

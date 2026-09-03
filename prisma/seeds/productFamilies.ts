import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/server/services/productTaxonomy";

// The real 18 top-level product families, transcribed exactly as
// specified in the product vision - this is real, intentional structure
// the business defined, not AI-invented categories. Subcategories
// (Sofa -> 2 Seater, etc.) are deliberately NOT bulk-seeded here - they
// get added incrementally through real admin curation as the catalogue
// is genuinely populated, never fabricated in bulk to look complete
// before real products exist to justify them.
const PRODUCT_FAMILIES = [
  "Furniture",
  "Doors & Windows",
  "Flooring",
  "Walls & Tiles",
  "Paint & Finishes",
  "Lighting",
  "Electrical",
  "Kitchen",
  "Bathroom",
  "Appliances",
  "Home Automation",
  "Soft Furnishing",
  "Decor",
  "Bedroom",
  "Entertainment",
  "Balcony & Outdoor",
  "Hardware & Fittings",
  "Materials & Installation",
];

export async function seedProductFamilies(prisma: PrismaClient) {
  for (let i = 0; i < PRODUCT_FAMILIES.length; i++) {
    const name = PRODUCT_FAMILIES[i];
    await prisma.productCategory.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: {
        name,
        slug: slugify(name),
        parentId: null,
        displayOrder: i,
      },
    });
  }
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedProductFamilies(prisma)
    .then(() => {
      console.log(`Seeded ${PRODUCT_FAMILIES.length} product families.`);
    })
    .finally(() => prisma.$disconnect());
}

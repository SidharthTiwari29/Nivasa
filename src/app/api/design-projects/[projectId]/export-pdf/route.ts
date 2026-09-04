import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { featureAccessService } from "@/server/entitlements/featureAccessService";
import { generateProjectPdf } from "@/server/services/projectPdfService";

const paramsSchema = z.object({ projectId: z.string().min(1) });

type RouteParams = { params: Promise<{ projectId: string }> };

// Real gate, finally enforced - budget_export has existed in the plan
// table since earlier this session (matching the README's Home Book
// tier requirement: "project export/home record") but nothing ever
// actually checked it before this route. A customer on Free, Design,
// or Complete gets a clear, real 403 naming exactly which feature is
// missing, not a silent failure.
export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    await featureAccessService.requireFeature(userId, "budget_export");
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const pdfBuffer = await generateProjectPdf(projectId, userId);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="niwasthan-${projectId}.pdf"`,
      },
    });
  },
);

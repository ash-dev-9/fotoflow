export const dynamic = "force-dynamic";

import { NotFoundError, errorToResponse } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id: guestId } = await params;
    
    // Find matches for this guest
    const matches = await prisma.match.findMany({
      where: { guestId },
      include: {
        photo: {
          select: {
            id: true,
            filename: true,
            filePath: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });

    if (!matches) {
      return Response.json({ photos: [] });
    }

    const photos = matches.map((m) => ({
      ...m.photo,
      matchScore: m.score,
    }));

    return Response.json({ 
      guestId,
      photoCount: photos.length,
      photos 
    });
  } catch (error) {
    return errorToResponse(error);
  }
}

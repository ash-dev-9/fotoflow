export const dynamic = "force-dynamic";

import { NotFoundError, errorToResponse } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        date: true,
        userId: true,
      },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    // Fetch studio branding for the event owner
    let studio = null;
    try {
      studio = await prisma.studio.findUnique({
        where: { userId: event.userId },
        select: {
          name: true,
          logoUrl: true,
          primaryColor: true,
        },
      });
    } catch (e) {
      // Studio not configured yet, that's fine
    }

    return Response.json({
      id: event.id,
      name: event.name,
      date: event.date,
      studio,
    });
  } catch (error) {
    return errorToResponse(error);
  }
}


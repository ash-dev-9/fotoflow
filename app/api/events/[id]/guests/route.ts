export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Verify event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return Response.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.userId !== userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get guests for event
    const guests = await prisma.guest.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        selfiePath: true,
        status: true,
        createdAt: true,
        _count: {
          select: { matches: true }
        }
      },
    });

    return Response.json({
      eventId,
      guestCount: guests.length,
      guests,
    });
  } catch (error) {
    console.error("Fetch guests error:", error);
    return Response.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

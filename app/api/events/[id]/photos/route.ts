import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Get photos for event
    const photos = await prisma.photo.findMany({
      where: { eventId },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        filename: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
      },
    });

    return Response.json({
      eventId,
      photoCount: photos.length,
      photos,
    });
  } catch (error) {
    console.error("Fetch photos error:", error);
    return Response.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Delete all photos for this event
    const deleteResult = await prisma.photo.deleteMany({
      where: { eventId },
    });

    return Response.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Delete photos error:", error);
    return Response.json(
      { error: "Failed to delete photos" },
      { status: 500 }
    );
  }
}

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/file-storage";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: photoId } = await params;

    // Find photo and verify ownership
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return Response.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    if (photo.userId !== userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete photo file
    await deleteFile(photo.filePath);

    // Delete photo record
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return Response.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    return Response.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

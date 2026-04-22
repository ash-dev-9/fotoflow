import { prisma } from "@/lib/prisma";
import { NotFoundError, errorToResponse } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        date: true,
      },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    return Response.json(event);
  } catch (error) {
    return errorToResponse(error);
  }
}

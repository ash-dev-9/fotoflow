import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/file-storage";
import {
  NotFoundError,
  ValidationError,
  errorToResponse,
} from "@/lib/errors";
import { 
  extractFaceDescriptor, 
  compareDescriptors, 
  FACE_MATCH_THRESHOLD 
} from "@/lib/ai/face-recognition";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    // Parse form data
    const formData = await request.formData();
    const selfie = formData.get("selfie") as File;

    if (!selfie) {
      throw new ValidationError("Selfie is required");
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    // Save selfie to disk
    const { path } = await saveFile(selfie, `events/${eventId}/guests`);

    // Create guest record
    const guest = await prisma.guest.create({
      data: {
        eventId,
        selfiePath: path,
        status: "pending",
      },
    });

    // --- AI MAGIC START ---
    try {
      const guestDescriptor = await extractFaceDescriptor(path);
      
      if (guestDescriptor) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: { 
            faceDescriptor: JSON.stringify(Array.from(guestDescriptor)),
            status: "ready"
          },
        });

        // Fetch all photos of the event that have a face descriptor
        const eventPhotos = await prisma.photo.findMany({
          where: { 
            eventId, 
            faceDescriptor: { not: null },
            isReference: false 
          },
        });

        const matches = [];
        for (const photo of eventPhotos) {
          const photoDescriptor = new Float32Array(JSON.parse(photo.faceDescriptor!));
          const score = compareDescriptors(guestDescriptor, photoDescriptor);
          
          // Match if distance < threshold (score > 1 - threshold)
          if (score >= (1 - FACE_MATCH_THRESHOLD)) {
            matches.push({
              guestId: guest.id,
              photoId: photo.id,
              score
            });
          }
        }

        // Create matches individually (SQLite doesn't support createMany skipDuplicates)
        if (matches.length > 0) {
          for (const match of matches) {
            try {
              await prisma.match.create({ data: match });
            } catch {
              // Skip duplicates
            }
          }
        }

        console.log(`AI: Found ${matches.length} matches for guest ${guest.id}`);
      }
    } catch (aiError) {
      console.error("AI matching failed:", aiError);
      // We don't fail the request if AI fails, but we log it
    }
    // --- AI MAGIC END ---

    return Response.json({
      success: true,
      guestId: guest.id,
      message: "Selfie uploaded successfully. We are looking for your photos!",
    });
  } catch (error) {
    return errorToResponse(error);
  }
}

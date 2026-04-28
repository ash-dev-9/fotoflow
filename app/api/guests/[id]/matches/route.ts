import { auth } from "@clerk/nextjs/server";
import { NotFoundError, ValidationError, ServerError, errorToResponse } from "@/lib/errors";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id: guestId } = await params;

    // 1. Get guest details
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { id: true, eventId: true, faceDescriptor: true }
    });

    if (!guest) {
      throw new NotFoundError("Guest not found");
    }

    if (!guest.faceDescriptor) {
      throw new ValidationError("Guest has no face descriptor. Please retake your selfie.");
    }

    const guestDescriptor = JSON.parse(guest.faceDescriptor) as number[];

    // 2. Find photos that haven't been matched with this guest yet
    // We get all photos of the event that have descriptors
    const unmatchedPhotos = await prisma.photo.findMany({
      where: {
        eventId: guest.eventId,
        faceDescriptor: { not: null },
        matches: {
          none: { guestId }
        }
      }
    });

    if (unmatchedPhotos.length > 0) {
      const { compareDescriptors, FACE_MATCH_THRESHOLD } = await import("@/lib/ai/face-recognition");
      
      const newMatches = [];
      for (const photo of unmatchedPhotos) {
        try {
          const photoDescriptor = JSON.parse(photo.faceDescriptor!) as number[];
          const score = compareDescriptors(guestDescriptor, photoDescriptor);
          
          if (score >= (1 - FACE_MATCH_THRESHOLD)) {
            newMatches.push({
              guestId,
              photoId: photo.id,
              score
            });
          }
        } catch (e) {
          console.error(`Error parsing descriptor for photo ${photo.id}:`, e);
        }
      }

      // 3. Batch create new matches
      if (newMatches.length > 0) {
        await prisma.match.createMany({
          data: newMatches,
          skipDuplicates: true
        });

        // 4. Send Notification
        const { sendNotification } = await import("@/lib/notifications");
        const firstPhoto = unmatchedPhotos[0]; // Just take the first one for the preview
        
        await sendNotification(guestId, {
          title: "Nouvelles photos trouvées ! 📸",
          body: `Nous avons trouvé ${newMatches.length} nouvelle(s) photo(s) de vous à cet événement.`,
          url: `/e/${guest.eventId}`,
          photoUrl: firstPhoto.filePath
        });
      }
    }

    // 4. Return all matches (including new ones)
    const allMatches = await prisma.match.findMany({
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

    const photos = allMatches.map((m) => ({
      ...m.photo,
      matchScore: m.score,
    }));

    return Response.json({ 
      guestId,
      photoCount: photos.length,
      photos,
      newMatchesCount: unmatchedPhotos.length > 0 ? photos.length : 0 // Simplified for UX
    });

  } catch (error) {
    return errorToResponse(error);
  }
}

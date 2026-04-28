export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import {
  NotFoundError,
  ValidationError,
  errorToResponse,
} from "@/lib/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { supabaseAdmin } = await import("@/lib/supabase");

    const { id: eventId } = await params;
    
    // Parse form data
    const formData = await request.formData();
    const selfie = formData.get("selfie") as File;
    const email = formData.get("email") as string | null;

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

    // Save selfie to Supabase
    const buffer = Buffer.from(await selfie.arrayBuffer());
    const fileExt = selfie.name.split('.').pop() || 'jpg';
    const fileName = `guest-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `events/${eventId}/guests/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('photos')
      .upload(filePath, buffer, {
        contentType: selfie.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('photos')
      .getPublicUrl(filePath);

    // Create guest record
    const guest = await prisma.guest.create({
      data: {
        eventId,
        email,
        selfiePath: publicUrl,
        status: "pending",
      },
    });


    // --- AI MAGIC START ---
    try {
      const faceDescriptorStr = formData.get("faceDescriptor") as string | null;
      
      if (faceDescriptorStr) {
        const guestDescriptor = JSON.parse(faceDescriptorStr) as number[];
        
        await prisma.guest.update({
          where: { id: guest.id },
          data: { 
            faceDescriptor: faceDescriptorStr,
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

        const { compareDescriptors, FACE_MATCH_THRESHOLD } = await import("@/lib/ai/face-recognition");

        const matches = [];
        for (const photo of eventPhotos) {
          const photoDescriptor = JSON.parse(photo.faceDescriptor!) as number[];
          const score = compareDescriptors(guestDescriptor, photoDescriptor);
          
          if (score >= (1 - FACE_MATCH_THRESHOLD)) {
            matches.push({
              guestId: guest.id,
              photoId: photo.id,
              score
            });
          }
        }

        // Batch create matches
        if (matches.length > 0) {
          await prisma.match.createMany({
            data: matches,
            skipDuplicates: true
          });
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


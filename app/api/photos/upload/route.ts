export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ServerError,
  errorToResponse,
} from "@/lib/errors";
import { validateFile } from "@/lib/validation";

const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 100;

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { supabaseAdmin } = await import("@/lib/supabase");

    const { userId } = await auth();
    if (!userId) {
      throw new UnauthorizedError("You must be logged in to upload photos");
    }

    // Parse form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      throw new ValidationError("Invalid form data");
    }

    const files = formData.getAll("files") as File[];
    const eventId = formData.get("eventId") as string;

    // Validate event ID
    if (!eventId || typeof eventId !== "string") {
      throw new ValidationError("Event ID is required");
    }

    if (!eventId.match(/^[a-z0-9_-]+$/i)) {
      throw new ValidationError("Invalid event ID format");
    }

    // Validate files array
    if (!files || files.length === 0) {
      throw new ValidationError("No files provided", {
        files: "At least one file is required",
      });
    }

    if (files.length > MAX_FILES) {
      throw new ValidationError(`Maximum ${MAX_FILES} files allowed per upload`, {
        files: `Too many files (${files.length})`,
      });
    }

    // Verify event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, userId: true, status: true },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (event.userId !== userId) {
      throw new ForbiddenError("You do not have permission to upload photos to this event");
    }

    // Upload each file
    const uploadedPhotos = [];
    const uploadErrors = [];

    // Pre-parse face descriptors once (instead of inside the loop)
    let descriptorsArray: any[] | null = null;
    try {
      const descriptorsStr = formData.get("faceDescriptors") as string | null;
      if (descriptorsStr) {
        descriptorsArray = JSON.parse(descriptorsStr);
      }
    } catch (parseErr) {
      console.error("Failed to parse faceDescriptors:", parseErr);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Skip empty files
      if (!file || file.size === 0) {
        uploadErrors.push({
          filename: file?.name || `file_${i}`,
          error: "File is empty",
        });
        continue;
      }

      // Validate file
      const fileValidationError = validateFile(file, {
        maxSize: MAX_FILE_SIZE,
        allowedMimeTypes: VALID_IMAGE_TYPES,
      });

      if (fileValidationError) {
        uploadErrors.push({
          filename: file.name,
          error: fileValidationError,
        });
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `events/${eventId}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('photos')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('photos')
          .getPublicUrl(filePath);

        // Create photo record in database
        const descriptor = descriptorsArray?.[i] ?? null;
        const photo = await prisma.photo.create({
          data: {
            eventId,
            userId,
            filename: file.name,
            filePath: publicUrl,
            fileSize: file.size,
            mimeType: file.type,
            metadata: "{}",
            ...(descriptor ? { faceDescriptor: JSON.stringify(descriptor) } : {}),
          },
          select: {
            id: true,
            filename: true,
            filePath: true,
            fileSize: true,
            uploadedAt: true,
          },
        });

        uploadedPhotos.push(photo);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save photo";
        uploadErrors.push({
          filename: file.name,
          error: errorMessage,
        });
      }
    }

    // Check if any files were successfully uploaded
    if (uploadedPhotos.length === 0 && uploadErrors.length > 0) {
      throw new ValidationError("No files were successfully uploaded", {
        files: uploadErrors.map((e) => e.error).join(", "),
      });
    }

    return Response.json(
      {
        success: true,
        uploadedCount: uploadedPhotos.length,
        failedCount: uploadErrors.length,
        uploaded: uploadedPhotos,
        ...(uploadErrors.length > 0 && { errors: uploadErrors }),
      },
      { status: 200 }
    );
  } catch (error) {
    return errorToResponse(error);
  }
}


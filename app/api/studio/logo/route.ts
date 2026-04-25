import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use PNG, JPG, WebP or SVG." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `studio-logo-${userId}.${fileExt}`;
    const filePath = `studios/${fileName}`;

    // Upload to Supabase Storage (upsert to overwrite existing logo)
    const { error: uploadError } = await supabaseAdmin.storage
      .from("photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("photos").getPublicUrl(filePath);

    return NextResponse.json({ logoUrl: publicUrl });
  } catch (error) {
    console.error("Failed to upload logo:", error);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
}

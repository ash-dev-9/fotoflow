import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studio = await prisma.studio.findUnique({
      where: { userId },
    });

    return NextResponse.json(studio || { userId, primaryColor: "#3B82F6", name: null, logoUrl: null });
  } catch (error) {
    console.error("Failed to fetch studio settings:", error);
    return NextResponse.json({ error: "Failed to fetch studio settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, logoUrl, primaryColor } = body;

    const studio = await prisma.studio.upsert({
      where: { userId },
      update: {
        name,
        logoUrl,
        primaryColor,
      },
      create: {
        userId,
        name,
        logoUrl,
        primaryColor,
      },
    });

    return NextResponse.json(studio);
  } catch (error) {
    console.error("Failed to update studio settings:", error);
    return NextResponse.json({ error: "Failed to update studio settings" }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { ValidationError, errorToResponse } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { guestId, subscription } = await request.json();

    if (!guestId || !subscription) {
      throw new ValidationError("Missing guestId or subscription data");
    }

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new ValidationError("Invalid subscription object");
    }

    await prisma.notificationSubscription.upsert({
      where: { guestId },
      update: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        guestId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    return errorToResponse(error);
  }
}

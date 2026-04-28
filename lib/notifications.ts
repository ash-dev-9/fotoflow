import webpush from 'web-push';
import { prisma } from './prisma';

// Configure Web Push
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:contact@fotoflow.ai',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export type NotificationPayload = {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  photoUrl?: string;
};

export async function sendNotification(guestId: string, payload: NotificationPayload) {
  try {
    const subscription = await prisma.notificationSubscription.findUnique({
      where: { guestId },
    });

    if (subscription) {
      // Send Web Push
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );
      console.log(`Web Push sent to guest ${guestId}`);
    }

    // Prepare for WhatsApp (Placeholder)
    // If you have Brevo or Twilio, add implementation here
    await sendWhatsAppNotification(guestId, payload);

  } catch (error) {
    console.error(`Failed to send notification to guest ${guestId}:`, error);
  }
}

async function sendWhatsAppNotification(guestId: string, payload: NotificationPayload) {
  // Placeholder for WhatsApp API
  // Example with Brevo or Twilio
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { email: true } // Assuming we might use email or if we add a phone field
  });

  if (!guest) return;

  // console.log(`[MOCK] Sending WhatsApp to guest ${guestId}: ${payload.body}`);
}

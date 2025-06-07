import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

type WebhookEvent = {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string;
    last_name: string;
    image_url: string;
    username: string;
  };
  object: 'event';
  type: 'user.created' | 'user.updated' | 'user.deleted';
};

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const { type, data } = evt;

  try {
    switch (type) {
      case 'user.created':
        console.log(`User created: ${data.id}`, {
          email: data.email_addresses[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          username: data.username,
        });
        // TODO: Implement database sync once drizzle-orm version compatibility is resolved
        break;
      case 'user.updated':
        console.log(`User updated: ${data.id}`, {
          email: data.email_addresses[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          username: data.username,
        });
        // TODO: Implement database sync once drizzle-orm version compatibility is resolved
        break;
      case 'user.deleted':
        console.log(`User deleted: ${data.id}`);
        // TODO: Implement database sync once drizzle-orm version compatibility is resolved
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

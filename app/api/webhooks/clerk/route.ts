import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

// Supabase client with service role key (bypasses RLS for admin operations)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Missing webhook headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`, { userId: evt.data.id });

  try {
    switch (eventType) {
      case 'user.created': {
        // Sync new user to Supabase user_profiles
        const { id, email_addresses, public_metadata } = evt.data;

        const primaryEmail = email_addresses?.find(
          (email) => email.id === evt.data.primary_email_address_id
        )?.email_address;

        const role = (public_metadata?.role as string) || 'viewer';
        const campusId = public_metadata?.campus_id as string | null;

        console.log('Creating user profile:', {
          id,
          email: primaryEmail,
          role,
          campusId,
        });

        const { error } = await supabaseAdmin.from('user_profiles').insert({
          id: id,
          email: primaryEmail,
          role: role,
          campus_id: campusId || null,
          display_name: null,
          theme: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error creating user profile:', error);
          return new Response(`Database error: ${error.message}`, {
            status: 500,
          });
        }

        console.log('User profile created successfully');
        break;
      }

      case 'user.updated': {
        // Update user in Supabase when Clerk user is updated
        const { id, email_addresses, public_metadata } = evt.data;

        const primaryEmail = email_addresses?.find(
          (email) => email.id === evt.data.primary_email_address_id
        )?.email_address;

        const role = (public_metadata?.role as string) || 'viewer';
        const campusId = public_metadata?.campus_id as string | null;

        console.log('Updating user profile:', {
          id,
          email: primaryEmail,
          role,
          campusId,
        });

        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({
            email: primaryEmail,
            role: role,
            campus_id: campusId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating user profile:', error);
          return new Response(`Database error: ${error.message}`, {
            status: 500,
          });
        }

        console.log('User profile updated successfully');
        break;
      }

      case 'user.deleted': {
        // Optionally delete user from Supabase (or mark as deleted)
        const { id } = evt.data;

        console.log('Deleting user profile:', { id });

        const { error } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting user profile:', error);
          return new Response(`Database error: ${error.message}`, {
            status: 500,
          });
        }

        console.log('User profile deleted successfully');
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

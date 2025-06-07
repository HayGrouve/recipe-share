import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user
 * Throws an error if no user is authenticated
 */
export async function getAuthenticatedUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user;
}

/**
 * Get the current user's ID
 * Returns null if no user is authenticated
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication - redirect to sign-in if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return userId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Get user metadata for database operations
 */
export async function getUserMetadata() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl || '',
    username: user.username || '',
  };
}

/**
 * Format user display name
 */
export function formatUserDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string;
}) {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.username) {
    return user.username;
  }

  return user.email || 'Anonymous User';
}

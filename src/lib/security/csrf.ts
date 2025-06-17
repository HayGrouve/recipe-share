import { randomBytes, createHash } from 'crypto';
import { NextRequest } from 'next/server';

// Generate a secure random token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Create a hash of the token for verification
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Verify CSRF token
export function verifyCSRFToken(token: string, expectedHash: string): boolean {
  if (!token || !expectedHash) {
    return false;
  }

  const tokenHash = hashToken(token);
  return tokenHash === expectedHash;
}

// Get CSRF token from request headers
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check X-CSRF-Token header first
  let token = request.headers.get('x-csrf-token');

  if (!token) {
    // Fallback to custom header
    token = request.headers.get('x-requested-with');
    if (token !== 'XMLHttpRequest') {
      token = null;
    }
  }

  return token;
}

// Check if request needs CSRF protection
export function requiresCSRFProtection(request: NextRequest): boolean {
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // Only protect state-changing operations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return false;
  }

  // Skip webhook endpoints
  if (pathname.startsWith('/api/webhooks/')) {
    return false;
  }

  // Skip upload endpoints that use their own auth
  if (pathname.startsWith('/api/uploadthing')) {
    return false;
  }

  // Protect all other API routes
  return pathname.startsWith('/api/');
}

// CSRF protection middleware
export function csrfProtection(request: NextRequest): boolean {
  if (!requiresCSRFProtection(request)) {
    return true; // No protection needed
  }

  // For now, we'll use the simpler approach of checking for XMLHttpRequest header
  // In a full implementation, you'd want to use session-based CSRF tokens
  const requestedWith = request.headers.get('x-requested-with');
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests with XMLHttpRequest header (AJAX requests)
  if (requestedWith === 'XMLHttpRequest') {
    return true;
  }

  // Check origin/referer for same-origin requests
  if (origin || referer) {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'https://localhost:3000',
    ].filter(Boolean);

    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      return true;
    }
  }

  return false; // CSRF protection failed
}

// Hook for client-side CSRF token management
export const useCSRFToken = () => {
  // In a real implementation, this would fetch/manage CSRF tokens
  // For now, we rely on same-origin policy and XMLHttpRequest headers
  return {
    token: null,
    getHeaders: () => ({
      'X-Requested-With': 'XMLHttpRequest',
    }),
  };
};

// Server-side CSRF validation for API routes
export function validateCSRF(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  if (!requiresCSRFProtection(request)) {
    return { valid: true };
  }

  const isValid = csrfProtection(request);

  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF validation failed. Ensure request includes proper headers.',
    };
  }

  return { valid: true };
}

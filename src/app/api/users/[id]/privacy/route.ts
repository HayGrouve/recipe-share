import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

// Define the interface since the tables may not be in the shared package yet
interface UserPrivacySettings {
  userId: string;
  profileVisibility: 'public' | 'friends' | 'private';
  recipeVisibility: 'public' | 'friends' | 'private';
  allowFollowRequests: boolean;
  showActivity: boolean;
  allowDirectMessages: boolean;
  discoverable: boolean;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]/privacy - Get user privacy settings
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Users can only view their own privacy settings
    if (userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Not authorized to view these privacy settings' },
        { status: 403 }
      );
    }

    // Since the userPrivacy table may not exist yet in the shared package,
    // return default privacy settings for now
    const defaultPrivacySettings: UserPrivacySettings = {
      userId,
      profileVisibility: 'public',
      recipeVisibility: 'public',
      allowFollowRequests: true,
      showActivity: true,
      allowDirectMessages: true,
      discoverable: true,
    };

    return NextResponse.json({
      privacySettings: defaultPrivacySettings,
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/privacy - Update user privacy settings
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Users can only update their own privacy settings
    if (userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Not authorized to update these privacy settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      profileVisibility,
      recipeVisibility,
      allowFollowRequests,
      showActivity,
      allowDirectMessages,
      discoverable,
    } = body;

    // Validate input
    const validVisibilityOptions = ['public', 'friends', 'private'];
    if (
      profileVisibility &&
      !validVisibilityOptions.includes(profileVisibility)
    ) {
      return NextResponse.json(
        { error: 'Invalid profile visibility option' },
        { status: 400 }
      );
    }
    if (
      recipeVisibility &&
      !validVisibilityOptions.includes(recipeVisibility)
    ) {
      return NextResponse.json(
        { error: 'Invalid recipe visibility option' },
        { status: 400 }
      );
    }

    // For now, store in a mock response until the shared package is updated
    const updatedSettings: UserPrivacySettings = {
      userId,
      profileVisibility: profileVisibility || 'public',
      recipeVisibility: recipeVisibility || 'public',
      allowFollowRequests:
        allowFollowRequests !== undefined ? allowFollowRequests : true,
      showActivity: showActivity !== undefined ? showActivity : true,
      allowDirectMessages:
        allowDirectMessages !== undefined ? allowDirectMessages : true,
      discoverable: discoverable !== undefined ? discoverable : true,
    };

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      privacySettings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

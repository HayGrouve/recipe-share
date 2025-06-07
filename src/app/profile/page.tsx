import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Your Profile
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        <UserProfile
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-orange-600 hover:bg-orange-700 text-sm normal-case',
            },
          }}
        />
      </div>
    </div>
  );
}

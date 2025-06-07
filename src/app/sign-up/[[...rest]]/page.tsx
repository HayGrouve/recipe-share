import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join RecipeShare and start sharing your culinary adventures
          </p>
        </div>
        <SignUp
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

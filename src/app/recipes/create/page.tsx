import { Metadata } from 'next';
import RecipeCreateForm from '@/components/recipes/recipe-create-form';

export const metadata: Metadata = {
  title: 'Create Recipe - RecipeShare',
  description: 'Create and share your own recipes with the community',
};

export default function CreateRecipePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Create a New Recipe
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Share your culinary creation with the RecipeShare community
          </p>
        </div>

        <RecipeCreateForm />
      </div>
    </div>
  );
}

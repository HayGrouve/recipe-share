'use client';

import { useState } from 'react';
import { RecipeRichTextEditor } from '@/components/editor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';\nimport { announce } from '@/lib/focus-management';

export default function TestEditorPage() {
  const [content, setContent] = useState(`
    <h2>Chocolate Chip Cookies</h2>
    <p>These delicious chocolate chip cookies are perfect for any occasion. The butter and vanilla create a rich base, while the chocolate chips add sweetness.</p>
    
    <h3>Ingredients</h3>
    <p>You'll need butter, flour, sugar, eggs, vanilla, and chocolate chips for this recipe.</p>
    
    <h3>Instructions</h3>
    <ol>
      <li>Cream the butter and sugar together until light and fluffy.</li>
      <li>Beat in the eggs and vanilla.</li>
      <li>Gradually mix in the flour.</li>
      <li>Fold in the chocolate chips.</li>
      <li>Bake at 375°F for 9-11 minutes.</li>
    </ol>
  `);

  const [ingredients, setIngredients] = useState([
    'butter',
    'flour',
    'sugar',
    'eggs',
    'vanilla',
    'chocolate chips',
  ]);

  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    if (
      newIngredient.trim() &&
      !ingredients.includes(newIngredient.trim().toLowerCase())
    ) {
      setIngredients([...ingredients, newIngredient.trim().toLowerCase()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Mock image upload - in a real app, this would upload to a service
    return new Promise((resolve) => {
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        resolve(url);
      }, 1000);
    });
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Rich Text Editor Test</h1>
        <p className="text-gray-600">
          Test the recipe-specific rich text editor with ingredient highlighting
          and templates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Editor</CardTitle>
              <CardDescription>
                Try typing ingredient names from the list on the right to see
                them highlighted. Use the Templates button to insert common
                recipe sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipeRichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your recipe..."
                ingredients={ingredients}
                onImageUpload={handleImageUpload}
                className="min-h-[400px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Ingredients Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Add ingredients to see them highlighted in the editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient..."
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={addIngredient} size="sm">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {ingredient}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeIngredient(ingredient)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Rich text formatting (bold, italic)</li>
                <li>✅ Bullet and numbered lists</li>
                <li>✅ Link insertion</li>
                <li>✅ Image upload/insertion</li>
                <li>✅ Ingredient highlighting</li>
                <li>✅ Recipe templates</li>
                <li>✅ Preview mode</li>
                <li>✅ Auto-save to localStorage</li>
                <li>✅ Undo/Redo functionality</li>
                <li>✅ Keyboard shortcuts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Output Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>HTML Output</CardTitle>
          <CardDescription>
            This is the HTML content that would be saved to the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Lightbulb,
  ChefHat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IngredientHighlight } from './extensions/IngredientHighlight';
import './editor.css';

interface RecipeRichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  readOnly?: boolean;
  ingredients?: string[];
  onImageUpload?: (file: File) => Promise<string>;
}

const recipeTemplates = {
  instructions: {
    title: 'Instructions Template',
    content: `<h3>Instructions</h3>
<ol>
  <li>Preheat your oven to 350°F (175°C).</li>
  <li>In a large mixing bowl, combine the dry ingredients.</li>
  <li>In a separate bowl, whisk together the wet ingredients.</li>
  <li>Gradually add the wet ingredients to the dry ingredients, mixing until just combined.</li>
  <li>Transfer to prepared baking dish and bake for 25-30 minutes.</li>
  <li>Cool completely before serving.</li>
</ol>`,
  },
  tips: {
    title: 'Tips & Notes Template',
    content: `<h3>Tips & Notes</h3>
<ul>
  <li><strong>Storage:</strong> Store covered in refrigerator for up to 3 days.</li>
  <li><strong>Substitutions:</strong> You can substitute X for Y if needed.</li>
  <li><strong>Make-ahead:</strong> This recipe can be prepared up to 24 hours in advance.</li>
  <li><strong>Variations:</strong> Try adding different spices or ingredients for variety.</li>
</ul>`,
  },
};

export const RecipeRichTextEditor = ({
  content = '',
  onChange,
  placeholder = 'Start writing your recipe...',
  className,
  autoSave = true,
  readOnly = false,
  ingredients = [],
  onImageUpload,
}: RecipeRichTextEditorProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'tiptap-list-item',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      IngredientHighlight.configure({
        ingredients,
        className: 'recipe-ingredient',
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);

      // Auto-save to localStorage if enabled
      if (autoSave && !readOnly) {
        localStorage.setItem('recipe-editor-content', html);
      }
    },
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (autoSave && !content && !readOnly) {
      const saved = localStorage.getItem('recipe-editor-content');
      if (saved && editor) {
        editor.commands.setContent(saved);
      }
    }
  }, [editor, autoSave, content, readOnly]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Update ingredients highlighting when ingredients change
  useEffect(() => {
    if (editor && ingredients && ingredients.length > 0) {
      // For now, we'll skip the ingredient highlighting feature
      // This can be implemented later with a custom TipTap extension
      // TODO: Implement ingredient highlighting extension
    }
  }, [editor, ingredients]);

  const addImage = useCallback(async () => {
    if (onImageUpload) {
      // Create file input for image upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && editor) {
          try {
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
      };
      input.click();
    } else {
      // Fallback to URL input
      const url = window.prompt('Enter image URL:');
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor, onImageUpload]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }, [editor]);

  const insertTemplate = useCallback(
    (template: typeof recipeTemplates.instructions) => {
      if (editor) {
        editor.chain().focus().insertContent(template.content).run();
        setShowTemplates(false);
      }
    },
    [editor]
  );

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem('recipe-editor-content');
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
          {/* Formatting Controls */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('bold') && 'bg-gray-200'
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('italic') && 'bg-gray-200'
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* List Controls */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('bulletList') && 'bg-gray-200'
            )}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('orderedList') && 'bg-gray-200'
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Media Controls */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('link') && 'bg-gray-200'
            )}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Recipe Templates */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="h-8 px-3"
            >
              <ChefHat className="mr-1 h-4 w-4" />
              Templates
            </Button>

            {showTemplates && (
              <div className="absolute top-full left-0 z-10 mt-1 min-w-[200px] rounded-lg border bg-white shadow-lg">
                <div className="p-2">
                  <h4 className="mb-2 text-sm font-medium">Recipe Templates</h4>
                  {Object.entries(recipeTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertTemplate(template)}
                      className="mb-1 h-8 w-full justify-start px-2"
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* Undo/Redo */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          {/* Ingredient Highlighting Indicator */}
          {ingredients.length > 0 && (
            <div className="flex items-center rounded bg-yellow-50 px-2 py-1 text-xs text-gray-600">
              <Lightbulb className="mr-1 h-3 w-3" />
              {ingredients.length} ingredients highlighted
            </div>
          )}

          {/* Preview Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="h-8 px-3"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="mr-1 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </>
            )}
          </Button>

          {/* Auto-save Controls */}
          {autoSave && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAutoSave}
              className="h-8 px-3 text-xs"
            >
              Clear Draft
            </Button>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        {isPreviewMode ? (
          <div
            className="prose prose-sm min-h-[200px] max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        ) : (
          <EditorContent
            editor={editor}
            className="min-h-[200px] focus-within:outline-none"
          />
        )}
      </div>

      {/* Click overlay to close templates */}
      {showTemplates && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default RecipeRichTextEditor;

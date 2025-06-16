'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Type,
  AlignLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecipeFormData } from '@/lib/validations/recipe';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled = false,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        'h-9 w-9 p-0',
        isActive && 'bg-blue-600 text-white hover:bg-blue-700'
      )}
    >
      {children}
    </Button>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter the URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-3"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-gray-200 px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-gray-200 px-2">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading"
        >
          <Type className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Links */}
      <div className="flex items-center gap-1 border-r border-gray-200 px-2">
        <ToolbarButton
          onClick={editor.isActive('link') ? removeLink : addLink}
          isActive={editor.isActive('link')}
          title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 pl-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export default function InstructionsStep() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<RecipeFormData>();

  const instructions = watch('instructions') || '';
  const maxLength = 5000;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3, 4],
        },
      }),
      Placeholder.configure({
        placeholder:
          'Write your step-by-step cooking instructions here...\n\nTip: Use numbered lists for clear step-by-step instructions.',
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Underline,
    ],
    content: instructions,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue('instructions', html, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    onBlur: () => {
      trigger('instructions');
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-[300px]',
        'aria-label': 'Recipe instructions editor',
        'aria-describedby': 'instructions-help',
      },
    },
  });

  // Update editor content when form value changes (for auto-load in edit mode)
  React.useEffect(() => {
    if (editor && instructions !== editor.getHTML()) {
      editor.commands.setContent(instructions || '');
    }
  }, [editor, instructions]);

  const characterCount = editor?.storage.characterCount.characters() || 0;
  const wordCount = editor?.storage.characterCount.words() || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Cooking Instructions
        </h3>
        <p id="instructions-help" className="text-sm text-gray-600">
          Provide clear, step-by-step instructions for making your recipe. Use
          formatting to make your instructions easy to follow.
        </p>
      </div>

      {/* Rich Text Editor */}
      <Card
        className={cn(
          'overflow-hidden transition-colors',
          errors.instructions
            ? 'border-red-300 ring-1 ring-red-300'
            : 'border-gray-200'
        )}
      >
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="instructions"
              className="text-sm font-medium text-gray-700"
            >
              Instructions*
            </Label>
            <div className="text-xs text-gray-500">
              {wordCount} words • {characterCount}/{maxLength} characters
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Toolbar */}
          <EditorToolbar editor={editor} />

          {/* Editor Content */}
          <div className="relative">
            <EditorContent
              editor={editor}
              className={cn(
                'prose prose-sm max-w-none',
                'min-h-[300px] p-4',
                '[&_.ProseMirror]:outline-none',
                '[&_.ProseMirror]:min-h-[300px]',
                '[&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold',
                '[&_.ProseMirror_h4]:mt-4 [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-medium',
                '[&_.ProseMirror_p]:mb-3',
                '[&_.ProseMirror_ol]:mb-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6',
                '[&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6',
                '[&_.ProseMirror_li]:mb-1',
                '[&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline',
                errors.instructions && 'border-red-300'
              )}
            />

            {/* Character limit warning */}
            {characterCount > maxLength * 0.9 && (
              <div
                className={cn(
                  'absolute right-2 bottom-2 rounded-md px-2 py-1 text-xs',
                  characterCount >= maxLength
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                )}
              >
                {characterCount >= maxLength
                  ? 'Character limit reached'
                  : 'Approaching character limit'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errors.instructions && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3"
        >
          <p className="text-sm text-red-600">{errors.instructions.message}</p>
        </div>
      )}

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <CardTitle className="mb-2 text-sm font-medium text-blue-900">
            💡 Tips for Great Instructions
          </CardTitle>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Use numbered lists for step-by-step instructions</li>
            <li>
              • Include timing information (e.g., &quot;Cook for 5
              minutes&quot;)
            </li>
            <li>
              • Mention visual cues (e.g., &quot;until golden brown&quot;)
            </li>
            <li>• Use headings to organize different stages of cooking</li>
            <li>• Add links to explain cooking techniques</li>
          </ul>
        </CardContent>
      </Card>

      {/* Hidden input for form registration */}
      <input
        type="hidden"
        {...register('instructions', {
          required: 'Instructions are required',
          minLength: {
            value: 20,
            message: 'Instructions must be at least 20 characters',
          },
          maxLength: {
            value: maxLength,
            message: `Instructions must be less than ${maxLength} characters`,
          },
        })}
      />
    </div>
  );
}

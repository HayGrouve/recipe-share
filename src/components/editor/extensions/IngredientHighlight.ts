import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

interface IngredientHighlightOptions {
  ingredients: string[];
  className: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ingredientHighlight: {
      /**
       * Update the ingredients list for highlighting
       */
      updateIngredients: (ingredients: string[]) => ReturnType;
    };
  }
}

function createDecorations(
  doc: ProseMirrorNode,
  ingredients: string[],
  className: string
) {
  const decorations: Decoration[] = [];

  if (!ingredients.length) {
    return DecorationSet.empty;
  }

  // Create a regex pattern that matches any of the ingredients (case-insensitive)
  const pattern = new RegExp(
    `\\b(${ingredients
      .map((ingredient) => ingredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})\\b`,
    'gi'
  );

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.isText) {
      const text = node.text || '';
      let match;

      while ((match = pattern.exec(text)) !== null) {
        const start = pos + match.index;
        const end = start + match[0].length;

        decorations.push(
          Decoration.inline(start, end, {
            class: className,
            title: `Ingredient: ${match[0]}`,
          })
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const IngredientHighlight = Extension.create<IngredientHighlightOptions>(
  {
    name: 'ingredientHighlight',

    addOptions() {
      return {
        ingredients: [],
        className: 'recipe-ingredient',
      };
    },

    addCommands() {
      return {
        updateIngredients:
          (ingredients: string[]) =>
          ({ tr, dispatch }) => {
            if (dispatch) {
              tr.setMeta('updateIngredients', ingredients);
            }
            return true;
          },
      };
    },

    addProseMirrorPlugins() {
      const { className } = this.options;

      return [
        new Plugin({
          key: new PluginKey('ingredientHighlight'),
          state: {
            init: () => {
              return {
                ingredients: this.options.ingredients,
                decorations: DecorationSet.empty,
              };
            },
            apply: (tr, state) => {
              const ingredients =
                tr.getMeta('updateIngredients') || state.ingredients;
              const decorations = createDecorations(
                tr.doc,
                ingredients,
                className
              );

              return {
                ingredients,
                decorations,
              };
            },
          },
          props: {
            decorations(state) {
              return this.getState(state)?.decorations;
            },
          },
        }),
      ];
    },
  }
);

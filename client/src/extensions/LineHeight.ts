import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: '1.15',
            parseHTML: element => element.style.lineHeight || '1.15',
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ chain }) => {
        return chain().updateAttributes('paragraph', { lineHeight }).updateAttributes('heading', { lineHeight }).run();
      },
      unsetLineHeight: () => ({ chain }) => {
        return chain().resetAttributes('paragraph', 'lineHeight').resetAttributes('heading', 'lineHeight').run();
      },
    };
  },
});
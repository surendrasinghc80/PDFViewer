import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { isMarkdown, markdownToHtml, prepareHtmlForEditor } from '@/lib/markdown';

export const MarkdownPaste = Extension.create({
    name: 'markdownPaste',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('markdownPaste'),
                props: {
                    handlePaste: (view, event) => {
                        // Get the pasted content
                        const text = event.clipboardData?.getData('text/plain');

                        if (!text) {
                            return false; // Let TipTap handle it normally
                        }

                        // Check if the content looks like markdown
                        if (isMarkdown(text)) {
                            // Prevent default paste behavior
                            event.preventDefault();

                            // Convert markdown to HTML asynchronously
                            markdownToHtml(text).then((html) => {
                                const cleanedHtml = prepareHtmlForEditor(html);

                                // Use TipTap's insertContent command to insert the HTML
                                this.editor.commands.insertContent(cleanedHtml);
                            }).catch((error) => {
                                console.error('Error pasting markdown:', error);
                                // Fallback: insert as plain text
                                this.editor.commands.insertContent(text);
                            });

                            return true; // Prevent default paste
                        }

                        return false; // Let TipTap handle non-markdown content normally
                    },
                },
            }),
        ];
    },
});

import { marked } from 'marked';

/**
 * Detects if the given text contains markdown syntax
 */
export function isMarkdown(text: string): boolean {
    // Check for common markdown patterns
    const markdownPatterns = [
        /^#{1,6}\s+.+/m,           // Headers
        /^\*\*.*\*\*$/m,           // Bold
        /^__.*__$/m,               // Bold (alternative)
        /^\*.*\*$/m,               // Italic
        /^_.*_$/m,                 // Italic (alternative)
        /^\- .+/m,                 // Unordered list
        /^\* .+/m,                 // Unordered list (alternative)
        /^\d+\. .+/m,              // Ordered list
        /^```[\s\S]*?```/m,        // Code blocks
        /^\[.+\]\(.+\)/m,          // Links
        /^!\[.*\]\(.+\)/m,         // Images
        /^\|.+\|.+\|/m,            // Tables
        /^>.+/m,                   // Blockquotes
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Converts markdown text to HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
    // Configure marked options
    marked.setOptions({
        gfm: true,              // GitHub Flavored Markdown
        breaks: true,           // Convert \n to <br>
        pedantic: false,
    });

    try {
        const html = await marked.parse(markdown);
        return html;
    } catch (error) {
        console.error('Error converting markdown to HTML:', error);
        return markdown; // Return original text if conversion fails
    }
}

/**
 * Sanitizes and prepares HTML for insertion into TipTap editor
 */
export function prepareHtmlForEditor(html: string): string {
    // Remove any wrapping <p> tags if the content is simple
    let cleaned = html.trim();

    // Ensure proper spacing for lists
    cleaned = cleaned.replace(/<\/li>\s*<li>/g, '</li><li>');

    // Ensure proper spacing for paragraphs
    cleaned = cleaned.replace(/<\/p>\s*<p>/g, '</p><p>');

    return cleaned;
}

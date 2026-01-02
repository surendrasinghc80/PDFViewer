import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MARKDOWN_STYLES = `
  .markdown-container :global(.wmde-markdown table) {
    width: auto !important;
    display: table !important;
  }
  .markdown-container :global(.wmde-markdown ul),
  .markdown-container :global(.wmde-markdown ol) {
    padding-left: 2em !important;
    margin: 1em 0 !important;
  }
  .markdown-container :global(.wmde-markdown ul li),
  .markdown-container :global(.wmde-markdown ol li) {
    display: list-item !important;
    margin: 0.5em 0 !important;
  }
  .markdown-container :global(.wmde-markdown ul) {
    list-style-type: disc !important;
    }
  .markdown-container :global(.wmde-markdown ul ul) {
    list-style-type: circle !important;
  }
  .markdown-container :global(.wmde-markdown ol) {
    list-style-type: decimal !important;
  }
`
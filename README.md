# Aditily

A powerful, DOCX-style rich text editor and PDF viewer for React applications. Built with Tiptap, React PDF, and modern styling libraries.

[![NPM Version](https://img.shields.io/npm/v/aditily.svg)](https://www.npmjs.com/package/aditily)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

### 📝 Advanced Document Editor
- **Rich Text Editing**: Full-featured editor with formatting, lists (bullet/numbered), tables, and alignment.
- **Visual Pagination**: Infinite scrolling with clear **A4 page indicators** (1300px height) and visual page separation.
- **Tables**: Create and manage tables with visible borders, hover effects, and row/column controls.
- **Lists**: Proper support for nested bullet and numbered lists.

### 🖼️ Image Manipulation
- **Resize**: Drag from any edge or corner to resize images while maintaining aspect ratio.
- **Toolbar Controls**: Dedicated floating toolbar for image settings.
- **Transformations**: Rotate (90°, 180°, 270°) and Flip (Horizontal/Vertical) images.
- **Text Wrapping**: 
  - **In Line**: Default behavior
  - **Wrap Text**: Text flows around the image
  - **Break Text**: Image takes full line width
  - **Behind Text**: Image acts as a background/watermark
  - **In Front of Text**: Image overlays content
- **Alignment**: Align images Left, Center, or Right.

### 📄 PDF Integration
- **Integrated Viewer**: Built-in tabbed interface to switch between Editor and PDF viewing modes.
- **PDF Upload**: Upload PDF files directly from the toolbar for convenient viewing and reference.
- **Advanced Controls**: Zoom (50%-300%), page navigation, sidebars for thumbnails, and responsive rendering.

### 💾 Import & Export
- **DOCX Support**: 
  - **Import**: Load existing DOCX files for editing.
  - **Export**: Generate high-fidelity DOCX files compatible with Microsoft Word and Google Docs.
- **PDF Export**: Export your document content directly to PDF format with a single click.

### ⌨️ Keyboard Shortcuts

| Action | Shortcut (Mac) | Shortcut (Windows/Linux) |
|--------|----------------|--------------------------|
| **Bold** | `Cmd` + `B` | `Ctrl` + `B` |
| **Italic** | `Cmd` + `I` | `Ctrl` + `I` |
| **Underline** | `Cmd` + `U` | `Ctrl` + `U` |
| **Strike** | `Cmd` + `Shift` + `X` | `Ctrl` + `Shift` + `X` |
| **Highlight** | `Cmd` + `Shift` + `H` | `Ctrl` + `Shift` + `H` |
| **Code** | `Cmd` + `E` | `Ctrl` + `E` |
| **Undo** | `Cmd` + `Z` | `Ctrl` + `Z` |
| **Redo** | `Cmd` + `Shift` + `Z` | `Ctrl` + `Shift` + `Z` |
| **Bullet List** | `Cmd` + `Shift` + `8` | `Ctrl` + `Shift` + `8` |
| **Ordered List** | `Cmd` + `Shift` + `7` | `Ctrl` + `Shift` + `7` |

## Installation

```bash
npm install aditily
```

## Usage

### Basic Usage

Import the component and its baseline styles. Ensure the parent container has a height.

```tsx
import { DocumentEditor } from 'aditily';
import 'aditily/dist/style.css';

function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <DocumentEditor 
        initialContent="<h1>Welcome to Aditily</h1>"
        onChange={(html) => console.log('Content updated:', html)}
      />
    </div>
  );
}
```

### Next.js Integration (SSR)

Since Aditily uses browser-specific APIs (Canvas, DOM), it must be imported dynamically.

```tsx
"use client";

import dynamic from 'next/dynamic';
import 'aditily/dist/style.css';

const DocumentEditor = dynamic(
  () => import('aditily').then((mod) => mod.DocumentEditor),
  { 
    ssr: false,
    loading: () => <div>Loading Editor...</div>
  }
);

export default function Page() {
  return <DocumentEditor />;
}
```

### Tailwind CSS Configuration

Aditily uses Tailwind for styling. To ensure all library styles are properly purged/generated in your project:

#### Tailwind v3 (tailwind.config.js)
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/aditily/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Tailwind v4 (globals.css)
```css
@import "tailwindcss";
@import "aditily/style";

/* Ensure Tailwind scans the library for utility classes */
@source "../../node_modules/aditily/dist/**/*.{js,ts,jsx,tsx}";
```

## Props

The `DocumentEditor` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `""` | Initial HTML string to load into the editor. |
| `className` | `string` | `""` | Additional CSS classes for the outer container. |
| `onChange` | `(html: string) => void` | `undefined` | Callback function triggered on every content change. |
| `readOnly` | `boolean` | `false` | If true, the editor is disabled and toolbars are hidden. |
| `placeholder` | `string` | `"Enter your content here..."` | Text to show when the editor is empty. |

## Peer Dependencies

Ensure your project has these dependencies:
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## License

MIT © [Surendra Singh](https://github.com/surendrasinghc80)

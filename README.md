# PageMaster Editor

A powerful, DOCX-style rich text editor and PDF viewer for React applications. Built with Tiptap, React PDF, and generic document handling libraries.

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
- **PDF Upload**: Upload PDF files directly from the toolbar.
- **Advanced Controls**: Zoom (50%-300%), page navigation, and responsive rendering.

### 💾 Import & Export
- **DOCX Support**: 
  - **Import**: Load existing DOCX files for editing.
  - **Export**: Generate distinct, browser-compatible DOCX files with improved formatting.
- **PDF Export**: Export your document content directly to PDF format.

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
npm install pagemaster-editor
```

## Usage

### Document Editor with PDF Viewer

```tsx
import { DocumentEditor } from 'pagemaster-editor';
import 'pagemaster-editor/dist/style.css';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <DocumentEditor />
    </div>
  );
}
```

### PDF Viewer (Standalone)

```tsx
import { PDFViewer } from 'pagemaster-editor';
import 'pagemaster-editor/dist/style.css';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <PDFViewer file="https://example.com/sample.pdf" />
    </div>
  );
}
```

## Peer Dependencies

Ensure you have the following installed in your project:
- `react`
- `react-dom`

## License

MIT

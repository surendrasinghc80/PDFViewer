import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import FontSize from "@tiptap/extension-font-size";
import { CustomImage } from "@/extensions/CustomImage";
import { EditorToolbar } from "./EditorToolbar";
import { TableControls } from "./TableControls";
import { ImageToolbar } from "./ImageToolbar";
import { PDFViewer } from "@/components/pdf/PDFViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import "./editor.css";

// Define props interface for valid export
export interface EditorProps {
  initialContent?: string;
  className?: string;
}

export function DocumentEditor(props: EditorProps = {}) {
  const { initialContent, className } = props;
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions that might conflict or that we configure separately
        // history: false, // We often use specific history configuration
      }),
      // Register all required table extensions explicitly
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "editor-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: initialContent || `
      <h1>Professional DOCX-Style Editor</h1>
      <p>This is a fully-featured text editor with A4 page layout simulation. Start typing to experience:</p>
      <ul>
        <li><strong>Rich text formatting</strong> - Bold, italic, underline, colors, fonts, and more</li>
        <li><strong>Tables</strong> - Insert, resize, merge cells, add/delete rows and columns</li>
        <li><strong>Hyperlinks</strong> - Add clickable links to any text</li>
        <li><strong>Keyboard shortcuts</strong> - All standard shortcuts work (Ctrl+B, Ctrl+I, Ctrl+Z, etc.)</li>
        <li><strong>Lists &amp; Headings</strong> - Organize content with bullets, numbers, and heading levels</li>
      </ul>
      <p>Try using the toolbar above or keyboard shortcuts to format your text. Click the table button to insert a table.</p>
      <h2>Sample Table</h2>
    `,
    editorProps: {
      attributes: {
        class: "editor-content prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);

      if (node && node.type.name === 'image') {
        setSelectedImagePos(selection.from);
      } else {
        setSelectedImagePos(null);
      }
    },
  });

  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
    setActiveTab("pdf");
  };

  return (
    <div className="flex flex-col h-screen bg-editor-workspace">
      <EditorToolbar editor={editor} onPdfUpload={handlePdfUpload} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-toolbar-border bg-toolbar-bg px-4">
          <TabsList className="h-12 bg-transparent">
            <TabsTrigger value="editor" className="data-[state=active]:bg-toolbar-active">
              Editor
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-toolbar-active">
              PDF Viewer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="flex-1 overflow-auto py-8 m-0">
          <ImageToolbar editor={editor} imagePos={selectedImagePos} />
          <div className="mx-auto space-y-6" style={{ width: "794px" }}>
            <div className="bg-editor-page shadow-lg page-container relative" style={{ minHeight: "1300px", padding: "96px 72px" }}>
              <TableControls editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pdf" className="flex-1 overflow-hidden h-full m-0 p-0">
          <PDFViewer file={pdfFile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

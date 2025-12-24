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
import { Tabs, TabsContent } from "@/components/ui/tabs";
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

  // PDF State
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarViewMode, setSidebarViewMode] = useState<'list' | 'grid'>('list');
  const [isGridOpen, setIsGridOpen] = useState(false);

  const handlePdfPageChange = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  };

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
    content: initialContent || `<p>Enter your content here...</p>`,
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
      <EditorToolbar
        editor={editor}
        onPdfUpload={handlePdfUpload}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // PDF Props
        pdfState={{
          numPages,
          currentPage,
          scale,
          isSidebarOpen,
          sidebarViewMode,
          isGridOpen
        }}
        onPdfStateChange={{
          setNumPages,
          setCurrentPage: handlePdfPageChange,
          setScale,
          setIsSidebarOpen,
          setSidebarViewMode,
          setIsGridOpen
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tab triggers moved to toolbar */}

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
          <PDFViewer
            file={pdfFile}
            numPages={numPages}
            currentPage={currentPage}
            scale={scale}
            isSidebarOpen={isSidebarOpen}
            sidebarViewMode={sidebarViewMode}
            isGridOpen={isGridOpen}
            onNumPagesChange={setNumPages}
            onPageChange={handlePdfPageChange}
            onSidebarViewModeChange={setSidebarViewMode}
            onGridOpenChange={setIsGridOpen}
            onSidebarOpenChange={setIsSidebarOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

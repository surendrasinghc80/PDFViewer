import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  PanelLeftDashed,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Minus,
  Moon,
  Sun,
} from "lucide-react";
import {
  Image as ImageIcon,
  FileDown,
  FileUp,
  FileText,
  FileType,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTheme } from "next-themes";
import * as mammoth from "mammoth";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface EditorToolbarProps {
  editor: any; // Using any temporarily to avoid deep typing issues with Tiptap extensions
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onPdfUpload?: (file: File) => void;
  pdfState?: {
    numPages: number;
    currentPage: number;
    scale: number;
    isSidebarOpen: boolean;
    sidebarViewMode: 'list' | 'grid';
    isGridOpen: boolean;
  };
  onPdfStateChange?: {
    setNumPages: (n: number) => void;
    setCurrentPage: (n: number) => void;
    setScale: (n: number) => void;
    setIsSidebarOpen: (b: boolean) => void;
    setSidebarViewMode: (m: 'list' | 'grid') => void;
    setIsGridOpen: (b: boolean) => void;
  };
}

const fontFamilies = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
];

const fontSizes = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"];

const headings = [
  { label: "Normal", value: "p" },
  { label: "Heading 1", value: "1" },
  { label: "Heading 2", value: "2" },
  { label: "Heading 3", value: "3" },
  { label: "Heading 4", value: "4" },
  { label: "Heading 5", value: "5" },
  { label: "Heading 6", value: "6" },
];

const colors = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff",
  "#0088ff", "#88ff00", "#ff0088", "#00ff88", "#888888",
];

export function EditorToolbar({
  editor,
  activeTab = 'editor',
  onTabChange,
  onPdfUpload,
  pdfState,
  onPdfStateChange
}: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const { theme, setTheme } = useTheme();

  const [imageUrl, setImageUrl] = useState("");
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl, target: "_blank" })
        .run();
    }
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImagePopoverOpen(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.chain().focus().setImage({ src: e.target?.result as string }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
    setIsTablePopoverOpen(false);
  };

  const importDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor.commands.setContent(result.value);
    } catch (error) {
      console.error("Error supporting DOCX:", error);
      alert("Failed to import DOCX file");
    }
  };

  const exportDocx = async () => {
    const htmlContent = editor.getHTML();
    try {
      const { exportToDocx } = await import("@/utils/docxExport");
      await exportToDocx(htmlContent, "document.docx");
    } catch (error) {
      console.error("Error exporting DOCX:", error);
      alert("Failed to export DOCX. Please try again.");
    }
  };

  const exportPdf = () => {
    const element = document.querySelector(".editor-content");
    const opt = {
      margin: 10,
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPdfUpload?.(file);
    } else if (file) {
      alert('Please select a valid PDF file');
    }
  };

  return (
    <div className="
  fixed
  top-0
  left-0
  right-0
  z-50
  bg-toolbar-bg
  border-b
  border-toolbar-border
  p-2
  flex
  flex-wrap
  items-center
  gap-1
">

      {/* View Toggles */}
      <div className="flex gap-1 mr-2 bg-muted/30 p-1 rounded-md">
        <Button
          variant={activeTab === 'editor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange?.('editor')}
          className="h-8 text-xs font-medium"
        >
          Editor
        </Button>
        <Button
          variant={activeTab === 'pdf' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange?.('pdf')}
          className="h-8 text-xs font-medium"
        >
          PDF
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />
      {/* Dark Mode Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-8 w-8"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Upload PDF">
        <FileType className="h-4 w-4" />
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handlePdfUpload}
          title="Upload PDF"
        />
      </Button>

      {/* <Separator orientation="vertical" className="h-6" />
      <Separator orientation="vertical" className="h-6" /> */}

      {activeTab === 'pdf' && pdfState && onPdfStateChange && (
        <div className="flex items-center justify-center gap-1" >

          <Button
            variant={pdfState.isGridOpen ? "default" : "ghost"}
            size="sm"
            onClick={() => onPdfStateChange.setIsGridOpen(true)}
            title="Page Overview"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Overview
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* <Button
            variant={pdfState.isSidebarOpen ? "default" : "ghost"}
            size="icon"
            onClick={() => onPdfStateChange.setIsSidebarOpen(!pdfState.isSidebarOpen)}
            className="h-8 w-8"
            title="Toggle Sidebar"
          >
            <PanelLeftDashed className="h-4 w-4" />
          </Button> */}
          {/* <Separator orientation="vertical" className="h-6" /> */}

          {/* <div className="flex gap-1 bg-muted/30 p-1 rounded-md">
            <Button
              variant={pdfState.sidebarViewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onPdfStateChange.setSidebarViewMode('list')}
              className="h-7 w-7"
              title="Sidebar List View"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={pdfState.sidebarViewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onPdfStateChange.setSidebarViewMode('grid')}
              className="h-7 w-7"
              title="Sidebar Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div> */}

          {/* <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="icon"
            disabled={pdfState.currentPage <= 1}
            onClick={() => onPdfStateChange.setCurrentPage(pdfState.currentPage - 1)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-16 text-center">
              {pdfState.currentPage} / {pdfState.numPages}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={pdfState.currentPage >= pdfState.numPages}
            onClick={() => onPdfStateChange.setCurrentPage(pdfState.currentPage + 1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button> */}

          {/* <Separator orientation="vertical" className="h-6" /> */}

          <div className="flex items-center gap-2 min-w-[150px]">
            <span className="text-xs text-muted-foreground w-12 text-right">
              {Math.round(pdfState.scale * 100)}%
            </span>
            <Slider
              value={[pdfState.scale]}
              min={0.5}
              max={3.0}
              step={0.1}
              onValueChange={(value) => onPdfStateChange.setScale(value[0])}
              className="w-[100px]"
            />
          </div>

        </div>
      )}

      {activeTab === 'editor' && (
        <>

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Font Family */}
          <Select
            value={editor.getAttributes("textStyle").fontFamily || "Arial, sans-serif"}
            onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Font Size */}
          <Select
            value={editor.getAttributes("textStyle").fontSize?.replace("px", "") || "16"}
            onValueChange={(value) => editor.chain().focus().setFontSize(`${value}px`).run()}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Heading Level */}
          <Select
            value={
              editor.isActive("heading", { level: 1 }) ? "1" :
                editor.isActive("heading", { level: 2 }) ? "2" :
                  editor.isActive("heading", { level: 3 }) ? "3" :
                    editor.isActive("heading", { level: 4 }) ? "4" :
                      editor.isActive("heading", { level: 5 }) ? "5" :
                        editor.isActive("heading", { level: 6 }) ? "6" : "p"
            }
            onValueChange={(value) => {
              if (value === "p") {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().setHeading({ level: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
              }
            }}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {headings.map((heading) => (
                <SelectItem key={heading.value} value={heading.value}>
                  {heading.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive("bold")}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive("italic")}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            data-active={editor.isActive("underline")}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            data-active={editor.isActive("strike")}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-wrap gap-1 w-[200px]">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="h-6 w-6 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Background Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-wrap gap-1 w-[200px]">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="h-6 w-6 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            data-active={editor.isActive({ textAlign: "left" })}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            data-active={editor.isActive({ textAlign: "center" })}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            data-active={editor.isActive({ textAlign: "right" })}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            data-active={editor.isActive({ textAlign: "justify" })}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive("bulletList")}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive("orderedList")}
            className="h-8 w-8 data-[active=true]:bg-toolbar-active"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Link */}
          <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-active={editor.isActive("link")}
                className="h-8 w-8 data-[active=true]:bg-toolbar-active"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setLink();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={setLink} size="sm">
                    Set Link
                  </Button>
                  <Button
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setIsLinkPopoverOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Remove Link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Table */}
          <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Table className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Rows</Label>
                  <Input
                    id="rows"
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cols">Columns</Label>
                  <Input
                    id="cols"
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button onClick={insertTable} className="w-full">
                  Insert Table
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Horizontal Rule */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Image */}
          <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Or Upload</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                <Button onClick={addImage} className="w-full">
                  Insert Image
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Import/Export */}
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <FileUp className="h-4 w-4" />
              <input
                type="file"
                accept=".docx"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={importDocx}
                title="Import DOCX"
              />
            </Button>
            <Button variant="ghost" size="icon" onClick={exportDocx} className="h-8 w-8" title="Export DOCX">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={exportPdf} className="h-8 w-8" title="Export PDF">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
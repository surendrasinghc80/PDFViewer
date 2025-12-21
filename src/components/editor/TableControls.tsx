import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Merge,
  TableRowsSplit,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TableControlsProps {
  editor: Editor | null;
}

export function TableControls({ editor }: TableControlsProps) {
  const [isInTable, setIsInTable] = useState(false);
  const [canMergeCells, setCanMergeCells] = useState(false);
  const [canSplitCell, setCanSplitCell] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Update selection state and position whenever editor selection changes
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      const inTable = editor.isActive("table");
      setIsInTable(inTable);
      setCanMergeCells(editor.can().mergeCells());
      setCanSplitCell(editor.can().splitCell());

      // Calculate position if in table
      if (inTable) {
        const { view } = editor;
        const { from } = view.state.selection;

        // Find the table DOM node
        const tableNode = view.domAtPos(from).node;
        let tableElement = tableNode as HTMLElement;

        // Walk up the DOM tree to find the table element
        while (tableElement && tableElement.tagName !== 'TABLE') {
          tableElement = tableElement.parentElement as HTMLElement;
        }

        if (tableElement) {
          const tableRect = tableElement.getBoundingClientRect();
          const editorRect = view.dom.getBoundingClientRect();

          // Position toolbar above the table
          setPosition({
            top: tableRect.top - editorRect.top + 40,
            left: tableRect.left - editorRect.left + 65,
          });
        }
      }
    };

    // Update on initial mount
    updateState();

    // Subscribe to selection updates
    editor.on("selectionUpdate", updateState);
    editor.on("transaction", updateState);

    return () => {
      editor.off("selectionUpdate", updateState);
      editor.off("transaction", updateState);
    };
  }, [editor]);

  // Don't render if not in a table
  if (!editor || !isInTable) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 bg-toolbar-bg border border-toolbar-border rounded-md shadow-lg p-2 flex flex-wrap items-center gap-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: '600px',
      }}
    >
      <span className="text-xs font-medium mr-2 text-muted-foreground">Table:</span>

      {/* Row Operations */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
        className="h-7 text-xs"
        title="Add row above"
      >
        <Plus className="h-3 w-3 mr-1" />
        Row Above
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        className="h-7 text-xs"
        title="Add row below"
      >
        <Plus className="h-3 w-3 mr-1" />
        Row Below
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        className="h-7 text-xs"
        title="Delete current row"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Row
      </Button>

      <div className="w-px h-5 bg-toolbar-border mx-1" />

      {/* Column Operations */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!editor.can().addColumnBefore()}
        className="h-7 text-xs"
        title="Add column before"
      >
        <Plus className="h-3 w-3 mr-1" />
        Col Left
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
        className="h-7 text-xs"
        title="Add column after"
      >
        <Plus className="h-3 w-3 mr-1" />
        Col Right
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        className="h-7 text-xs"
        title="Delete current column"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Col
      </Button>

      <div className="w-px h-5 bg-toolbar-border mx-1" />

      {/* Cell Operations */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().mergeCells().run()}
        disabled={!canMergeCells}
        className="h-7 text-xs"
        title="Merge selected cells"
      >
        <Merge className="h-3 w-3 mr-1" />
        Merge
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().splitCell().run()}
        disabled={!canSplitCell}
        className="h-7 text-xs"
        title="Split merged cell"
      >
        <TableRowsSplit className="h-3 w-3 mr-1" />
        Split
      </Button>

      <div className="w-px h-5 bg-toolbar-border mx-1" />

      {/* Table Deletion */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Delete entire table"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Delete Table
      </Button>
    </div>
  );
}

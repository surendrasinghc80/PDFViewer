import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Trash2,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ImageToolbarProps {
    editor: any;
    imagePos: number | null;
}

export function ImageToolbar({ editor, imagePos }: ImageToolbarProps) {
    const [imageAttrs, setImageAttrs] = useState<any>(null);

    /**
     * 🔥 SINGLE SOURCE OF TRUTH
     * Always sync toolbar state from editor transactions
     */
    useEffect(() => {
        if (!editor || imagePos === null) return;

        const sync = () => {
            const node = editor.state.doc.nodeAt(imagePos);
            if (node?.type.name === 'image') {
                setImageAttrs(node.attrs);
            }
        };

        sync();
        editor.on('transaction', sync);
        return () => editor.off('transaction', sync);
    }, [editor, imagePos]);

    if (!editor || !imageAttrs || imagePos === null) return null;

    /**
     * 🔒 Always keep image selected before updating
     */
    const updateImage = (attrs: any) => {
        editor
            .chain()
            .focus()
            .setNodeSelection(imagePos)
            .updateAttributes('image', attrs)
            .run();
    };

    const rotate = () => {
        const next = ((imageAttrs.rotation || 0) + 90) % 360;
        updateImage({ rotation: next });
    };

    const flipH = () => updateImage({ flipH: !imageAttrs.flipH });
    const flipV = () => updateImage({ flipV: !imageAttrs.flipV });
    const align = (a: 'left' | 'center' | 'right') => updateImage({ alignment: a });
    const wrap = (v: string) => updateImage({ textWrap: v });

    const updateWidth = (v: string) => {
        const w = parseInt(v, 10);
        if (!isNaN(w) && w > 0) updateImage({ width: w });
    };

    const updateMargin = (v: string) => {
        const m = parseInt(v, 10);
        if (!isNaN(m) && m >= 0) updateImage({ margin: m });
    };

    const deleteImage = () => {
        editor
            .chain()
            .focus()
            .setNodeSelection(imagePos)
            .deleteSelection()
            .run();
    };

    return (
        <div className="fixed top-20 right-4 w-80 z-50 rounded-lg border bg-background shadow-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Image Settings</h3>
                <Button variant="ghost" size="icon" onClick={deleteImage}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>

            {/* Width */}
            <div className="space-y-1">
                <Label className="text-xs">Width (px)</Label>
                <Input
                    type="number"
                    value={imageAttrs.width || ''}
                    onChange={(e) => updateWidth(e.target.value)}
                    className="h-8"
                />
            </div>

            {/* Transform */}
            <div className="space-y-1">
                <Label className="text-xs">Transform</Label>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={rotate} className="flex-1">
                        <RotateCw className="h-4 w-4 mr-1" /> Rotate
                    </Button>
                    <Button size="sm" variant="outline" onClick={flipH} className="flex-1">
                        <FlipHorizontal className="h-4 w-4 mr-1" /> Flip H
                    </Button>
                    <Button size="sm" variant="outline" onClick={flipV} className="flex-1">
                        <FlipVertical className="h-4 w-4 mr-1" /> Flip V
                    </Button>
                </div>
            </div>

            {/* Alignment */}
            <div className="space-y-1">
                <Label className="text-xs">Alignment</Label>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={imageAttrs.alignment === 'left' ? 'default' : 'outline'}
                        onClick={() => align('left')}
                        className="flex-1"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant={imageAttrs.alignment === 'center' ? 'default' : 'outline'}
                        onClick={() => align('center')}
                        className="flex-1"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant={imageAttrs.alignment === 'right' ? 'default' : 'outline'}
                        onClick={() => align('right')}
                        className="flex-1"
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Text Wrapping */}
            <div className="space-y-1">
                <Label className="text-xs">Text Wrapping</Label>
                <Select value={imageAttrs.textWrap ?? 'inline'} onValueChange={wrap}>
                    <SelectTrigger className="h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inline">Inline</SelectItem>
                        <SelectItem value="wrap">Wrap Text</SelectItem>
                        {/* <SelectItem value="break">Break Text</SelectItem>
                        <SelectItem value="behind">Behind Text</SelectItem>
                        <SelectItem value="front">In Front of Text</SelectItem> */}
                    </SelectContent>
                </Select>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2">
                Rotation: {imageAttrs.rotation || 0}°
                {imageAttrs.flipH && ' | Flipped H'}
                {imageAttrs.flipV && ' | Flipped V'}
            </div>
        </div>
    );
}

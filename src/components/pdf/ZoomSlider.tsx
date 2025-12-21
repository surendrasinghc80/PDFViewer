//ZoomSlider.tsx    
import { Slider } from '@/components/ui/slider';

interface ZoomSliderProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    min?: number;
    max?: number;
}

export const ZoomSlider = ({ zoom, onZoomChange, min = 50, max = 300 }: ZoomSliderProps) => {
    const handleValueChange = (values: number[]) => {
        onZoomChange(values[0]);
    };

    return (
        <div className="zoom-slider-container fixed bottom-6 right-6 bg-toolbar-bg border border-toolbar-border rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Zoom:
                </span>
                <Slider
                    value={[zoom]}
                    onValueChange={handleValueChange}
                    min={min}
                    max={max}
                    step={10}
                    className="flex-1"
                />
                <span className="text-xs font-medium text-foreground min-w-[45px] text-right">
                    {zoom}%
                </span>
            </div>
        </div>
    );
};

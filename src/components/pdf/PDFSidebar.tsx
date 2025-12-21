//PDFSidebar.tsx
import { PDFThumbnail } from './PDFThumbnail';
import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid } from 'lucide-react';

interface PDFSidebarProps {
    file: string | File | null;
    numPages: number;
    currentPage: number;
    onPageSelect: (pageNum: number) => void;
    viewMode: 'list' | 'grid';
    onViewModeChange: (mode: 'list' | 'grid') => void;
}

export const PDFSidebar = ({
    file,
    numPages,
    currentPage,
    onPageSelect,
    viewMode,
    onViewModeChange,
}: PDFSidebarProps) => {
    if (!file || numPages === 0) {
        return null;
    }

    return (
        <div className="pdf-sidebar flex flex-col w-64 border-r border-border bg-background h-full">
            {/* Scrollable Thumbnails Area */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className={viewMode === 'list' ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
                    {Array.from({ length: numPages }, (_, index) => (
                        <PDFThumbnail
                            key={index + 1}
                            pageNumber={index + 1}
                            isActive={currentPage === index + 1}
                            onClick={onPageSelect}
                            file={file}
                        />
                    ))}
                </div>
            </div>

            {/* View Mode Toggle (Bottom) */}
            <div className="border-t border-border p-2 flex gap-2">
                <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="flex-1"
                    title="List view"
                >
                    <LayoutList className="h-4 w-4 mr-1" />
                    List
                </Button>
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="flex-1"
                    title="Grid view"
                >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Grid
                </Button>
            </div>
        </div>
    );
};

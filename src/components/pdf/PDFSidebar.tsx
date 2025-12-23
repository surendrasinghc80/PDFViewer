import { PDFThumbnail } from './PDFThumbnail';

interface PDFSidebarProps {
    file: string | File | null;
    numPages: number;
    currentPage: number;
    onPageSelect: (pageNum: number) => void;
    viewMode: 'list' | 'grid';
    className?: string;
}

export const PDFSidebar = ({
    file,
    numPages,
    currentPage,
    onPageSelect,
    viewMode,
    className = "",
}: PDFSidebarProps) => {
    if (!file || numPages === 0) {
        return null;
    }

    return (
        <div className={`pdf-sidebar flex flex-col border-r pt-14 border-border bg-background ${className}`}>
            {/* Scrollable Thumbnails Area */}
            <div className="flex-1 overflow-y-auto p-2 h-screen">
                <div className={viewMode === 'list' ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
                    {Array.from({ length: numPages }, (_, index) => (
                        <PDFThumbnail
                            key={index + 1}
                            pageNumber={index + 1}
                            isActive={currentPage === index + 1}
                            onClick={onPageSelect}
                            file={file}
                            width={viewMode === 'list' ? 190 : 100}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

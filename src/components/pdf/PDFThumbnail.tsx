//PDFThumbnail.tsx
import { Page } from 'react-pdf';

interface PDFThumbnailProps {
    pageNumber: number;
    isActive: boolean;
    onClick: (pageNum: number) => void;
    file: string | File | null;
}

export const PDFThumbnail = ({ pageNumber, isActive, onClick, file }: PDFThumbnailProps) => {
    return (
        <div
            className={`pdf-thumbnail cursor-pointer transition-all ${isActive
                ? 'ring-2 ring-primary bg-accent/20'
                : 'hover:bg-accent/10'
                }`}
            onClick={() => onClick(pageNumber)}
        >
            <div className="relative">
                <Page
                    pageNumber={pageNumber}
                    scale={0.2} // Low resolution for thumbnails
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                        <div className="flex items-center justify-center w-full h-32 bg-muted text-muted-foreground text-xs">
                            Loading...
                        </div>
                    }
                />
                <div className={`absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                    {pageNumber}
                </div>
            </div>
        </div>
    );
};

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './pdf.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PDFSidebar } from './PDFSidebar';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    file: string | File | null;
    numPages: number;
    currentPage: number;
    scale: number;
    isSidebarOpen: boolean;
    sidebarViewMode: 'list' | 'grid';
    isGridOpen: boolean;
    onNumPagesChange: (n: number) => void;
    onPageChange: (n: number) => void;
    onSidebarViewModeChange: (m: 'list' | 'grid') => void;
    onGridOpenChange: (b: boolean) => void;
    className?: string;
}

export const PDFViewer = ({
    file,
    numPages,
    currentPage,
    scale,
    isSidebarOpen,
    sidebarViewMode,
    isGridOpen,
    onNumPagesChange,
    onPageChange,
    onSidebarViewModeChange,
    onGridOpenChange,
    className = ""
}: PDFViewerProps) => {
    // Internal state removed, using props
    const [pageInput, setPageInput] = useState<string>('1');

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        onNumPagesChange(numPages);
        // Page reset handled by parent if needed, or we just init
    }

    // Scroll to page effect
    const goToPage = (page: number) => {
        onPageChange(page);
        setTimeout(() => {
            const pageElement = document.getElementById(`pdf-page-${page}`);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    function changePage(offset: number) {
        goToPage(currentPage + offset);
    }

    function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPageInput(e.target.value);
    }

    function handlePageInputSubmit(e: React.FormEvent) {
        e.preventDefault();
        const page = parseInt(pageInput);
        if (!isNaN(page)) {
            goToPage(page);
        } else {
            setPageInput(currentPage.toString());
        }
    }

    return (
        <div className={`pdf-viewer-container flex h-full bg-background ${className}`}>
            {file ? (
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-1 h-full overflow-hidden"
                    loading={
                        <div className="flex items-center justify-center flex-1 h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading PDF...</p>
                            </div>
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center flex-1 h-full">
                            <div className="text-center text-destructive">
                                <p className="font-semibold mb-2">Failed to load PDF</p>
                                <p className="text-sm">Please try another file.</p>
                            </div>
                        </div>
                    }
                >
                    {/* Left Sidebar - Collapsible with Animation */}
                    <div
                        className={`transition-[width] duration-300 ease-in-out border-r border-border bg-background shrink-0 overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}
                    >
                        <div className="w-64 h-screen">
                            {/* Fixed width inner container prevents content reflow during width transition */}
                            <PDFSidebar
                                file={file}
                                numPages={numPages}
                                currentPage={currentPage}
                                onPageSelect={goToPage}
                                viewMode={sidebarViewMode}
                                className="border-r-0"
                            />
                        </div>
                    </div>

                    {/* Grid Overview Dialog */}
                    <Dialog open={isGridOpen} onOpenChange={onGridOpenChange}>
                        {/* Trigger controlled via prop */}
                        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Page Overview ({numPages} pages)</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                <div className="grid grid-cols-4 gap-4">
                                    {Array.from({ length: numPages }, (_, index) => {
                                        const thumbPage = index + 1;
                                        return (
                                            <div
                                                key={`grid-${thumbPage}`}
                                                className={`cursor-pointer border-2 rounded hover:border-primary transition-all p-1 ${currentPage === thumbPage ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                                    }`}
                                                onClick={() => {
                                                    goToPage(thumbPage);
                                                    onGridOpenChange(false);
                                                }}
                                            >
                                                <Page
                                                    pageNumber={thumbPage}
                                                    width={150}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                                <div className="text-center mt-1 text-sm font-medium">
                                                    Page {thumbPage}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Main Viewer - Scrollable Independent */}
                    <div className="flex-1 flex flex-col min-w-0 bg-muted/30 h-full overflow-hidden">
                        {/* Top Controls - Removed/Moved to EditorToolbar */}

                        {/* PDF Document Area - Scrollable */}
                        <div className="flex-1 overflow-auto flex flex-col items-center p-8 bg-muted/30 gap-8">
                            {Array.from(new Array(numPages), (el, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    id={`pdf-page-${index + 1}`}
                                    className="pdf-page-container shadow-lg transition-transform duration-200"
                                    style={{ transformOrigin: 'top center' }}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        className="bg-white"
                                        loading={
                                            <div className="flex items-center justify-center h-[800px] w-[600px] bg-white">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                            </div>
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Document>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 p-12">
                    <p className="text-lg text-muted-foreground mb-2">No PDF file selected</p>
                    <p className="text-sm text-muted-foreground">Upload a PDF using the toolbar button</p>
                </div>
            )}
        </div>
    );
};

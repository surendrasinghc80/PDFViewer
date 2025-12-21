import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './pdf.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, LayoutGrid } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    file: string | File | null;
    className?: string;
}

export const PDFViewer = ({ file, className = "" }: PDFViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [pageInput, setPageInput] = useState<string>('1');
    const [isGridOpen, setIsGridOpen] = useState(false);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
        setPageInput('1');
    }

    function changePage(offset: number) {
        const newPage = pageNumber + offset;
        if (newPage >= 1 && newPage <= numPages) {
            setPageNumber(newPage);
            setPageInput(newPage.toString());
        }
    }

    function goToPage(page: number) {
        if (page >= 1 && page <= numPages) {
            setPageNumber(page);
            setPageInput(page.toString());
        }
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
            setPageInput(pageNumber.toString());
        }
    }

    function zoomIn() {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    }

    function zoomOut() {
        setScale(prev => Math.max(prev - 0.2, 0.5));
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
                    {/* Left Sidebar - Scrollable Independent */}
                    {numPages > 0 && (
                        <div className="pdf-sidebar w-64 border-r border-border flex flex-col bg-background shrink-0 h-full">
                            {/* Scrollable Thumbnails List */}
                            <div className="flex-1 overflow-y-auto p-2 min-h-70vh custom-scrollbar">
                                <div className="space-y-2">
                                    {Array.from({ length: numPages }, (_, index) => {
                                        const thumbPage = index + 1;
                                        return (
                                            <div
                                                key={thumbPage}
                                                className={`cursor-pointer border-2 rounded transition-all ${pageNumber === thumbPage
                                                    ? 'border-primary bg-accent/20'
                                                    : 'border-transparent hover:border-accent'
                                                    }`}
                                                onClick={() => goToPage(thumbPage)}
                                            >
                                                <div className="relative">
                                                    <Page
                                                        pageNumber={thumbPage}
                                                        width={200}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                        loading={
                                                            <div className="w-full h-24 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                                ...
                                                            </div>
                                                        }
                                                    />
                                                    <div className={`text-center py-1 text-xs font-medium ${pageNumber === thumbPage
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {thumbPage}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sidebar Footer - Grid Dialog Trigger */}
                            <div className="border-t border-border p-2">
                                <Dialog open={isGridOpen} onOpenChange={setIsGridOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <LayoutGrid className="h-4 w-4 mr-2" />
                                            Page Overview
                                        </Button>
                                    </DialogTrigger>
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
                                                            className={`cursor-pointer border-2 rounded hover:border-primary transition-all p-1 ${pageNumber === thumbPage ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                                                }`}
                                                            onClick={() => {
                                                                goToPage(thumbPage);
                                                                setIsGridOpen(false);
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
                            </div>
                        </div>
                    )}

                    {/* Main Viewer - Scrollable Independent */}
                    <div className="flex-1 flex flex-col min-w-0 bg-muted/30 h-full overflow-hidden">
                        {/* Top Controls - Fixed */}
                        <div className="pdf-controls shrink-0 p-3 flex gap-3 items-center justify-center bg-toolbar-bg border-b border-toolbar-border shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={pageNumber <= 1}
                                onClick={() => changePage(-1)}
                                className="h-9 w-9"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    className="w-16 h-9 text-center"
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    of {numPages}
                                </span>
                            </form>

                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={pageNumber >= numPages}
                                onClick={() => changePage(1)}
                                className="h-9 w-9"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <div className="h-6 w-px bg-toolbar-border mx-2" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={zoomOut}
                                disabled={scale <= 0.5}
                                className="h-9 w-9"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>

                            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                                {Math.round(scale * 100)}%
                            </span>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={zoomIn}
                                disabled={scale >= 3.0}
                                className="h-9 w-9"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* PDF Document Area - Scrollable */}
                        <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-muted/30">
                            <div className="pdf-page-container shadow-lg transition-transform duration-200" style={{ transformOrigin: 'top center' }}>
                                <Page
                                    pageNumber={pageNumber}
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

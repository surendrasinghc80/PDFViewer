import { PDFThumbnail } from './PDFThumbnail';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

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
        <Sidebar className={className} collapsible="offcanvas">
            <SidebarContent className="h-full bg-background">
                <SidebarGroup className="h-full mt-16 p-2">
                    <SidebarGroupContent className="h-full">
                        <SidebarMenu className={viewMode === 'list' ? 'space-y-2' : 'grid grid-cols-2 gap-2 pb-10'}>
                            {Array.from({ length: numPages }, (_, index) => (
                                <SidebarMenuItem key={index + 1}>
                                    <PDFThumbnail
                                        pageNumber={index + 1}
                                        isActive={currentPage === index + 1}
                                        onClick={onPageSelect}
                                        file={file}
                                        width={viewMode === 'list' ? 190 : 100}
                                    />
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

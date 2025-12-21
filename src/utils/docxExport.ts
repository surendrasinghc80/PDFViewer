import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } from "docx";
import { parseDocument } from "htmlparser2";
import { Element, Text as DomText } from "domhandler";

interface TextStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    size?: number;
}

function hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');
    return hex.toUpperCase();
}

function parseHtmlToDocx(html: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const dom = parseDocument(html);

    function processNode(node: any, currentStyle: TextStyle = {}): TextRun[] {
        const runs: TextRun[] = [];

        if (node.type === 'text') {
            const text = (node as DomText).data;
            if (text.trim()) {
                runs.push(
                    new TextRun({
                        text: text,
                        bold: currentStyle.bold,
                        italics: currentStyle.italic,
                        underline: currentStyle.underline ? {} : undefined,
                        strike: currentStyle.strike,
                        color: currentStyle.color,
                        size: currentStyle.size,
                    })
                );
            }
            return runs;
        }

        if (node.type === 'tag') {
            const element = node as Element;
            const newStyle = { ...currentStyle };

            // Update style based on tag
            switch (element.name) {
                case 'strong':
                case 'b':
                    newStyle.bold = true;
                    break;
                case 'em':
                case 'i':
                    newStyle.italic = true;
                    break;
                case 'u':
                    newStyle.underline = true;
                    break;
                case 's':
                case 'strike':
                    newStyle.strike = true;
                    break;
                case 'span':
                    // Check for inline styles
                    const style = element.attribs?.style || '';
                    const colorMatch = style.match(/color:\s*([^;]+)/);
                    if (colorMatch) {
                        const color = colorMatch[1].trim();
                        if (color.startsWith('#')) {
                            newStyle.color = hexToRgb(color);
                        }
                    }
                    const sizeMatch = style.match(/font-size:\s*(\d+)px/);
                    if (sizeMatch) {
                        newStyle.size = parseInt(sizeMatch[1]) * 2; // Convert to half-points
                    }
                    break;
            }

            // Process children
            if (element.children) {
                element.children.forEach((child: any) => {
                    runs.push(...processNode(child, newStyle));
                });
            }
        }

        return runs;
    }

    function processElement(element: Element): void {
        const tagName = element.name;

        switch (tagName) {
            case 'p':
                const pRuns = element.children?.flatMap((child: any) => processNode(child)) || [];
                const alignment = element.attribs?.style?.includes('text-align: center')
                    ? AlignmentType.CENTER
                    : element.attribs?.style?.includes('text-align: right')
                        ? AlignmentType.RIGHT
                        : element.attribs?.style?.includes('text-align: justify')
                            ? AlignmentType.JUSTIFIED
                            : AlignmentType.LEFT;

                paragraphs.push(
                    new Paragraph({
                        children: pRuns.length > 0 ? pRuns : [new TextRun("")],
                        alignment,
                    })
                );
                break;

            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                const level = parseInt(tagName[1]);
                const headingMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
                    1: HeadingLevel.HEADING_1,
                    2: HeadingLevel.HEADING_2,
                    3: HeadingLevel.HEADING_3,
                    4: HeadingLevel.HEADING_4,
                    5: HeadingLevel.HEADING_5,
                    6: HeadingLevel.HEADING_6,
                };
                const hRuns = element.children?.flatMap((child: any) => processNode(child)) || [];
                paragraphs.push(
                    new Paragraph({
                        children: hRuns.length > 0 ? hRuns : [new TextRun("")],
                        heading: headingMap[level],
                    })
                );
                break;

            case 'ul':
            case 'ol':
                element.children?.forEach((li: any) => {
                    if (li.type === 'tag' && li.name === 'li') {
                        const liRuns = li.children?.flatMap((child: any) => processNode(child)) || [];
                        paragraphs.push(
                            new Paragraph({
                                children: liRuns.length > 0 ? liRuns : [new TextRun("")],
                                bullet: tagName === 'ul' ? { level: 0 } : undefined,
                                numbering: tagName === 'ol' ? { reference: "default-numbering", level: 0 } : undefined,
                            })
                        );
                    }
                });
                break;

            case 'br':
                paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
                break;

            case 'hr':
                paragraphs.push(
                    new Paragraph({
                        children: [new TextRun("")],
                        border: {
                            bottom: {
                                color: "auto",
                                space: 1,
                                style: "single",
                                size: 6,
                            },
                        },
                    })
                );
                break;

            default:
                // Process children for other elements
                if (element.children) {
                    element.children.forEach((child: any) => {
                        if (child.type === 'tag') {
                            processElement(child as Element);
                        }
                    });
                }
                break;
        }
    }

    // Process all top-level elements
    dom.children.forEach((child: any) => {
        if (child.type === 'tag') {
            processElement(child as Element);
        }
    });

    return paragraphs.length > 0 ? paragraphs : [new Paragraph({ children: [new TextRun("")] })];
}

export async function exportToDocx(html: string, filename: string = "document.docx"): Promise<void> {
    try {
        const paragraphs = parseHtmlToDocx(html);

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: paragraphs,
                },
            ],
            numbering: {
                config: [
                    {
                        reference: "default-numbering",
                        levels: [
                            {
                                level: 0,
                                format: "decimal",
                                text: "%1.",
                                alignment: AlignmentType.LEFT,
                            },
                        ],
                    },
                ],
            },
        });

        const blob = await Packer.toBlob(doc);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting to DOCX:", error);
        throw error;
    }
}

import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const CustomImage = Image.extend({
    name: 'image',

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => {
                    const width = element.getAttribute('width');
                    return width ? parseInt(width) : null;
                },
                renderHTML: attributes => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                    };
                },
            },
            height: {
                default: null,
                parseHTML: element => {
                    const height = element.getAttribute('height');
                    return height ? parseInt(height) : null;
                },
                renderHTML: attributes => {
                    if (!attributes.height) {
                        return {};
                    }
                    return {
                        height: attributes.height,
                    };
                },
            },
            alignment: {
                default: 'left',
                parseHTML: element => element.getAttribute('data-alignment') || 'left',
                renderHTML: attributes => {
                    return {
                        'data-alignment': attributes.alignment || 'left',
                    };
                },
            },
            rotation: {
                default: 0,
                parseHTML: element => {
                    const rotation = element.getAttribute('data-rotation');
                    return rotation ? parseInt(rotation) : 0;
                },
                renderHTML: attributes => {
                    return {
                        'data-rotation': attributes.rotation || 0,
                    };
                },
            },
            flipH: {
                default: false,
                parseHTML: element => element.getAttribute('data-flip-h') === 'true',
                renderHTML: attributes => {
                    return {
                        'data-flip-h': attributes.flipH ? 'true' : 'false',
                    };
                },
            },
            flipV: {
                default: false,
                parseHTML: element => element.getAttribute('data-flip-v') === 'true',
                renderHTML: attributes => {
                    return {
                        'data-flip-v': attributes.flipV ? 'true' : 'false',
                    };
                },
            },
            textWrap: {
                default: 'inline',
                parseHTML: element => element.getAttribute('data-text-wrap') || 'inline',
                renderHTML: attributes => {
                    return {
                        'data-text-wrap': attributes.textWrap || 'inline',
                    };
                },
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setImageAlignment: (alignment: 'left' | 'center' | 'right') => ({ commands, state }) => {
                const { selection } = state;
                const node = state.doc.nodeAt(selection.from);

                if (node && node.type.name === this.name) {
                    return commands.updateAttributes(this.name, { alignment });
                }

                return false;
            },
        };
    },

    addProseMirrorPlugins() {
        let resizing = false;

        return [
            new Plugin({
                key: new PluginKey('imageResize'),
                props: {
                    decorations: (state) => {
                        const { doc, selection } = state;
                        const decorations: Decoration[] = [];

                        doc.descendants((node, pos) => {
                            if (node.type.name === this.name) {
                                const isSelected = selection.from <= pos && selection.to >= pos + node.nodeSize;

                                if (isSelected) {
                                    decorations.push(
                                        Decoration.node(pos, pos + node.nodeSize, {
                                            class: 'selected-image',
                                        })
                                    );
                                }
                            }
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                    handleDOMEvents: {
                        mousedown: (view, event) => {
                            const target = event.target as HTMLElement;

                            if (target.tagName === 'IMG') {
                                const pos = view.posAtDOM(target, 0);
                                const node = view.state.doc.nodeAt(pos);

                                if (node && node.type.name === this.name) {
                                    const rect = target.getBoundingClientRect();
                                    const clickX = event.clientX - rect.left;
                                    const clickY = event.clientY - rect.top;

                                    // Check if clicking on resize handles (corners and edges)
                                    const handleSize = 20;
                                    const isRightEdge = clickX > rect.width - handleSize;
                                    const isBottomEdge = clickY > rect.height - handleSize;
                                    const isLeftEdge = clickX < handleSize;
                                    const isTopEdge = clickY < handleSize;

                                    const isResizeHandle = isRightEdge || isBottomEdge || isLeftEdge || isTopEdge;

                                    if (isResizeHandle) {
                                        resizing = true;
                                        const startX = event.clientX;
                                        const startY = event.clientY;
                                        const startWidth = target.offsetWidth;
                                        const startHeight = target.offsetHeight;
                                        const aspectRatio = startWidth / startHeight;

                                        const onMouseMove = (e: MouseEvent) => {
                                            if (!resizing) return;

                                            let newWidth = startWidth;
                                            let newHeight = startHeight;

                                            if (isRightEdge) {
                                                const diffX = e.clientX - startX;
                                                newWidth = Math.max(50, startWidth + diffX);
                                                newHeight = newWidth / aspectRatio;
                                            } else if (isBottomEdge) {
                                                const diffY = e.clientY - startY;
                                                newHeight = Math.max(50, startHeight + diffY);
                                                newWidth = newHeight * aspectRatio;
                                            } else if (isLeftEdge) {
                                                const diffX = startX - e.clientX;
                                                newWidth = Math.max(50, startWidth + diffX);
                                                newHeight = newWidth / aspectRatio;
                                            } else if (isTopEdge) {
                                                const diffY = startY - e.clientY;
                                                newHeight = Math.max(50, startHeight + diffY);
                                                newWidth = newHeight * aspectRatio;
                                            }

                                            const transaction = view.state.tr.setNodeMarkup(pos, undefined, {
                                                ...node.attrs,
                                                width: Math.round(newWidth),
                                                height: Math.round(newHeight),
                                            });

                                            view.dispatch(transaction);
                                        };

                                        const onMouseUp = () => {
                                            resizing = false;
                                            document.removeEventListener('mousemove', onMouseMove);
                                            document.removeEventListener('mouseup', onMouseUp);
                                        };

                                        document.addEventListener('mousemove', onMouseMove);
                                        document.addEventListener('mouseup', onMouseUp);
                                        event.preventDefault();
                                        return true;
                                    }
                                }
                            }

                            return false;
                        },
                    },
                },
            }),
        ];
    },
});

export default CustomImage;


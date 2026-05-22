"use client";

import {
    Undo2,
    Redo2,
    Heading1,
    Heading2,
    Heading3,
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    CheckSquare,
    Outdent,
    Indent,
    Link2,
    Image as ImageIcon,
    Table as TableIcon,
    Code,
    Quote,
    Minus,
    MessageSquarePlus,
    Highlighter,
    Baseline,
    ChevronDown,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const COLORS = [
    "#fafafa",
    "#a1a1aa",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#f43f5e",
];

const HIGHLIGHTS = [
    "#fef08a",
    "#bbf7d0",
    "#bfdbfe",
    "#ddd6fe",
    "#fed7aa",
    "#fecaca",
    "#f5d0fe",
    "#99f6e4",
    "#fb7185",
    "#38bdf8",
    "#818cf8",
    "#c084fc",
];

const ToolbarButton = ({
    icon: Icon,
    onClick,
    isActive = false,
    disabled = false,
    tooltip,
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClick}
                disabled={disabled}
                className={cn(
                    "h-8 w-8 p-0 rounded-md transition-all",
                    isActive
                        ? "bg-zinc-800 text-violet-400"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                    disabled && "opacity-40",
                )}
            >
                <Icon className="w-4 h-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent
            side="bottom"
            className="bg-zinc-800 text-zinc-100 border-zinc-700 text-xs"
        >
            {tooltip}
        </TooltipContent>
    </Tooltip>
);

export default function Toolbar({ editor }) {
    if (!editor) return null;

    const addImage = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("/api/upload/image", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error("Upload failed");
                const data = await response.json();

                editor.chain().focus().setImage({ src: data.url }).run();
            } catch (error) {
                console.error("Image upload failed:", error);
                alert("Failed to upload image");
            }
        };

        input.click();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
    };

    return (
        <div className="h-11 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 sticky top-13 z-20 overflow-x-auto no-scrollbar gap-1">
            {/* History */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    icon={Undo2}
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    tooltip="Undo (Ctrl+Z)"
                />
                <ToolbarButton
                    icon={Redo2}
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    tooltip="Redo (Ctrl+Y)"
                />
            </div>

            <Separator
                orientation="vertical"
                className="h-6 bg-zinc-800 mx-1"
            />

            {/* Headings */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-zinc-400 hover:text-zinc-100 gap-1 text-xs"
                    >
                        {editor.isActive("heading", { level: 1 })
                            ? "Heading 1"
                            : editor.isActive("heading", { level: 2 })
                              ? "Heading 2"
                              : editor.isActive("heading", { level: 3 })
                                ? "Heading 3"
                                : "Paragraph"}
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <DropdownMenuItem
                        onClick={() =>
                            editor.chain().focus().setParagraph().run()
                        }
                        className="text-sm"
                    >
                        Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        className="text-lg font-bold"
                    >
                        Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        className="text-base font-bold"
                    >
                        Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        className="text-sm font-bold"
                    >
                        Heading 3
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator
                orientation="vertical"
                className="h-6 bg-zinc-800 mx-1"
            />

            {/* Text Formatting */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    icon={Bold}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    tooltip="Bold (Ctrl+B)"
                />
                <ToolbarButton
                    icon={Italic}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    tooltip="Italic (Ctrl+I)"
                />
                <ToolbarButton
                    icon={Underline}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    isActive={editor.isActive("underline")}
                    tooltip="Underline (Ctrl+U)"
                />
                <ToolbarButton
                    icon={Strikethrough}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    tooltip="Strikethrough"
                />
            </div>

            <Separator
                orientation="vertical"
                className="h-6 bg-zinc-800 mx-1"
            />

            {/* Color & Highlight */}
            <div className="flex items-center gap-0.5">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                editor.chain().focus().toggleCode().run()
                            }
                            isActive={editor.isActive("code")}
                            tooltip="Code"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                        >
                            <Baseline className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-2 bg-zinc-900 border-zinc-800">
                        <div className="grid grid-cols-4 gap-1">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .setColor(color)
                                            .run()
                                    }
                                    className="w-6 h-6 rounded border border-zinc-800"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <button
                                onClick={() =>
                                    editor.chain().focus().unsetColor().run()
                                }
                                className="col-span-4 text-[10px] text-zinc-400 mt-1 hover:text-zinc-100"
                            >
                                Reset color
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                        >
                            <Highlighter className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-2 bg-zinc-900 border-zinc-800">
                        <div className="grid grid-cols-4 gap-1">
                            {HIGHLIGHTS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleHighlight({ color })
                                            .run()
                                    }
                                    className="w-6 h-6 rounded border border-zinc-800"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .unsetHighlight()
                                        .run()
                                }
                                className="col-span-4 text-[10px] text-zinc-400 mt-1 hover:text-zinc-100"
                            >
                                Remove highlight
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Separator
                orientation="vertical"
                className="h-6 bg-zinc-800 mx-1"
            />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    icon={AlignLeft}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                    }
                    isActive={editor.isActive({ textAlign: "left" })}
                    tooltip="Align Left"
                />
                <ToolbarButton
                    icon={AlignCenter}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                    }
                    isActive={editor.isActive({ textAlign: "center" })}
                    tooltip="Align Center"
                />
                <ToolbarButton
                    icon={AlignRight}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                    }
                    isActive={editor.isActive({ textAlign: "right" })}
                    tooltip="Align Right"
                />
                <ToolbarButton
                    icon={AlignJustify}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("justify").run()
                    }
                    isActive={editor.isActive({ textAlign: "justify" })}
                    tooltip="Align Justify"
                />
            </div>

            <Separator
                orientation="vertical"
                className="h-6 bg-zinc-800 mx-1"
            />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    icon={List}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    isActive={editor.isActive("bulletList")}
                    tooltip="Bullet List"
                />
                <ToolbarButton
                    icon={ListOrdered}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    isActive={editor.isActive("orderedList")}
                    tooltip="Numbered List"
                />
                <ToolbarButton
                    icon={CheckSquare}
                    onClick={() =>
                        editor.chain().focus().toggleTaskList().run()
                    }
                    isActive={editor.isActive("taskList")}
                    tooltip="Task List"
                />
            </div>

            <Separator
                orientation="vertical"
                className="h-6 bg-zinc-800 mx-1"
            />

            {/* Insert */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    icon={Link2}
                    onClick={setLink}
                    isActive={editor.isActive("link")}
                    tooltip="Link (Ctrl+K)"
                />
                <ToolbarButton
                    icon={ImageIcon}
                    onClick={addImage}
                    tooltip="Image"
                />
                <ToolbarButton
                    icon={Code}
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    isActive={editor.isActive("codeBlock")}
                    tooltip="Code Block"
                />
                <ToolbarButton
                    icon={Quote}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    isActive={editor.isActive("blockquote")}
                    tooltip="Quote"
                />
                <ToolbarButton
                    icon={Minus}
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                    tooltip="Divider"
                />
            </div>
        </div>
    );
}

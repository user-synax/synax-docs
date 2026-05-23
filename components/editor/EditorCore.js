"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Blockquote } from "@tiptap/extension-blockquote";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { common, createLowlight } from "lowlight";
import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import Toolbar from "./Toolbar";
import useAutoSave from "@/hooks/useAutoSave";

const lowlight = createLowlight(common);

export default function EditorCore({
    initialContent,
    documentId,
    onEditorReady,
}) {
    const { updateCounts } = useEditorStore();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: "Start writing...",
            }),
            CharacterCount,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
            Highlight.configure({ multicolor: true }),
            Color,
            TextStyle,
            FontFamily,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Image.configure({
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Blockquote,
            HorizontalRule,
        ],
        content: initialContent || "",
        editorProps: {
            attributes: {
                class: "tiptap prose prose-invert max-w-none focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            const words = editor.storage.characterCount.words();
            const characters = editor.storage.characterCount.characters();
            updateCounts(words, characters);
        },
    });

    useEffect(() => {
        if (editor) {
            onEditorReady?.(editor);
        }
    }, [editor, onEditorReady]);

    const { saveContent } = useAutoSave(editor, documentId);

    useEffect(() => {
        if (editor && initialContent) {
            editor.commands.setContent(initialContent);
        }
    }, [editor, initialContent]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                saveContent();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [saveContent]);

    return (
        <div className="h-screen overflow-hidden bg-zinc-950 flex flex-col">
            {/* Fixed Toolbar */}
            <div className="shrink-0 border-b border-zinc-800 bg-zinc-950 z-20">
                <Toolbar editor={editor} />
            </div>

            {/* Scrollable Editor Area */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <div className="max-w-[900px] w-full mx-auto px-6 md:px-[40px] py-5 md:py-[80px] min-h-full">
                        <div className="bg-zinc-950 md:border md:border-zinc-800 md:rounded-xl md:shadow-2xl md:shadow-zinc-950 p-6 md:p-10 min-h-full">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 h-6 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-end gap-4 z-20">
                <span className="text-[10px] text-zinc-500 font-medium">
                    {editor?.storage.characterCount.words()} words
                </span>

                <span className="text-[10px] text-zinc-500 font-medium">
                    {editor?.storage.characterCount.characters()} characters
                </span>
            </div>
        </div>
    );
}

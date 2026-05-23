import { generateHTML, generateJSON } from "@tiptap/html";

import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

import Color from "@tiptap/extension-color";
import {TextStyle} from "@tiptap/extension-text-style";

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

const lowlight = createLowlight(common);

const extensions = [
    StarterKit.configure({
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        heading: {
            levels: [1, 2, 3],
        },
    }),

    TextAlign.configure({
        types: ["heading", "paragraph"],
    }),

    Underline,

    Highlight.configure({
        multicolor: true,
    }),

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
];

export function tiptapToHtml(json) {
    return generateHTML(json, extensions);
}

export function htmlToTiptap(html) {
    return generateJSON(html, extensions);
}

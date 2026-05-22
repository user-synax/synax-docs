"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";

export default function useAutoSave(editor, documentId) {
    const { setSaveStatus } = useEditorStore();
    const timeoutRef = useRef(null);

    const saveContent = useCallback(async () => {
        if (!editor || !documentId) return;

        setSaveStatus("saving");
        try {
            const response = await fetch(`/api/documents/${documentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: editor.getJSON(),
                    lastEditedAt: new Date(),
                }),
            });

            if (!response.ok) throw new Error("Failed to save");

            setSaveStatus("saved");
        } catch (error) {
            console.error("AutoSave Error:", error);
            setSaveStatus("error");
        }
    }, [editor, documentId, setSaveStatus]);

    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            setSaveStatus("idle"); // Mark as unsaved changes

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                saveContent();
            }, 3000);
        };

        editor.on("update", handleUpdate);

        // Save on beforeunload
        const handleBeforeUnload = (e) => {
            if (timeoutRef.current) {
                saveContent();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            editor.off("update", handleUpdate);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [editor, saveContent, setSaveStatus]);

    return { saveContent };
}

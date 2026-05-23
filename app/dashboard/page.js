"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, FileUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentStore } from "@/store/documentStore";
import DocumentGrid from "@/components/dashboard/DocumentGrid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const { searchQuery, setSearchQuery, fetchDocuments, createDocument } =
        useDocumentStore();

    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery]);

    useEffect(() => {
        fetchDocuments();
    }, [searchQuery, fetchDocuments]);

    const handleCreate = async () => {
        const id = await createDocument();
        if (id) {
            router.push(`/editor/${id}`);
        }
    };

    const handleImport = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".docx,.md,.markdown,.txt";

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            setIsImporting(true);
            const toastId = toast.loading("Importing document...");

            try {
                const response = await fetch("/api/documents/import", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error("Import failed");
                const data = await response.json();

                toast.success("Document imported successfully", {
                    id: toastId,
                });
                router.push(`/editor/${data.id}`);
            } catch (error) {
                console.error("Import Error:", error);
                toast.error("Failed to import document", { id: toastId });
            } finally {
                setIsImporting(false);
            }
        };

        input.click();
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
                        My Documents
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Manage and organize your collaborative files.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search documents..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-10 bg-zinc-900 border-zinc-800 focus-visible:ring-violet-500 text-zinc-300 rounded-lg h-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleCreate}
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-l-lg rounded-r-none h-10 px-4 gap-2 shadow-lg shadow-violet-900/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">
                                New Document
                            </span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-r-lg rounded-l-none h-10 px-2 shadow-lg shadow-violet-900/20 border-l border-violet-500/50">
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-zinc-900 border-zinc-800 text-zinc-300 w-48"
                            >
                                <DropdownMenuItem
                                    onClick={handleCreate}
                                    className="gap-2 focus:bg-zinc-800 focus:text-zinc-50 hover:cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> New Document
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className="gap-2 focus:bg-zinc-800 focus:text-zinc-50 hover:cursor-pointer"
                                >
                                    <FileUp
                                        className={cn(
                                            "w-4 h-4",
                                            isImporting && "animate-spin",
                                        )}
                                    />{" "}
                                    Import Document
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <DocumentGrid />
        </div>
    );
}

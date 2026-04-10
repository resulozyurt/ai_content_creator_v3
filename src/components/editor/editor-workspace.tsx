"use client";

import { useState, useEffect } from "react";
import { Content } from "@prisma/client";
import { Loader2, Save, PlayCircle, FileCheck2, Settings2, StopCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Tiptap Imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface EditorWorkspaceProps {
    initialData: Content;
}

export function EditorWorkspace({ initialData }: EditorWorkspaceProps) {
    const router = useRouter();
    const [outline, setOutline] = useState<any[] | null>(null);

    // Native Streaming States
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start writing, or let the AI Copilot generate the content...",
                emptyEditorClass: "is-editor-empty",
            }),
        ],
        content: "",
        editorProps: {
            attributes: {
                class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px]",
            },
        },
    });

    useEffect(() => {
        const savedOutline = sessionStorage.getItem(`outline_${initialData.id}`);
        if (savedOutline) {
            setOutline(JSON.parse(savedOutline));
        } else {
            router.push(`/dashboard/research/${initialData.id}`);
        }
    }, [initialData.id, router]);

    // Native Fetch Implementation for AI Streaming
    const handleStartAIGeneration = async () => {
        if (!outline) return;
        if (editor) editor.commands.clearContent();

        setIsLoading(true);
        setCompletion("");

        const controller = new AbortController();
        setAbortController(controller);

        let currentText = "";

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    keyword: initialData.targetKeyword,
                    outlineData: outline,
                }),
                signal: controller.signal,
            });

            if (!res.body) {
                throw new Error("No response body stream received.");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    // Clean Vercel AI SDK text stream artifacts (0:"...", etc.)
                    const cleanChunk = chunk.replace(/^[0-9]+:"?/gm, '').replace(/"$/gm, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    currentText += cleanChunk;
                    setCompletion(currentText);
                }
            }

            // Once the stream finishes, inject the final HTML into Tiptap
            if (editor) {
                editor.commands.setContent(currentText);
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Generation stopped by user.");
            } else {
                console.error("Native Streaming Error:", error);
                alert("An error occurred while generating the content. Check the console for details.");
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    };

    const stop = () => {
        if (abortController) {
            abortController.abort();
        }
        setIsLoading(false);
        // Force inject whatever was generated so far into the editor
        if (editor && completion) {
            editor.commands.setContent(completion);
        }
    };

    if (!outline) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] -m-6 flex overflow-hidden bg-muted/20 animate-in fade-in duration-500">

            <div className="flex-1 flex flex-col border-r border-border bg-background">

                <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/10 shrink-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">Draft</span>
                        <span>{initialData.targetKeyword}</span>
                        {isLoading && <span className="flex items-center gap-1 text-xs text-blue-500 ml-2 animate-pulse"><Loader2 className="h-3 w-3 animate-spin" /> AI is writing...</span>}
                    </div>
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <Save className="h-4 w-4" /> Save Draft
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 lg:px-24">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
                            {initialData.targetKeyword}
                        </h1>

                        {/* Safe Streaming Display Strategy */}
                        <div className="min-h-[500px]">
                            {isLoading ? (
                                <div className="prose prose-lg dark:prose-invert max-w-none opacity-60 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                    {completion || "Claude is warming up its engines..."}
                                    <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                                </div>
                            ) : (
                                <EditorContent editor={editor} />
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <div className="w-[400px] flex flex-col bg-background shrink-0">

                <div className="p-4 border-b border-border bg-muted/10 flex items-center gap-2 font-bold shrink-0">
                    <Settings2 className="h-5 w-5 text-primary" />
                    AI Copilot Panel
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    <div className="p-5 border border-border rounded-xl bg-primary/5 shadow-sm">
                        <h3 className="font-bold mb-2">Ready to Write?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Our AI is ready to generate the article chunk-by-chunk using your approved outline.
                        </p>

                        {isLoading ? (
                            <button
                                onClick={stop}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-600 font-bold rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <StopCircle className="h-4 w-4" /> Stop Generation
                            </button>
                        ) : (
                            <button
                                onClick={handleStartAIGeneration}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <PlayCircle className="h-4 w-4" /> Start Auto-Write
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <FileCheck2 className="h-4 w-4" /> Approved Outline
                        </h4>
                        <div className="space-y-2">
                            {outline.map((item, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border border-border text-sm font-medium ${item.type === 'h3' ? 'ml-6 bg-muted/10' : 'bg-background'}`}>
                                    <span className="text-xs text-primary/70 uppercase mr-2">{item.type}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
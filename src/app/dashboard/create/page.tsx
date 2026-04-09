"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Target, PenTool, GraduationCap, Leaf, TrendingUp, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { initiateContentDraft } from "@/server/actions/content.actions";

/**
 * Native English constants for content configuration.
 * These reflect the research-driven approach of the platform.
 */
const CONTENT_TYPES = [
    { id: "blog-post", label: "Blog Post", desc: "Conversational tone, story-driven" },
    { id: "guide", label: "Guide", desc: "Step-by-step instructions" },
    { id: "pillar-page", label: "Pillar Page", desc: "Comprehensive reference" },
];

const WRITING_GOALS = [
    { id: "experience", label: "Experience", icon: Target, desc: "Share firsthand knowledge" },
    { id: "research", label: "Research", icon: PenTool, desc: "Data-driven analysis" },
    { id: "teaching", label: "Teaching", icon: GraduationCap, desc: "Educate your audience" },
];

const CONTENT_DEPTHS = [
    { id: "beginner", label: "Beginner", icon: Leaf, desc: "Simple language, explain everything" },
    { id: "intermediate", label: "Intermediate", icon: TrendingUp, desc: "Standard industry concepts" },
    { id: "advanced", label: "Advanced", icon: Mountain, desc: "Complex technical details" },
];

export default function CreateContentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // State management for the generation flow
    const [contentType, setContentType] = useState(CONTENT_TYPES[0].id);
    const [keyword, setKeyword] = useState("");
    const [writingGoal, setWritingGoal] = useState("teaching");
    const [contentDepth, setContentDepth] = useState("beginner");
    const [wordCount, setWordCount] = useState("2000");

    const handleStartResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);

        // Call the server action with form data
        const result = await initiateContentDraft({
            keyword,
            contentType,
            writingGoal,
            contentDepth,
            wordCount: Number(wordCount),
        });

        if (result.success && result.contentId) {
            // Redirect to the dedicated research workspace
            router.push(`/dashboard/research/${result.contentId}`);
        } else {
            alert(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center mb-10 space-y-2">
                <h1 className="text-4xl font-serif tracking-tight">What do you want to write about?</h1>
                <p className="text-muted-foreground text-lg">
                    Our AI will analyze the SERP landscape to build your optimized outline.
                </p>
            </div>

            <form onSubmit={handleStartResearch} className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">

                <div className="p-8 border-b border-border space-y-6 bg-muted/5">
                    <div className="flex items-center justify-center gap-2 text-xl">
                        <span>I want to write a</span>
                        <select
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                            className="bg-transparent font-semibold text-primary border-b-2 border-primary/30 focus:border-primary outline-none px-1 cursor-pointer transition-colors"
                        >
                            {CONTENT_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                        <span>about</span>
                    </div>

                    <div>
                        <textarea
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Enter your target keyword or topic..."
                            className="w-full min-h-[120px] p-6 text-xl bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/30 transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="p-8 space-y-10">

                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Writing Perspective</label>
                        <div className="grid grid-cols-3 gap-4">
                            {WRITING_GOALS.map((goal) => {
                                const Icon = goal.icon;
                                const isActive = writingGoal === goal.id;
                                return (
                                    <button
                                        key={goal.id}
                                        type="button"
                                        onClick={() => setWritingGoal(goal.id)}
                                        className={cn(
                                            "flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-200",
                                            isActive
                                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                : "border-border hover:border-muted-foreground/20 hover:bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-6 w-6 mb-2" />
                                        <span className="font-semibold text-sm">{goal.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subject Depth</label>
                        <div className="grid grid-cols-3 gap-4">
                            {CONTENT_DEPTHS.map((depth) => {
                                const Icon = depth.icon;
                                const isActive = contentDepth === depth.id;
                                return (
                                    <button
                                        key={depth.id}
                                        type="button"
                                        onClick={() => setContentDepth(depth.id)}
                                        className={cn(
                                            "flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-200",
                                            isActive
                                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                : "border-border hover:border-muted-foreground/20 hover:bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-6 w-6 mb-2" />
                                        <span className="font-semibold text-sm">{depth.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-muted-foreground">TARGET WORD COUNT:</span>
                            <input
                                type="number"
                                value={wordCount}
                                onChange={(e) => setWordCount(e.target.value)}
                                className="w-28 px-4 py-2 border border-border rounded-lg bg-background text-sm font-mono focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !keyword.trim()}
                            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-md active:scale-95"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Generate Research</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            )}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
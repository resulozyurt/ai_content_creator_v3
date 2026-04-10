"use client";

import { useState, useEffect } from "react";
import { Content } from "@prisma/client";
import {
    Loader2, CheckCircle2, Search, ListTree, Target,
    Lightbulb, FileText, LayoutTemplate, ArrowRight,
    ChevronDown, ChevronUp, Plus, GripVertical, Edit2,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { executeResearchPipeline } from "@/server/actions/research.actions";

interface ResearchWorkspaceProps {
    initialData: Content;
}

const RESEARCH_STEPS = [
    { id: "intent", title: "Decoding Search Intent", icon: Target, description: "Analyzing what users are really looking for..." },
    { id: "keywords", title: "Expanding Keywords", icon: Search, description: "Gathering organic search footprint..." },
    { id: "serp", title: "Analyzing SERP", icon: ListTree, description: "Extracting competitor content architecture..." },
    { id: "questions", title: "Finding Questions", icon: Lightbulb, description: "Identifying high-value audience queries..." },
    { id: "outline", title: "Building Outline", icon: LayoutTemplate, description: "Claude Opus is generating optimal structure..." },
];

export function ResearchWorkspace({ initialData }: ResearchWorkspaceProps) {
    const router = useRouter();

    // View states
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real API Data State
    const [researchData, setResearchData] = useState<any>(null);

    // Accordion & UI state
    const [expandedSection, setExpandedSection] = useState<string | null>("outline");
    const [isGenerating, setIsGenerating] = useState(false);

    /**
     * Handles the visual progression of the loading steps.
     * Runs independently while the real API fetch happens in the background.
     */
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isComplete && !error) {
            interval = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    // Hold at the final "Building Outline" step until the AI actually finishes
                    if (prev < RESEARCH_STEPS.length - 1) return prev + 1;
                    return prev;
                });
            }, 3500); // 3.5 seconds per visual step
        }
        return () => clearInterval(interval);
    }, [isComplete, error]);

    /**
     * The actual trigger for the Backend AI Engine.
     * Fires exactly once when the component mounts.
     */
    useEffect(() => {
        async function runAIPipeline() {
            try {
                const response = await executeResearchPipeline(initialData.id);

                if (response.success && response.data) {
                    setResearchData(response.data);
                    setIsComplete(true);
                    setCurrentStepIndex(RESEARCH_STEPS.length); // Force UI to complete
                } else {
                    setError(response.error || "The AI pipeline failed to analyze the SERP.");
                    setIsComplete(true);
                }
            } catch (err) {
                console.error("Client Pipeline Error:", err);
                setError("A critical server error occurred during analysis.");
                setIsComplete(true);
            }
        }

        // Only run if we haven't fetched data yet
        if (!researchData && !error) {
            runAIPipeline();
        }
    }, [initialData.id, researchData, error]);

    const toggleSection = (section: string) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    const handleGenerateArticle = () => {
        setIsGenerating(true);

        // Save the approved outline to the browser's session storage for the Editor to pick up
        if (researchData && researchData.outline) {
            sessionStorage.setItem(`outline_${initialData.id}`, JSON.stringify(researchData.outline));
        }

        // Redirect to the actual writing environment
        router.push(`/dashboard/editor/${initialData.id}`);
    };

    const displayType = initialData.contentType.replace("-", " ");

    // ---------------------------------------------------------------------------
    // VIEW 1: LOADING ANIMATION & AI SIMULATION
    // ---------------------------------------------------------------------------
    if (!showResults) {
        return (
            <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700">
                <div className="text-center mb-12">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        Writing a {displayType} about
                    </p>
                    <h1 className="text-4xl font-serif font-bold text-foreground">
                        {initialData.targetKeyword}
                    </h1>
                </div>

                <div className="bg-background border border-border rounded-xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            {error ? (
                                <span className="text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="h-6 w-6" /> Analysis Failed
                                </span>
                            ) : isComplete ? (
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6" /> Research Complete!
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" /> Analyzing Search Landscape
                                </span>
                            )}
                        </h2>
                    </div>

                    {!error && (
                        <div className="w-full bg-muted rounded-full h-2.5 mb-10 overflow-hidden">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(Math.min(currentStepIndex, RESEARCH_STEPS.length) / RESEARCH_STEPS.length) * 100}%` }}
                            />
                        </div>
                    )}

                    {error ? (
                        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400">
                            <p className="font-bold mb-2">Engine Error:</p>
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/50 rounded-md text-sm font-medium hover:opacity-80"
                            >
                                Retry Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {RESEARCH_STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isPast = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex && !isComplete;
                                const isFuture = index > currentStepIndex && !isComplete;

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "flex items-center p-5 rounded-xl border-2 transition-all duration-500",
                                            isPast || isComplete ? "border-green-500/20 bg-green-500/5" : "",
                                            isCurrent ? "border-primary/50 bg-primary/5 shadow-sm transform scale-[1.01]" : "",
                                            isFuture ? "border-transparent bg-muted/20 opacity-40" : ""
                                        )}
                                    >
                                        <div className="flex-shrink-0 mr-5">
                                            {isPast || isComplete ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : isCurrent ? <Loader2 className="h-7 w-7 text-primary animate-spin" /> : <Icon className="h-7 w-7 text-muted-foreground" />}
                                        </div>
                                        <div>
                                            <h3 className={cn("font-bold text-lg", isPast || isComplete ? "text-foreground" : isCurrent ? "text-primary" : "text-muted-foreground")}>
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {isPast || isComplete ? "Data processed successfully." : isCurrent ? step.description : "Pending..."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {isComplete && !error && researchData && (
                        <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom-4">
                            <button
                                onClick={() => setShowResults(true)}
                                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                            >
                                Review Research Data <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------------------------
    // VIEW 2: REAL INTERACTIVE DASHBOARD (POWERED BY CLAUDE & SERPER)
    // ---------------------------------------------------------------------------
    return (
        <div className="max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-500">

            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        {displayType} Architecture
                    </p>
                    <h1 className="text-3xl font-serif font-bold text-foreground">
                        {initialData.targetKeyword}
                    </h1>
                </div>
                <div className="flex items-center gap-4 bg-muted px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium">Target Words: <span className="font-bold text-primary">{initialData.targetWordCount}</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-4">

                    {/* Intent Accordion */}
                    <div className="border border-border rounded-xl bg-background overflow-hidden">
                        <button onClick={() => toggleSection('intent')} className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3"><Target className="h-5 w-5 text-primary" /><span className="font-bold">Search Intent Analysis</span></div>
                            {expandedSection === 'intent' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                        {expandedSection === 'intent' && researchData.intent && (
                            <div className="p-5 border-t border-border space-y-4 animate-in slide-in-from-top-2">
                                {researchData.intent.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-muted/20 rounded-lg border border-border/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm">{item.type || "Intent"}</span>
                                            <span className="text-xs font-mono bg-green-500/10 text-green-600 px-2 py-1 rounded">Confidence: {item.confidence || "High"}%</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Keywords Accordion */}
                    <div className="border border-border rounded-xl bg-background overflow-hidden">
                        <button onClick={() => toggleSection('keywords')} className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3"><Search className="h-5 w-5 text-primary" /><span className="font-bold">Organic Keyword Footprint</span></div>
                            {expandedSection === 'keywords' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                        {expandedSection === 'keywords' && researchData.keywords && (
                            <div className="p-5 border-t border-border animate-in slide-in-from-top-2">
                                <div className="flex flex-wrap gap-2">
                                    {researchData.keywords.map((kw: any, idx: number) => (
                                        <span key={idx} className="px-3 py-1.5 bg-muted text-sm rounded-md border border-border">
                                            {kw.term}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Questions Accordion */}
                    <div className="border border-border rounded-xl bg-background overflow-hidden">
                        <button onClick={() => toggleSection('questions')} className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-primary" /><span className="font-bold">Audience Questions (PAA)</span></div>
                            {expandedSection === 'questions' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                        {expandedSection === 'questions' && researchData.questions && (
                            <div className="p-5 border-t border-border space-y-3 animate-in slide-in-from-top-2">
                                {researchData.questions.length > 0 ? researchData.questions.map((q: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 hover:bg-muted/20 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-border">
                                        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-0.5" />
                                        <span className="text-sm font-medium">{q}</span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground">No prominent "People Also Ask" questions found for this query.</p>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Outline Builder */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 border border-border rounded-xl bg-background shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">

                        <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-3">
                            <LayoutTemplate className="h-5 w-5 text-primary" />
                            <h2 className="font-bold text-lg">AI Generated Outline</h2>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-2">
                            {researchData.outline && researchData.outline.map((item: any, idx: number) => (
                                <div key={idx} className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border border-border bg-background group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors",
                                    item.type === 'h3' && "ml-8 bg-muted/10",
                                    item.type === 'h4' && "ml-12 bg-muted/5"
                                )}>
                                    <GripVertical className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase text-primary/70">{item.type}</span>
                                        </div>
                                        <p className="text-sm font-medium leading-snug">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 border-t border-border bg-muted/10">
                            <button
                                onClick={handleGenerateArticle}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Edit2 className="h-4 w-4" /> Start Writing</>}
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
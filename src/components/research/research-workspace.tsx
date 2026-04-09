"use client";

import { useState, useEffect } from "react";
import { Content } from "@prisma/client";
import { Loader2, CheckCircle2, Search, ListTree, Target, Lightbulb, FileText, LayoutTemplate, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interface defining the expected database model passed from the server.
 */
interface ResearchWorkspaceProps {
    initialData: Content;
}

/**
 * Core research steps mimicking the Frase.io analysis architecture.
 */
const RESEARCH_STEPS = [
    { id: "intent", title: "Decoding Search Intent", icon: Target, description: "Analyzing what users are really looking for..." },
    { id: "keywords", title: "Expanding Keywords", icon: Search, description: "Discovering related keywords with search data..." },
    { id: "serp", title: "Analyzing SERP", icon: ListTree, description: "Extracting headings from top-ranking pages..." },
    { id: "questions", title: "Finding Questions", icon: Lightbulb, description: "Discovering questions your audience is asking..." },
    { id: "gaps", title: "Identifying Gaps", icon: FileText, description: "Finding content opportunities..." },
    { id: "outline", title: "Building Outline", icon: LayoutTemplate, description: "Structuring your article in real-time..." },
];

export function ResearchWorkspace({ initialData }: ResearchWorkspaceProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    /**
     * Temporary simulation of the research API sequence.
     * Future sprint: Replace this timer with actual API calls to Serper/Claude.
     */
    useEffect(() => {
        if (currentStepIndex < RESEARCH_STEPS.length) {
            const timer = setTimeout(() => {
                setCurrentStepIndex((prev) => prev + 1);
            }, 2500); // 2.5 seconds per step for dramatic effect
            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
        }
    }, [currentStepIndex]);

    // UI formatting helpers
    const displayType = initialData.contentType.replace("-", " ");

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700">

            {/* Header Section */}
            <div className="text-center mb-12">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Writing a {displayType} about
                </p>
                <h1 className="text-4xl font-serif font-bold text-foreground">
                    {initialData.targetKeyword}
                </h1>
            </div>

            {/* Main Research Board */}
            <div className="bg-background border border-border rounded-xl p-8 shadow-sm">

                {/* Progress Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        {isComplete ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6" /> Research Complete!
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Analyzing Search Landscape
                            </span>
                        )}
                    </h2>
                    <span className="text-sm text-muted-foreground font-mono font-medium bg-muted px-3 py-1 rounded-md">
                        Step {Math.min(currentStepIndex + 1, RESEARCH_STEPS.length)} of {RESEARCH_STEPS.length}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2.5 mb-10 overflow-hidden">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(Math.min(currentStepIndex, RESEARCH_STEPS.length) / RESEARCH_STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Dynamic Steps List */}
                <div className="space-y-4">
                    {RESEARCH_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isPast = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isFuture = index > currentStepIndex;

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-center p-5 rounded-xl border-2 transition-all duration-500",
                                    isPast && "border-green-500/20 bg-green-500/5",
                                    isCurrent && "border-primary/50 bg-primary/5 shadow-sm transform scale-[1.01]",
                                    isFuture && "border-transparent bg-muted/20 opacity-40"
                                )}
                            >
                                <div className="flex-shrink-0 mr-5">
                                    {isPast ? (
                                        <CheckCircle2 className="h-7 w-7 text-green-500" />
                                    ) : isCurrent ? (
                                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                                    ) : (
                                        <Icon className="h-7 w-7 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h3 className={cn(
                                        "font-bold text-lg",
                                        isPast ? "text-foreground" : isCurrent ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm font-medium mt-1 text-muted-foreground">
                                        {isPast ? "Data extracted successfully." : isCurrent ? step.description : "Pending allocation..."}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Call to Action (Appears when complete) */}
                {isComplete && (
                    <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom-4">
                        <button className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity shadow-md">
                            Review Research Data <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome to AI Content Creator</h1>
                <p className="text-muted-foreground mt-2">
                    Start generating SEO-optimized, highly engaging articles in seconds.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Create New Content</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Use Frase-like research architecture to build perfect articles.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/create"
                        className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors w-full"
                    >
                        Start Creating
                    </Link>
                </div>
            </div>
        </div>
    );
}
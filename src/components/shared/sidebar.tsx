"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Sparkles, Settings } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Content Creator", href: "/dashboard/create", icon: Sparkles },
    { name: "My Contents", href: "/dashboard/contents", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarOpen } = useUiStore();

    return (
        <aside
            className={cn(
                "bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col hidden sm:flex",
                isSidebarOpen ? "w-64" : "w-[72px]"
            )}
        >
            <div className="h-16 flex items-center justify-center border-b border-border px-4">
                {isSidebarOpen ? (
                    <span className="font-bold text-lg tracking-tight truncate">
                        AI <span className="text-primary">Content</span>
                    </span>
                ) : (
                    <span className="font-bold text-xl text-primary">AI</span>
                )}
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 shrink-0")} />
                            {isSidebarOpen && (
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}

                            {/* Kapalıyken üzerine gelince çıkan Tooltip */}
                            {!isSidebarOpen && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
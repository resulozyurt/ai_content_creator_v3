"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon, User, LogOut, Settings } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { signOut } from "next-auth/react";

export function Topbar() {
    const { theme, setTheme } = useTheme();
    const { toggleSidebar } = useUiStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ekranda menü dışına tıklanınca dropdown kapansın
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    aria-label="Toggle Theme"
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Moon className="h-5 w-5 text-muted-foreground" />
                    )}
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all"
                    >
                        <User className="h-5 w-5 text-primary" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-border mb-1">
                                <p className="text-sm font-medium">My Account</p>
                            </div>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                                onClick={() => {
                                    /* Profile route here */
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <Settings className="h-4 w-4" /> Profile Settings
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
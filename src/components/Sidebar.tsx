import React, { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import {
    Calendar,
    Compass,
    Home,
    Settings,
    LogOut,
    LogIn,
    UserPlus,
    LayoutList,
    ShieldAlert,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const globalNav = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: LayoutList, label: "All Events", href: "/events" }, // Changed icon from Calendar to LayoutList
];

const userNav = [
    { icon: Calendar, label: "My Schedule", href: "/my-schedule" }, // Added My Schedule
];

export function Sidebar({ className }: { className?: string }) {
    // Use window.location.pathname for active state logic in a real client setup,
    // Since this component is rendered on the client (client:load), we can safely use window.
    const [activeHref, setActiveHref] = useState("/");
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isApproved, setIsApproved] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActiveHref(window.location.pathname);
        }

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data } = await supabase
                    .from("profiles")
                    .select("is_admin, is_approved")
                    .eq("id", currentUser.id)
                    .single();
                if (data) {
                    if (data.is_admin) setIsAdmin(true);
                    if (data.is_approved !== undefined)
                        setIsApproved(data.is_approved);
                }
            }
        });

        // Listen for changes on auth state (log in, log out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data } = await supabase
                    .from("profiles")
                    .select("is_admin, is_approved")
                    .eq("id", currentUser.id)
                    .single();
                if (data) {
                    if (data.is_admin) setIsAdmin(true);
                    if (data.is_approved !== undefined)
                        setIsApproved(data.is_approved);
                }
            } else {
                setIsAdmin(false);
                setIsApproved(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <>
            {user && !isApproved && (
                <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 ring-4 ring-amber-500/20">
                        <ShieldAlert className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                        Pending Approval
                    </h2>
                    <p className="text-text-secondary text-center max-w-md leading-relaxed">
                        Your account is currently under review by an
                        administrator. Please check back later or contact
                        support if you believe this is an error.
                    </p>
                    <button
                        onClick={handleSignOut}
                        className="mt-8 px-6 py-3 rounded-xl bg-surface border border-border text-white hover:bg-surface-hover font-medium flex items-center gap-2 transition-all shadow-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            )}
            <nav
                className={cn(
                    "w-64 h-screen shrink-0 border-r border-border glass flex flex-col pt-8 pb-4 px-4 sticky top-0",
                    className,
                )}
            >
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-text-primary">
                        Eventer
                    </span>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    {globalNav.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            activeHref === item.href ||
                            (item.href !== "/" &&
                                activeHref.startsWith(item.href));
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium",
                                    isActive
                                        ? "bg-primary-600 shadow-lg shadow-primary-500/20 text-white"
                                        : "text-text-secondary hover:bg-surface-hover hover:text-white",
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                        isActive
                                            ? "text-white"
                                            : "text-text-secondary group-hover:text-primary-400",
                                    )}
                                />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}

                    {user && (
                        <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-2">
                            <span className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                Your App
                            </span>
                            {userNav.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    activeHref === item.href ||
                                    (item.href !== "/" &&
                                        activeHref.startsWith(item.href));
                                return (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium",
                                            isActive
                                                ? "bg-primary-600 shadow-lg shadow-primary-500/20 text-white"
                                                : "text-text-secondary hover:bg-surface-hover hover:text-white",
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                                isActive
                                                    ? "text-white"
                                                    : "text-text-secondary group-hover:text-primary-400",
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </a>
                                );
                            })}
                            {isAdmin && (
                                <a
                                    href="/admin"
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 mt-1 rounded-xl transition-all duration-300 group font-medium",
                                        activeHref === "/admin"
                                            ? "bg-purple-600 shadow-lg shadow-purple-500/20 text-white"
                                            : "text-purple-400 hover:bg-purple-500/10 hover:text-purple-300",
                                    )}
                                >
                                    <ShieldAlert
                                        className={cn(
                                            "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                            activeHref === "/admin"
                                                ? "text-white"
                                                : "text-purple-400",
                                        )}
                                    />
                                    <span>Admin Dashboard</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto px-3 py-4 rounded-xl glass">
                    {user ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold uppercase">
                                    {user.email?.charAt(0) || "U"}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium truncate">
                                        {user.email}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        Logged in
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-400 transition-colors mt-2 px-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <a
                                href="/login"
                                className="flex-1 text-center py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover transition-colors"
                            >
                                Sign in
                            </a>
                            <a
                                href="/register"
                                className="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
                            >
                                Sign up
                            </a>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}

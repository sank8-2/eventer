import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type Profile = {
    id: string;
    full_name: string;
    is_admin: boolean;
    created_at: string;
};

export function AdminDashboard() {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                window.location.href = "/login";
            } else if (!isAdmin) {
                window.location.href = "/";
            } else {
                loadUsers();
            }
        }
    }, [authLoading, user, isAdmin]);

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary-500" />
                        Admin Dashboard
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Manage user access and approvals for the Eventer
                        platform.
                    </p>
                </div>
            </div>

            <div className="rounded-3xl border border-border glass overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50 bg-surface-hover/50 text-sm font-semibold text-text-secondary tracking-wider uppercase">
                                <th className="p-5 font-semibold">User</th>
                                <th className="p-5 font-semibold">
                                    Joined Date
                                </th>
                                <th className="p-5 font-semibold">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {profiles.map((profile) => (
                                <tr
                                    key={profile.id}
                                    className="hover:bg-surface-hover/30 transition-colors group"
                                >
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">
                                                {profile.full_name ||
                                                    "Anonymous User"}
                                            </span>
                                            <span
                                                className="text-xs text-text-secondary font-mono mt-1 w-24 truncate md:w-auto"
                                                title={profile.id}
                                            >
                                                {profile.id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-text-secondary">
                                        {new Date(
                                            profile.created_at,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="p-5">
                                        {profile.is_admin ? (
                                            <span className="inline-block px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-widest">
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2.5 py-1 rounded-md bg-surface border border-border text-text-secondary text-xs font-bold uppercase tracking-widest">
                                                User
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {profiles.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-12 text-center text-text-secondary"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

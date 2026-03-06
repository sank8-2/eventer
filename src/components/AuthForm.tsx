import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export function AuthForm({ type }: { type: "login" | "register" }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (type === "register") {
                const { data, error: signUpError } = await supabase.auth.signUp(
                    {
                        email,
                        password,
                    },
                );
                if (signUpError) throw signUpError;

                // If Supabase requires email confirmation, session will be null
                if (!data.session) {
                    setIsSuccess(true);
                } else {
                    window.location.href = "/";
                }
            } else {
                const { error: signInError } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                if (signInError) throw signInError;
                window.location.href = "/";
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full max-w-sm mx-auto p-8 rounded-3xl glass border border-border relative overflow-hidden"
        >
            {isSuccess && (
                <div className="absolute inset-0 bg-surface/95 backdrop-blur-xl z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mb-6 ring-4 ring-primary-500/10">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Check Your Email
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                        We've sent a confirmation link to{" "}
                        <strong className="text-white">{email}</strong>. Please
                        verify your email address. Once verified, an admin must
                        approve your account before you can access all features.
                    </p>
                    <a
                        href="/login"
                        className="mt-8 px-6 py-2.5 rounded-xl bg-surface border border-border text-white hover:bg-surface-hover transition-colors font-medium"
                    >
                        Back to Login
                    </a>
                </div>
            )}

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary tracking-tight mb-2">
                    {type === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-text-secondary text-sm">
                    {type === "login"
                        ? "Enter your details to access your dashboard"
                        : "Sign up to manage your personal events and wishlist"}
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-red-200">{error}</span>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-medium text-text-secondary pl-1">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-surface/50 border border-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-medium text-text-secondary pl-1">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            className="w-full bg-surface/50 border border-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-lg hover:shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : type === "login" ? (
                    "Sign In"
                ) : (
                    "Sign Up"
                )}
            </button>

            <div className="mt-4 text-center text-sm text-text-secondary">
                {type === "login" ? (
                    <p>
                        Don't have an account?{" "}
                        <a
                            href="/register"
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            Sign up
                        </a>
                    </p>
                ) : (
                    <p>
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            Sign in
                        </a>
                    </p>
                )}
            </div>
        </form>
    );
}

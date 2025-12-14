"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Smile, User, ChevronLeft, MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useTournament } from "@/hooks/useTournament";
import Link from "next/link";

const CUSTOM_EMOJIS = [
    { code: ":burger:", char: "🍔", label: "Burger" },
    { code: ":curry:", char: "🍛", label: "Curry" },
    { code: ":fries:", char: "🍟", label: "Fries" },
    { code: ":drink:", char: "🥤", label: "Drink" },
    { code: ":soccer:", char: "⚽", label: "Goal" },
    { code: ":fire:", char: "🔥", label: "Fire" },
    { code: ":trophy:", char: "🏆", label: "Win" },
    { code: ":goat:", char: "🐐", label: "GOAT" },
];

export function StreamChat() {
    const { messages, sendMessage, username, setChatName } = useChat();
    const { settings } = useTournament();

    // UI State
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [input, setInput] = useState("");
    const [showEmojis, setShowEmojis] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Anti-spam State
    const lastMessageRef = useRef<string>("");
    const lastTimeRef = useRef<number>(0);
    const [cooldown, setCooldown] = useState(0);

    // Auto-collapse on mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsCollapsed(true);
        }
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isCollapsed]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        // Anti-spam: Duplicate check
        if (trimmed === lastMessageRef.current) {
            alert("Please don't repeat the same message.");
            return;
        }

        // Anti-spam: Cooldown (3 seconds)
        const now = Date.now();
        if (now - lastTimeRef.current < 3000) {
            return; // Should be handled by UI state, but double check
        }

        sendMessage(trimmed);
        setInput("");
        setShowEmojis(false);
        lastMessageRef.current = trimmed;
        lastTimeRef.current = now;
        setCooldown(3);
    };

    const insertEmoji = (emoji: string) => {
        setInput((prev) => prev + " " + emoji + " ");
    };

    if (settings.status === 'finished') {
        // ... (existing finished state)
        return (
            <div className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col items-center justify-center border-r border-white/10 bg-black/60 backdrop-blur-xl text-center transition-all duration-500 ${isCollapsed ? "w-16" : "w-full sm:w-80 p-6"}`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                    {isCollapsed ? <MessageSquare className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>

                {!isCollapsed && (
                    <>
                        <div className="rounded-full bg-zinc-800 p-4 mb-4">
                            <User className="h-8 w-8 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Chat Closed</h3>
                        <p className="text-zinc-400 mt-2">Tournament finished.</p>
                    </>
                )}
            </div>
        )
    }

    // Minimized State (Bubble)
    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="fixed left-4 bottom-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition hover:scale-110 hover:bg-amber-400 animate-in zoom-in"
                title="Open Chat"
            >
                <div className="relative">
                    <MessageSquare className="h-6 w-6 text-black" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-black animate-pulse" />
                </div>
            </button>
        );
    }

    const { registrations } = useTournament();

    // Auth State
    const [authStep, setAuthStep] = useState<'email' | 'username'>('email');
    const [emailInput, setEmailInput] = useState("");
    const [authError, setAuthError] = useState("");

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");

        const email = emailInput.trim().toLowerCase();
        if (!email) return;

        const isRegistered = registrations.some(p => p.email.toLowerCase() === email);

        if (isRegistered) {
            setAuthStep('username');
        } else {
            setAuthError("Email not found. You must register for the tournament or waitlist to chat.");
        }
    };

    const handleUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameInput.trim()) setChatName(nameInput);
    };

    if (!username) {
        return (
            <div className="fixed left-0 top-0 bottom-0 z-30 w-full sm:w-80 flex flex-col items-center justify-center border-r border-white/10 bg-black/60 p-6 backdrop-blur-xl animate-in slide-in-from-left duration-500 hover:bg-black/70 transition-colors">
                <div className="w-full max-w-xs space-y-4 text-center relative">
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="absolute -top-4 -right-4 text-zinc-500 hover:text-white p-2"
                        title="Minimize"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <User className="h-8 w-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black uppercase italic text-white">Join the Chat</h3>

                    {authStep === 'email' ? (
                        <>
                            <p className="text-xs text-zinc-400">Enter your registration email to verify access.</p>
                            <form onSubmit={handleEmailSubmit} className="space-y-2">
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="Enter your email..."
                                    className="w-full rounded-xl border border-zinc-700 bg-black/50 px-4 py-2 text-sm font-bold text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                                />
                                {authError && <p className="text-[10px] font-bold text-red-500 leading-tight">{authError}</p>}
                                <button
                                    type="submit"
                                    disabled={!emailInput.trim()}
                                    className="w-full rounded-xl bg-amber-500 py-2 font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
                                >
                                    Verify Email
                                </button>
                                <div className="pt-2">
                                    <Link href="/register" className="text-xs text-amber-500 hover:underline">
                                        Not registered? Sign up here
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-zinc-400">Verified! Choose a display name for the chat.</p>
                            <form onSubmit={handleUsernameSubmit} className="space-y-2">
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="Username..."
                                    className="w-full rounded-xl border border-zinc-700 bg-black/50 px-4 py-2 font-bold text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                                    maxLength={15}
                                />
                                <button
                                    type="submit"
                                    disabled={!nameInput.trim()}
                                    className="w-full rounded-xl bg-amber-500 py-2 font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
                                >
                                    Join Chat
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setAuthStep('email'); setAuthError(""); }}
                                    className="text-xs text-zinc-500 hover:text-white"
                                >
                                    Back
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed left-0 top-0 bottom-0 z-30 flex w-full sm:w-80 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md animate-in slide-in-from-left duration-700">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-white/5 px-4 bg-black/20">
                <div className="flex items-center space-x-2">
                    <h3 className="font-black uppercase italic tracking-wider text-white">
                        <span className="text-amber-500">Live</span> Chat
                    </h3>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                </div>
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                    title="Minimize Chat"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="py-10 text-center text-xs text-zinc-500 italic">
                        No messages yet. Say hi! 👋
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className="animate-in slide-in-from-left-2 fade-in duration-300">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-xs font-bold text-zinc-500" style={{ color: stringToColor(msg.user) }}>
                                {msg.user}
                            </span>
                            <span className="text-[10px] text-zinc-600">
                                {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                        <p className="mt-0.5 break-words text-sm font-medium text-white/90 leading-relaxed shadow-sm">
                            {formatMessage(msg.text)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="border-t border-white/5 bg-black/40 p-4">
                <form onSubmit={handleSend} className="relative">
                    <div className="relative flex items-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800 focus-within:ring-amber-500 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowEmojis(!showEmojis)}
                            className="p-2 text-zinc-500 hover:text-amber-500 transition"
                        >
                            <Smile className="h-5 w-5" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Send a message..."}
                            disabled={cooldown > 0}
                            className="flex-1 bg-transparent py-2 text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            maxLength={200}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || cooldown > 0}
                            className="p-2 text-amber-500 hover:text-amber-400 disabled:opacity-50 transition"
                        >
                            {cooldown > 0 ? (
                                <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">{cooldown}</span>
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojis && (
                        <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-4 gap-2">
                                {CUSTOM_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji.code}
                                        type="button"
                                        onClick={() => insertEmoji(emoji.char)}
                                        className="rounded hover:bg-zinc-800 py-1 text-xl transition transform hover:scale-110"
                                        title={emoji.label}
                                    >
                                        {emoji.char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

// Helpers
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

const formatMessage = (text: string) => {
    // Simple text renderer, emojis are already chars
    // We could add sophisticated parsing here if we used :codes: instead of chars directly
    return text;
}

"use client";

import { useRef, useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { useTournament } from "@/hooks/useTournament";
import { Match, RegisteredPlayer } from "@/lib/types";

export function LiveBracket() {
    const { bracket, isLoaded, registrations, settings } = useTournament();
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    const getPlayer = (id: string | null) => registrations.find(p => p.id === id) || null;

    // Timer Logic
    useEffect(() => {
        if (!settings.timerEndTime) {
            if (timeLeft !== null) setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = (settings.timerEndTime || 0) - now;

            if (diff <= 0) {
                setTimeLeft("00:00");
                clearInterval(interval);
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [settings.timerEndTime, timeLeft]);

    // Find current champion
    const totalRounds = Math.log2(settings.maxPlayers);
    const finalMatch = bracket.find(m => m.round === totalRounds);
    const activeChampion = getPlayer(finalMatch?.winnerId || null);

    useEffect(() => {
        if (activeChampion) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: NodeJS.Timeout = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [activeChampion]);

    if (!isLoaded) return null;

    if (bracket.length === 0) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-6 text-center">
                <div className="rounded-full bg-zinc-900 p-8 shadow-[0_0_50px_rgba(251,191,36,0.1)]">
                    <Trophy className="h-24 w-24 text-zinc-800" />
                </div>
                <h2 className="text-3xl font-black uppercase text-zinc-700">No Tournament Active</h2>
                <p className="max-w-md text-zinc-500">Wait for the admin to start the tournament.</p>
            </div>
        );
    }

    // Champion View
    if (activeChampion) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 animate-in zoom-in duration-700">
                <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
                    <div className="relative h-64 w-64 overflow-hidden rounded-full border-8 border-amber-500 shadow-[0_0_100px_rgba(245,158,11,0.5)]">
                        <img src={activeChampion.photo} alt={activeChampion.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 rounded-full bg-amber-500 px-6 py-2 shadow-lg whitespace-nowrap">
                        <Trophy className="h-6 w-6 text-black fill-black" />
                        <span className="font-black uppercase text-black">Champion</span>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl">{activeChampion.name}</h1>
                    <p className="text-2xl font-bold text-amber-500">{settings.tournamentName}</p>
                </div>

                {settings.status === 'finished' && (
                    <div className="mt-8 rounded-2xl bg-zinc-900/80 p-6 text-center backdrop-blur-md animate-in slide-in-from-bottom-6">
                        <h3 className="text-xl font-bold text-white">🏆 Tournament Finished!</h3>
                        <p className="mt-2 text-zinc-400">
                            The next tournament will be on <span className="text-amber-500 font-bold">Next Monday</span>.
                            <br />
                            Join the waitlist to secure your spot!
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-8">
                    {/* Stats or just decorative */}
                </div>
            </div>
        );
    }

    // Bracket View
    const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1).map(r => {
        let name = `Round ${r}`;
        if (r === totalRounds) name = "Final";
        else if (r === totalRounds - 1) name = "Semi Finals";
        else if (r === totalRounds - 2) name = "Quarter Finals";
        else if (r === totalRounds - 3) name = "Round of 16";

        return {
            id: r,
            name,
            matches: bracket.filter(m => m.round === r).sort((a, b) => a.position - b.position)
        };
    });

    return (
        <div className="space-y-6">
            {/* Timer Banner */}
            {timeLeft && (
                <div className="sticky top-20 z-40 mx-auto w-max animate-in slide-in-from-top-4">
                    <div className="flex items-center space-x-3 rounded-full border border-amber-500/50 bg-black/80 px-6 py-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md">
                        <Clock className="h-5 w-5 animate-pulse text-amber-500" />
                        <div className="flex flex-col text-center sm:text-left">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Round Ends In</span>
                            <span className="font-mono text-xl font-black text-white">{timeLeft}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full overflow-x-auto pb-12">
                <div className="min-w-[1000px] flex justify-between">
                    {rounds.map((round) => (
                        <div key={round.id} className="flex-1 flex flex-col min-w-[240px] px-4">
                            <div className="mb-6 flex items-center justify-center space-x-2 border-b border-zinc-800 pb-4">
                                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">{round.name}</span>
                            </div>

                            <div className="flex flex-1 flex-col justify-around relative">
                                {round.matches.map((match) => (
                                    <MatchCard key={match.id} match={match} getPlayer={getPlayer} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { Clock } from "lucide-react";

function MatchCard({ match, getPlayer }: { match: Match, getPlayer: (id: string | null) => RegisteredPlayer | null }) {
    const player1 = getPlayer(match.player1Id);
    const player2 = getPlayer(match.player2Id);

    return (
        <div className="relative mb-4 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg overflow-hidden last:mb-0">
            {/* Player 1 */}
            <div className={`relative flex items-center justify-between p-3 transition-colors ${match.winnerId === match.player1Id && match.player1Id ? "bg-gradient-to-r from-green-900/40 to-transparent" : "bg-black/20"}`}>
                <div className="flex items-center space-x-3 overflow-hidden">
                    {player1 ? (
                        <>
                            <div className={`h-8 w-8 rounded-full overflow-hidden ring-2 ${match.winnerId === player1.id ? "ring-green-500" : "ring-zinc-700"}`}>
                                <img src={player1.photo} alt={player1.name} className="h-full w-full object-cover" />
                            </div>
                            <span className={`truncate text-sm font-bold ${match.winnerId === player1.id ? "text-white" : "text-zinc-400"}`}>
                                {player1.name}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs italic text-zinc-600 pl-3">TBD</span>
                    )}
                </div>
                {match.winnerId === match.player1Id && match.player1Id && (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                )}
            </div>

            {/* VS Divider or Border */}
            <div className="h-px w-full bg-zinc-800" />

            {/* Player 2 */}
            <div className={`relative flex items-center justify-between p-3 transition-colors ${match.winnerId === match.player2Id && match.player2Id ? "bg-gradient-to-r from-green-900/40 to-transparent" : "bg-black/20"}`}>
                <div className="flex items-center space-x-3 overflow-hidden">
                    {player2 ? (
                        <>
                            <div className={`h-8 w-8 rounded-full overflow-hidden ring-2 ${match.winnerId === player2.id ? "ring-green-500" : "ring-zinc-700"}`}>
                                <img src={player2.photo} alt={player2.name} className="h-full w-full object-cover" />
                            </div>
                            <span className={`truncate text-sm font-bold ${match.winnerId === player2.id ? "text-white" : "text-zinc-400"}`}>
                                {player2.name}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs italic text-zinc-600 pl-3">TBD</span>
                    )}
                </div>
                {match.winnerId === match.player2Id && match.player2Id && (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                )}
            </div>
        </div>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    )
}

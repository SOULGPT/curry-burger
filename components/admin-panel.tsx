"use client";

import { useState } from "react";
import { Lock, Trophy, Trash2, Play, RotateCcw, Clock, Settings2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useTournament } from "@/hooks/useTournament";
import { generateBracket, advanceWinner } from "@/lib/tournament-logic";
import { Match } from "@/lib/types";

export function AdminPanel() {
    const { registrations, bracket, settings, storage, isLoaded } = useTournament();
    const { clearChat } = useChat();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [timerMinutes, setTimerMinutes] = useState(5);

    // Tabs
    const [activeTab, setActiveTab] = useState<"control" | "players">("control");

    if (!isLoaded) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "Paky281018") {
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Invalid password");
        }
    };

    const startTournament = () => {
        if (confirm(`Start tournament with ${settings.maxPlayers} players? This will generate a new bracket.`)) {
            const newBracket = generateBracket(registrations, settings.maxPlayers);
            storage.saveBracket(newBracket);
            storage.saveSettings({ ...settings, status: 'active' });
        }
    };

    const updateMaxPlayers = (n: number) => {
        storage.saveSettings({ ...settings, maxPlayers: n });
    };

    const startTimer = () => {
        const endTime = Date.now() + timerMinutes * 60 * 1000;
        storage.saveSettings({ ...settings, timerEndTime: endTime });
    };

    const resetTimer = () => {
        storage.saveSettings({ ...settings, timerEndTime: null });
    };

    const resetTournament = () => {
        if (confirm("Reset everything? This will clear all players and matches!")) {
            storage.resetTournament();
            storage.saveSettings({ ...settings, status: 'open', timerEndTime: null });
        }
    };

    const setMatchWinner = (match: Match, winnerId: string | null) => {
        if (!winnerId) return;
        const newBracket = advanceWinner(bracket, match.id, winnerId);
        storage.saveBracket(newBracket);
    };

    const declareChampion = () => {
        const finalMatch = bracket.find(m => m.round === Math.log2(settings.maxPlayers));
        const championId = finalMatch?.winnerId;
        const champion = registrations.find(p => p.id === championId);

        if (champion) {
            if (confirm(`Declare ${champion.name} as Champion?`)) {
                storage.saveChampion({
                    id: crypto.randomUUID(),
                    name: champion.name,
                    photo: champion.photo,
                    date: new Date().toISOString(),
                    tournamentName: settings.tournamentName
                });
                storage.saveSettings({ ...settings, status: 'finished' });
                clearChat(); // Clear chat history
                alert("Champion saved to Hall of Fame!");
            }
        } else {
            alert("Final match not finished yet.");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center">
                <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-amber-500/20 text-amber-500">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h2 className="mb-6 text-2xl font-bold">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Password"
                            className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-center text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-sm font-bold text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-amber-500 py-3 font-bold text-black hover:bg-amber-400"
                        >
                            Unlock Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Groups matches by round
    const totalRounds = Math.log2(settings.maxPlayers);
    const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);
    const matchesByRound = rounds.map(r => bracket.filter(m => m.round === r).sort((a, b) => a.position - b.position));

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase text-white">Admin Panel</h1>
                    <p className="text-zinc-400">Manage tournament flow</p>
                </div>
                <div className="flex items-center space-x-2 rounded-lg bg-zinc-900 p-1">
                    <button
                        onClick={() => setActiveTab("control")}
                        className={`rounded-md px-4 py-2 text-sm font-bold transition-all ${activeTab === "control" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Bracket Control
                    </button>
                    <button
                        onClick={() => setActiveTab("players")}
                        className={`rounded-md px-4 py-2 text-sm font-bold transition-all ${activeTab === "players" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Players ({registrations.length})
                    </button>
                    {activeTab === "players" && (
                        <button
                            onClick={() => window.print()}
                            className="ml-2 rounded-md bg-zinc-800 px-3 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white"
                            title="Print / Save as PDF"
                        >
                            <Settings2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </header>

            {activeTab === "control" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Settings */}
                    <div className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold uppercase text-zinc-500">
                                <Settings2 className="h-4 w-4" />
                                <span>Tournament Size</span>
                            </label>
                            <div className="flex space-x-2">
                                {[8, 16, 32].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => updateMaxPlayers(n)}
                                        className={`flex-1 rounded-lg border px-4 py-2 font-bold transition ${settings.maxPlayers === n
                                            ? "border-amber-500 bg-amber-500/10 text-amber-500"
                                            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            }`}
                                    >
                                        {n} Players
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold uppercase text-zinc-500">
                                <Clock className="h-4 w-4" />
                                <span>Round Timer</span>
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center rounded-lg border border-zinc-700 bg-black p-1">
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={timerMinutes}
                                        onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 5)}
                                        className="w-16 bg-transparent px-2 text-center font-bold text-white focus:outline-none"
                                    />
                                    <span className="pr-3 text-xs text-zinc-500">min</span>
                                </div>
                                {(settings.timerEndTime ?? 0) > Date.now() ? (
                                    <button
                                        onClick={resetTimer}
                                        className="rounded-lg bg-red-900/20 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-900/40"
                                    >
                                        Stop Timer
                                    </button>
                                ) : (
                                    <button
                                        onClick={startTimer}
                                        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700"
                                    >
                                        Start Timer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <button
                            onClick={startTournament}
                            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-green-900/50 bg-green-900/20 p-6 transition hover:bg-green-900/30"
                        >
                            <Play className="mb-2 h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-green-400">Start Tournament</span>
                            <span className="text-xs text-green-500/60">Generate Bracket</span>
                        </button>
                        <button
                            onClick={declareChampion}
                            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-amber-900/50 bg-amber-900/20 p-6 transition hover:bg-amber-900/30"
                        >
                            <Trophy className="mb-2 h-8 w-8 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-amber-500">Declare Champion</span>
                            <span className="text-xs text-amber-500/60">Save to History</span>
                        </button>
                        <button
                            onClick={resetTournament}
                            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-red-900/50 bg-red-900/20 p-6 transition hover:bg-red-900/30"
                        >
                            <RotateCcw className="mb-2 h-8 w-8 text-red-500 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-red-500">Reset All</span>
                            <span className="text-xs text-red-500/60">Clear Data</span>
                        </button>
                    </div>

                    {/* Bracket Overview */}
                    {bracket.length > 0 ? (
                        <div className="space-y-6 overflow-x-auto pb-4">
                            <div className="min-w-[800px] flex space-x-6">
                                {rounds.map((round, rIndex) => (
                                    <div key={round} className="flex-1 space-y-4">
                                        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-zinc-500 pb-2 border-b border-zinc-800">
                                            {round === Math.log2(settings.maxPlayers) ? "Final" : `Round ${round}`}
                                        </h3>
                                        <div className="space-y-4 flex flex-col justify-around h-full">
                                            {matchesByRound[rIndex]?.map((match) => {
                                                const player1 = registrations.find(p => p.id === match.player1Id);
                                                const player2 = registrations.find(p => p.id === match.player2Id);

                                                return (
                                                    <div key={match.id} className="relative flex flex-col rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-xs">
                                                        <div className="absolute -left-3 top-1/2 flex -translate-y-1/2 flex-col gap-0.5 text-[8px] text-zinc-600 font-mono">
                                                            <span>R{match.round}</span>
                                                            <span>M{match.position}</span>
                                                        </div>
                                                        {/* Player 1 */}
                                                        <button
                                                            onClick={() => player1 && setMatchWinner(match, player1.id)}
                                                            className={`flex items-center space-x-2 rounded mb-1 p-1 hover:bg-zinc-700 transition ${match.winnerId === match.player1Id && match.player1Id ? "bg-green-900/30 ring-1 ring-green-500" : ""}`}
                                                        >
                                                            {player1 ? (
                                                                <>
                                                                    <img src={player1.photo} alt={player1.name} className="h-6 w-6 rounded-full object-cover" />
                                                                    <span className={`truncate ${match.winnerId === player1.id ? "font-bold text-green-400" : ""}`}>{player1.name}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-zinc-600 italic px-2">Waiting...</span>
                                                            )}
                                                        </button>

                                                        {/* Player 2 */}
                                                        <button
                                                            onClick={() => player2 && setMatchWinner(match, player2.id)}
                                                            className={`flex items-center space-x-2 rounded p-1 hover:bg-zinc-700 transition ${match.winnerId === match.player2Id && match.player2Id ? "bg-green-900/30 ring-1 ring-green-500" : ""}`}
                                                        >
                                                            {player2 ? (
                                                                <>
                                                                    <img src={player2.photo} alt={player2.name} className="h-6 w-6 rounded-full object-cover" />
                                                                    <span className={`truncate ${match.winnerId === player2.id ? "font-bold text-green-400" : ""}`}>{player2.name}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-zinc-600 italic px-2">Waiting...</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
                            No bracket generated. Add players and click Start Tournament.
                        </div>
                    )}
                </div>
            )}

            {activeTab === "players" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Active Players */}
                    <div>
                        <h2 className="mb-4 text-xl font-bold text-white flex items-center space-x-2">
                            <span>Active Players</span>
                            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-500">
                                {registrations.filter(p => !p.isWaitlist).length} / {settings.maxPlayers}
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {registrations.filter(p => !p.isWaitlist).map(player => (
                                <div key={player.id} className="flex items-center space-x-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                                    <img src={player.photo} alt={player.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-zinc-800" />
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="truncate font-bold text-white">{player.name}</h3>
                                        <div className="flex flex-col text-xs text-zinc-500">
                                            <span>{player.phone}</span>
                                            <span className="truncate">{player.email}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            storage.saveRegistration({ ...player, isWaitlist: true });
                                        }}
                                        className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-amber-500/20 hover:text-amber-500"
                                        title="Move to Waitlist"
                                    >
                                        <Clock className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm("Kick player?")) storage.removeRegistration(player.id);
                                        }}
                                        className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-500"
                                        title="Kick"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            {registrations.filter(p => !p.isWaitlist).length === 0 && (
                                <div className="col-span-full rounded-xl border border-dashed border-zinc-800 py-8 text-center text-zinc-500">
                                    No active players yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Waitlist Players */}
                    {registrations.some(p => p.isWaitlist) && (
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-white flex items-center space-x-2">
                                <span>Waitlist</span>
                                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-500">
                                    {registrations.filter(p => p.isWaitlist).length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {registrations.filter(p => p.isWaitlist).map(player => (
                                    <div key={player.id} className="relative flex items-center space-x-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 opacity-75 hover:opacity-100 transition-opacity">
                                        <div className="absolute top-2 right-2 rounded bg-amber-900/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-500">
                                            Waitlist
                                        </div>
                                        <img src={player.photo} alt={player.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-zinc-800 grayscale" />
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="truncate font-bold text-white">{player.name}</h3>
                                            <div className="flex flex-col text-xs text-zinc-500">
                                                <span>{player.phone}</span>
                                                <span className="truncate">{player.email}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                storage.saveRegistration({ ...player, isWaitlist: false });
                                            }}
                                            className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-green-500/20 hover:text-green-500"
                                            title="Move to Spot"
                                        >
                                            <Trophy className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Remove user from waitlist?")) storage.removeRegistration(player.id);
                                            }}
                                            className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-500"
                                            title="Remove"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

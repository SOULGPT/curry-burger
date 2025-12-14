"use client";

import { Crown } from "lucide-react";
import { useTournament } from "@/hooks/useTournament";

export function PastChampions() {
    const { champions, isLoaded } = useTournament();

    if (!isLoaded) return null;

    if (champions.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center text-zinc-500">
                <Crown className="h-16 w-16 opacity-20" />
                <p>No champions yet. Will you be the first?</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {champions.map((champ, index) => {
                const isLatest = index === 0; // Assuming newest is first (unshifted in storage)

                return (
                    <div
                        key={champ.id}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                    >
                        {isLatest && (
                            <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-amber-500 px-3 py-1 text-xs font-black uppercase text-black shadow-lg">
                                Latest Champion
                            </div>
                        )}

                        <div className="aspect-square w-full overflow-hidden">
                            <img
                                src={champ.photo}
                                alt={champ.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center space-x-2 text-amber-500 mb-1">
                                <Crown className="h-4 w-4 fill-amber-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">{new Date(champ.date).toLocaleDateString()}</span>
                            </div>
                            <h2 className="text-2xl font-black uppercase italic text-white">{champ.name}</h2>
                            <p className="text-sm text-zinc-400">{champ.tournamentName || "Monday FC"}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

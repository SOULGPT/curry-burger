"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { RegisteredPlayer, Match, Champion, TournamentSettings } from "@/lib/types";

export function useTournament() {
    // Initialize with empty/default to avoid hydration mismatch, then load in useEffect
    const [registrations, setRegistrations] = useState<RegisteredPlayer[]>([]);
    const [bracket, setBracket] = useState<Match[]>([]);
    const [champions, setChampions] = useState<Champion[]>([]);
    const [settings, setSettings] = useState<TournamentSettings>(storage.getSettings()); // Safe to call (returns default if SSR)
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const load = () => {
            setRegistrations(storage.getRegistrations());
            setBracket(storage.getBracket());
            setChampions(storage.getChampions());
            setSettings(storage.getSettings());
            setIsLoaded(true);
        };

        load();

        const handleStorageChange = () => {
            load();
        };

        // Listen for cross-tab changes
        window.addEventListener("storage", handleStorageChange);
        // Listen for same-tab changes (dispatching custom event in storage.ts)
        window.addEventListener("storage_local", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("storage_local", handleStorageChange);
        };
    }, []);

    return {
        registrations,
        bracket,
        champions,
        settings,
        isLoaded,
        storage, // Access to actions
    };
}

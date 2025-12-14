"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { storage } from "@/lib/storage";
import { RegisteredPlayer, Match, Champion, TournamentSettings } from "@/lib/types";

// Default/Initial empty state
const INITIAL_SETTINGS = storage.getSettings();

export function useTournament() {
    const [registrations, setRegistrations] = useState<RegisteredPlayer[]>([]);
    const [bracket, setBracket] = useState<Match[]>([]);
    const [champions, setChampions] = useState<Champion[]>([]);
    const [settings, setSettings] = useState<TournamentSettings>(INITIAL_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Sync with Firestore
    useEffect(() => {
        if (!db) return;

        const docRef = doc(db, "tournament", "data");

        // Listen for real-time updates
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRegistrations(data.registrations || []);
                setBracket(data.bracket || []);
                setChampions(data.champions || []);
                setSettings(data.settings || INITIAL_SETTINGS);
            } else {
                // If doc doesn't exist yet, initialize it with current local defaults
                setDoc(docRef, {
                    registrations: [],
                    bracket: [],
                    champions: [],
                    settings: INITIAL_SETTINGS
                });
            }
            setIsLoaded(true);
        });

        return () => unsubscribe();
    }, []);

    // Helper to push updates to Firestore
    const pushUpdate = async (newData: any) => {
        if (!db) return;
        const docRef = doc(db, "tournament", "data");
        // Merge with existing data
        await setDoc(docRef, newData, { merge: true });
    };

    // Actions that replace 'storage' methods
    // We wrap them to update Firestore state
    const actions = {
        saveSettings: (newSettings: TournamentSettings) => pushUpdate({ settings: newSettings }),

        saveRegistrations: (newRegs: RegisteredPlayer[]) => pushUpdate({ registrations: newRegs }),

        saveBracket: (newBracket: Match[]) => pushUpdate({ bracket: newBracket }),

        saveChampions: (newChamps: Champion[]) => pushUpdate({ champions: newChamps }),

        resetTournament: async () => {
            // Keep waitlist but clear active
            const waitlistedPlayers = registrations.filter(p => p.isWaitlist).map(p => ({
                ...p,
                isWaitlist: false,
                registeredAt: new Date().toISOString()
            }));

            await pushUpdate({
                registrations: waitlistedPlayers,
                bracket: []
                // Champions and Settings are preserved by not including them in this overwrite? 
                // Wait, merge:true means they stay. If we want to clear bracket, we pass empty array. Correct.
            });
        }
    };

    return {
        registrations,
        bracket,
        champions,
        settings,
        isLoaded,
        storage: { ...storage, ...actions } // Override local storage methods with Firestore ones
    };
}

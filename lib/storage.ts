import { RegisteredPlayer, Match, Champion, TournamentSettings } from "./types";

const KEYS = {
    REGISTRATIONS: "tournament_registrations",
    BRACKET: "tournament_bracket",
    CHAMPIONS: "tournament_champions",
    SETTINGS: "tournament_settings",
};

const DEFAULT_SETTINGS: TournamentSettings = {
    maxPlayers: 16,
    tournamentName: "Monday FC 26",
    timerEndTime: null,
    status: 'open',
};

export const storage = {
    getRegistrations: (): RegisteredPlayer[] => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(KEYS.REGISTRATIONS) || "[]");
        } catch { return []; }
    },

    saveRegistration: (player: RegisteredPlayer) => {
        const current = storage.getRegistrations();
        const updated = [...current, player];
        localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(updated));
        window.dispatchEvent(new Event("storage_local"));
    },

    removeRegistration: (id: string) => {
        const current = storage.getRegistrations();
        const updated = current.filter(p => p.id !== id);
        localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(updated));
        window.dispatchEvent(new Event("storage_local"));
    },

    getBracket: (): Match[] => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(KEYS.BRACKET) || "[]");
        } catch { return []; }
    },

    saveBracket: (bracket: Match[]) => {
        localStorage.setItem(KEYS.BRACKET, JSON.stringify(bracket));
        window.dispatchEvent(new Event("storage_local"));
    },

    getChampions: (): Champion[] => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(KEYS.CHAMPIONS) || "[]");
        } catch { return []; }
    },

    saveChampion: (champion: Champion) => {
        const current = storage.getChampions();
        const updated = [champion, ...current];
        localStorage.setItem(KEYS.CHAMPIONS, JSON.stringify(updated));
        window.dispatchEvent(new Event("storage_local"));
    },

    getSettings: (): TournamentSettings => {
        if (typeof window === "undefined") return DEFAULT_SETTINGS;
        try {
            return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
        } catch { return DEFAULT_SETTINGS; }
    },

    saveSettings: (settings: TournamentSettings) => {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
        window.dispatchEvent(new Event("storage_local"));
    },

    resetTournament: () => {
        // KEEP waitlisted players for the next tournament
        const currentRegistrations = storage.getRegistrations();
        const waitlistedPlayers = currentRegistrations.filter(p => p.isWaitlist).map(p => ({
            ...p,
            isWaitlist: false, // Promote to active for next tournament
            registeredAt: new Date().toISOString() // refresh timestamp
        }));

        localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(waitlistedPlayers));
        localStorage.removeItem(KEYS.BRACKET);

        window.dispatchEvent(new Event("storage_local"));
    }
};

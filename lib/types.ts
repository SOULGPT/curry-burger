export interface Player {
    id: string;
    name: string;
    photo: string; // Base64 or URL
}

export interface RegisteredPlayer {
    id: string;
    name: string;
    phone: string;
    email: string;
    instagram?: string;
    photo: string;
    registeredAt: string;
    isWaitlist?: boolean;
}

export interface Match {
    id: string;
    player1Id: string | null;
    player2Id: string | null;
    winnerId: string | null;
    round: number;
    position: number;
}

export interface Champion {
    id: string;
    name: string;
    photo: string;
    date: string;
    tournamentName?: string;
}

export interface TournamentSettings {
    maxPlayers: number; // 8, 16, 32, 64
    tournamentName: string;
    timerEndTime: number | null; // Timestamp in ms
    status: 'open' | 'active' | 'finished';
}

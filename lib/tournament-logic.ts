import { RegisteredPlayer, Match, Player } from "./types";

export const generateBracket = (players: RegisteredPlayer[], size: number = 16): Match[] => {
    // 1. Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    const matches: Match[] = [];

    // Helper to create match
    const createMatch = (round: number, p1Id: string | null, p2Id: string | null, pos: number): Match => ({
        id: `match - ${round} -${pos} `,
        player1Id: p1Id,
        player2Id: p2Id,
        winnerId: null,
        round,
        position: pos
    });

    const totalRounds = Math.log2(size);
    let currentRoundMatches = size / 2;

    for (let r = 1; r <= totalRounds; r++) {
        for (let i = 0; i < currentRoundMatches; i++) {
            let p1Id: string | null = null;
            let p2Id: string | null = null;

            // Only populate players for Round 1
            if (r === 1) {
                const p1Raw = shuffled[i * 2];
                const p2Raw = shuffled[i * 2 + 1];
                p1Id = p1Raw ? p1Raw.id : null;
                p2Id = p2Raw ? p2Raw.id : null;
            }

            matches.push(createMatch(r, p1Id, p2Id, i));
        }
        currentRoundMatches /= 2;
    }

    return matches;
};

// Helper: When a match has a winner, advance them to next bracket slot
export const advanceWinner = (bracket: Match[], matchId: string, winnerId: string): Match[] => {
    const matchIndex = bracket.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return bracket;

    const match = bracket[matchIndex];
    // Update current match
    const updatedMatch = { ...match, winnerId: winnerId };

    const newBracket = [...bracket];
    newBracket[matchIndex] = updatedMatch;

    // Find next match
    // Round 1 (pos i) -> Round 2 (pos floor(i/2)).
    // If i is even, it's player1 of next match. If odd, player2.

    const nextRound = match.round + 1;
    const nextPos = Math.floor(match.position / 2);
    const isPlayer1InNext = match.position % 2 === 0;

    const nextMatchIndex = newBracket.findIndex(m => m.round === nextRound && m.position === nextPos);

    if (nextMatchIndex !== -1) {
        const nextMatch = newBracket[nextMatchIndex];
        const updatedNextMatch = { ...nextMatch };

        if (isPlayer1InNext) {
            updatedNextMatch.player1Id = winnerId;
        } else {
            updatedNextMatch.player2Id = winnerId;
        }

        // Reset winner of next match if we changed inputs (fairness)?
        // For MVP, user manually resets if mistake. But if we auto-advance, better to clear next winner if it was set?
        // Let's leave currently set winner to avoid accidental resets, or just allow overwrite.

        newBracket[nextMatchIndex] = updatedNextMatch;
    }

    return newBracket;
};

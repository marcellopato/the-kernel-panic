import { rng } from '../utils/SeededRandom.js';

export class LeaderboardManager {
    constructor() {
        this.STORAGE_KEY = 'kernel_panic_leaderboard';
        this.DAILY_KEY = 'kernel_panic_daily';
    }

    getLeaderboard() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    getDailyLeaderboard() {
        const today = new Date();
        const seed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const data = localStorage.getItem(`${this.DAILY_KEY}_${seed}`);
        return data ? JSON.parse(data) : [];
    }

    addScore(playerName, score, panicLevel, dailySeed) {
        const entry = {
            name: playerName || `Player-${Math.floor(1000 + Math.random() * 9000)}`,
            score,
            panic: panicLevel,
            dailySeed,
            date: Date.now()
        };

        // Add to all-time leaderboard
        const leaderboard = this.getLeaderboard();
        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leaderboard.slice(0, 100)));

        // Add to daily leaderboard
        const today = new Date();
        const seed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const dailyBoard = this.getDailyLeaderboard();
        dailyBoard.push(entry);
        dailyBoard.sort((a, b) => b.score - a.score);
        localStorage.setItem(`${this.DAILY_KEY}_${seed}`, JSON.stringify(dailyBoard.slice(0, 50)));

        return {
            rank: leaderboard.findIndex(e => e.date === entry.date) + 1,
            dailyRank: dailyBoard.findIndex(e => e.date === entry.date) + 1
        };
    }

    getStats() {
        const all = this.getLeaderboard();
        const daily = this.getDailyLeaderboard();
        return {
            totalPlays: all.length,
            topScore: all[0]?.score || 0,
            dailyPlayers: daily.length,
            todayTop: daily[0]?.score || 0
        };
    }
}

export const leaderboard = new LeaderboardManager();

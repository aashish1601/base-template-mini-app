"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";

interface LeaderboardEntry {
  rank: number;
  passTokenId: number;
  managerName: string;
  totalPoints: number;
  weeklyPoints: number[];
  prize: string;
  isCurrentUser: boolean;
}

interface GameState {
  phase: string;
  currentWeek: number;
  prizePool: string;
  passTokenId?: number;
  manager?: {
    wallet: string;
    influenceCoins: number;
    squad: string[];
    totalPoints: number;
  };
}

interface LeaderboardProps {
  gameState: GameState;
  onNavigate: (tab: string) => void;
}

export function Leaderboard({ gameState, onNavigate }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [view, setView] = useState<"overall" | "week">("overall");
  const [selectedWeek, setSelectedWeek] = useState(1);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `/api/fantasy/leaderboard?view=${view}&week=${selectedWeek}`
      );
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedWeek]);

  const getPrizeEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return "💎";
    return "";
  };

  const prizePool = parseFloat(gameState.prizePool || "0");

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-800 to-orange-900 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-bold text-white mb-1">Rankings</h2>
        <div className="text-3xl font-bold text-yellow-300">{prizePool.toFixed(2)} ETH</div>
        <div className="text-sm text-yellow-200">Total Prize Pool</div>
      </div>

      {/* View Toggle */}
      <div className="bg-purple-900/50 rounded-lg p-2 flex gap-2">
        <button
          onClick={() => setView("overall")}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            view === "overall"
              ? "bg-purple-700 text-white"
              : "text-purple-300 hover:text-white"
          }`}
        >
          Overall
        </button>
        <button
          onClick={() => setView("week")}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            view === "week"
              ? "bg-purple-700 text-white"
              : "text-purple-300 hover:text-white"
          }`}
        >
          This Week
        </button>
      </div>

      {/* Week Selector */}
      {view === "week" && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(gameState.currentWeek)].map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedWeek(i + 1)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold ${
                selectedWeek === i + 1
                  ? "bg-purple-700 text-white"
                  : "bg-purple-900/50 text-purple-300"
              }`}
            >
              Week {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="bg-purple-900/40 rounded-xl p-8 text-center text-purple-300">
            <div className="text-4xl mb-2">⏳</div>
            <p>Leaderboard will appear once scoring begins</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.passTokenId}
              className={`rounded-xl p-4 flex items-center gap-4 ${
                entry.isCurrentUser
                  ? "bg-purple-700 border-2 border-purple-300"
                  : entry.rank <= 3
                  ? "bg-gradient-to-r from-yellow-900/40 to-orange-900/40"
                  : "bg-purple-900/40"
              }`}
            >
              {/* Rank */}
              <div className="text-center w-12">
                <div className="text-2xl">{getPrizeEmoji(entry.rank)}</div>
                <div className="text-xs text-purple-300">#{entry.rank}</div>
              </div>

              {/* Manager Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{entry.managerName}</span>
                  {entry.isCurrentUser && (
                    <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">YOU</span>
                  )}
                </div>
                <div className="text-sm text-purple-300">Pass #{entry.passTokenId}</div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{entry.totalPoints}</div>
                <div className="text-xs text-purple-300">points</div>
              </div>

              {/* Prize */}
              {entry.prize && entry.rank <= 10 && (
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-400">{entry.prize}</div>
                  <div className="text-xs text-yellow-300">prize</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Your Position Summary */}
      {gameState.passTokenId && (
        <div className="bg-purple-900/50 rounded-lg p-4">
          <div className="text-sm text-purple-300 mb-2">Your Position</div>
          {leaderboard.find((e) => e.isCurrentUser) ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  #{leaderboard.find((e) => e.isCurrentUser)?.rank}
                </div>
                <div className="text-xs text-purple-300">
                  {leaderboard.find((e) => e.isCurrentUser)?.totalPoints} points
                </div>
              </div>
              {(leaderboard.find((e) => e.isCurrentUser)?.rank ?? 999) <= 10 && (
                <div className="text-right">
                  <div className="text-lg text-yellow-400">
                    🎉 In prize zone!
                  </div>
                  <div className="text-sm text-yellow-300">
                    Est. {leaderboard.find((e) => e.isCurrentUser)?.prize}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-purple-300">Not yet ranked</div>
          )}
        </div>
      )}

      {/* Claim Prize Button */}
      {gameState.phase === "settled" && gameState.canClaimPrize && (
        <Button
          onClick={async () => {
            try {
              const response = await fetch("/api/fantasy/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passTokenId: gameState.passTokenId }),
              });
              const data = await response.json();
              if (data.success) {
                alert(`🎉 Prize claimed! ${data.amount} ETH sent to your wallet.`);
              }
            } catch (error) {
              console.error("Claim error:", error);
            }
          }}
          className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold py-4 text-lg"
        >
          💰 Claim Your Prize
        </Button>
      )}
    </div>
  );
}


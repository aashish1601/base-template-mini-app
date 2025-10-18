"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";

interface SquadMember {
  handle: string;
  weeklyPoints: number[];
  totalPoints: number;
  isCaptain: boolean;
  recentActivity: {
    likes: number;
    views: number;
    posts: number;
  };
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

interface SquadProps {
  gameState: GameState;
  onNavigate: (tab: string) => void;
}

export function Squad({ gameState, onNavigate }: SquadProps) {
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [captainHandle, setCaptainHandle] = useState<string | null>(null);

  const fetchSquadDetails = async () => {
    if (!gameState.passTokenId) return;
    
    try {
      const response = await fetch(`/api/fantasy/squad?passTokenId=${gameState.passTokenId}`);
      const data = await response.json();
      setSquad(data.squad || []);
      setCaptainHandle(data.captainHandle);
    } catch (error) {
      console.error("Failed to fetch squad:", error);
    }
  };

  useEffect(() => {
    fetchSquadDetails();
    const interval = setInterval(fetchSquadDetails, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.passTokenId]);

  const handleSetCaptain = async (handle: string) => {
    try {
      const response = await fetch("/api/fantasy/captain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passTokenId: gameState.passTokenId,
          handle,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCaptainHandle(handle);
        alert(`⭐ @${handle} is now your captain!`);
      }
    } catch (error) {
      console.error("Set captain error:", error);
    }
  };

  const totalPoints = squad.reduce((sum, m) => sum + m.totalPoints, 0);
  const currentWeek = gameState.currentWeek;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Squad Header */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">👥</div>
        <h2 className="text-2xl font-bold text-white mb-1">My Squad</h2>
        <div className="text-3xl font-bold text-yellow-400">{totalPoints} pts</div>
        <div className="text-sm text-purple-200">Total Season Score</div>
      </div>

      {/* Week Selector */}
      <div className="bg-purple-900/50 rounded-lg p-3 flex items-center justify-between">
        <span className="text-purple-200 text-sm">Viewing:</span>
        <div className="flex gap-2">
          {[...Array(currentWeek)].map((_, i) => (
            <button
              key={i}
              className="px-3 py-1 rounded bg-purple-700 text-white text-sm hover:bg-purple-600"
            >
              W{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Squad Cards */}
      <div className="space-y-3">
        {squad.length === 0 ? (
          <div className="bg-purple-900/40 rounded-xl p-8 text-center text-purple-300">
            <div className="text-4xl mb-2">🎯</div>
            <p>No squad yet. Head to Draft Room to pick your creators!</p>
            <Button
              onClick={() => onNavigate("draft")}
              className="mt-4 bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Go to Draft
            </Button>
          </div>
        ) : (
          squad.map((member) => (
            <div
              key={member.handle}
              className={`rounded-xl p-4 ${
                member.isCaptain || captainHandle === member.handle
                  ? "bg-yellow-900/40 border-2 border-yellow-500"
                  : "bg-purple-900/40"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">@{member.handle}</span>
                      {(member.isCaptain || captainHandle === member.handle) && (
                        <span className="text-yellow-400">⭐</span>
                      )}
                    </div>
                    <div className="text-sm text-purple-300">
                      {member.totalPoints} pts total
                    </div>
                  </div>
                </div>
                
                {gameState.phase === "playing" && captainHandle !== member.handle && (
                  <Button
                    onClick={() => handleSetCaptain(member.handle)}
                    className="text-xs py-1 px-3 bg-purple-700 hover:bg-purple-600"
                  >
                    Make Captain
                  </Button>
                )}
              </div>

              {/* Weekly Points Bar */}
              <div className="mb-3">
                <div className="flex gap-1 h-8">
                  {member.weeklyPoints.map((pts, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-purple-950 rounded relative group"
                      style={{
                        background: `linear-gradient(to top, #a855f7 ${
                          (pts / Math.max(...member.weeklyPoints)) * 100
                        }%, #581c87 ${(pts / Math.max(...member.weeklyPoints)) * 100}%)`,
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        W{idx + 1}: {pts} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-purple-950/50 rounded p-2 text-center">
                  <div className="text-purple-300">❤️ Likes</div>
                  <div className="font-semibold text-white">{member.recentActivity.likes}</div>
                </div>
                <div className="bg-purple-950/50 rounded p-2 text-center">
                  <div className="text-purple-300">👁 Views</div>
                  <div className="font-semibold text-white">
                    {(member.recentActivity.views / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="bg-purple-950/50 rounded p-2 text-center">
                  <div className="text-purple-300">📝 Posts</div>
                  <div className="font-semibold text-white">{member.recentActivity.posts}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Captain Explainer */}
      {gameState.phase === "playing" && squad.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 text-sm text-yellow-200">
          ⭐ Your captain earns 1.5× points each week. Choose wisely!
        </div>
      )}
    </div>
  );
}


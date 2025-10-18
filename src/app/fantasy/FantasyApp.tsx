"use client";

import { useState, useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { useAccount } from "wagmi";
import { Lobby } from "~/components/fantasy/Lobby";
import { DraftRoom } from "~/components/fantasy/DraftRoom";
import { Squad } from "~/components/fantasy/Squad";
import { Leaderboard } from "~/components/fantasy/Leaderboard";
import { Header } from "~/components/ui/Header";

export type FantasyTab = "lobby" | "draft" | "squad" | "leaderboard";

interface GameState {
  phase: "setup" | "drafting" | "playing" | "settled";
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

export default function FantasyApp() {
  const { isSDKLoaded, context } = useMiniApp();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<FantasyTab>("lobby");
  const [gameState, setGameState] = useState<GameState>({
    phase: "setup",
    currentWeek: 1,
    prizePool: "0",
  });

  // Fetch game state from API
  useEffect(() => {
    const fetchGameState = async () => {
      if (!context?.user?.fid) return;
      
      try {
        const response = await fetch(`/api/fantasy/state?fid=${context.user.fid}`);
        const data = await response.json();
        setGameState(data);
      } catch (error) {
        console.error("Failed to fetch game state:", error);
      }
    };

    if (isSDKLoaded) {
      fetchGameState();
      // Poll every 10s for live updates
      const interval = setInterval(fetchGameState, 10000);
      return () => clearInterval(interval);
    }
  }, [isSDKLoaded, context?.user?.fid]);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading Fantasy League...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900"
    >
      <div className="mx-auto py-2 px-4 pb-20">
        <Header neynarUser={null} />

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            ⚡ Influencer Fantasy League
          </h1>
          <div className="flex justify-center gap-4 text-sm text-purple-200">
            <span>Season 1 • Week {gameState.currentWeek}/8</span>
            <span>Prize Pool: {gameState.prizePool} ETH</span>
          </div>
        </div>

        {activeTab === "lobby" && (
          <Lobby
            gameState={gameState}
            onNavigate={setActiveTab}
            userFid={context?.user?.fid}
            isConnected={isConnected}
          />
        )}

        {activeTab === "draft" && (
          <DraftRoom
            gameState={gameState}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "squad" && (
          <Squad
            gameState={gameState}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "leaderboard" && (
          <Leaderboard
            gameState={gameState}
            onNavigate={setActiveTab}
          />
        )}

        <FantasyFooter activeTab={activeTab} setActiveTab={setActiveTab} gameState={gameState} />
      </div>
    </div>
  );
}

function FantasyFooter({
  activeTab,
  setActiveTab,
  gameState,
}: {
  activeTab: FantasyTab;
  setActiveTab: (tab: FantasyTab) => void;
  gameState: GameState;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-purple-950/95 backdrop-blur border-t border-purple-700">
      <div className="flex justify-around py-3 px-2">
        <button
          onClick={() => setActiveTab("lobby")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "lobby"
              ? "bg-purple-700 text-white"
              : "text-purple-300 hover:text-white"
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs">Lobby</span>
        </button>

        {gameState.phase === "drafting" && (
          <button
            onClick={() => setActiveTab("draft")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "draft"
                ? "bg-purple-700 text-white"
                : "text-purple-300 hover:text-white"
            }`}
          >
            <span className="text-xl">🎯</span>
            <span className="text-xs">Draft</span>
          </button>
        )}

        {gameState.passTokenId && (
          <button
            onClick={() => setActiveTab("squad")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "squad"
                ? "bg-purple-700 text-white"
                : "text-purple-300 hover:text-white"
            }`}
          >
            <span className="text-xl">👥</span>
            <span className="text-xs">Squad</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "leaderboard"
              ? "bg-purple-700 text-white"
              : "text-purple-300 hover:text-white"
          }`}
        >
          <span className="text-xl">🏆</span>
          <span className="text-xs">Rankings</span>
        </button>
      </div>
    </div>
  );
}


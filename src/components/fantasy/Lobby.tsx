"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { ShareButton } from "~/components/ui/Share";

interface LobbyProps {
  gameState: any;
  onNavigate: (tab: string) => void;
  userFid?: number;
  isConnected: boolean;
}

export function Lobby({ gameState, onNavigate, userFid, isConnected }: LobbyProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  const handleMintPass = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsMinting(true);
    try {
      // Call mint API
      const response = await fetch("/api/fantasy/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: userFid }),
      });

      const data = await response.json();
      if (data.success) {
        setMintSuccess(true);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert(data.error || "Minting failed");
      }
    } catch (error) {
      console.error("Mint error:", error);
      alert("Failed to mint pass");
    } finally {
      setIsMinting(false);
    }
  };

  const passesLeft = 100 - (gameState.totalPasses || 0);
  const prizePool = parseFloat(gameState.prizePool || "0").toFixed(2);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Season 1 Now Open!
        </h2>
        <p className="text-purple-200 mb-6">
          Draft 5 creators, earn points from their content, win ETH prizes
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-900/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{passesLeft}</div>
            <div className="text-xs text-purple-300">Passes Left</div>
          </div>
          <div className="bg-purple-900/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{prizePool}</div>
            <div className="text-xs text-purple-300">ETH Prize Pool</div>
          </div>
          <div className="bg-purple-900/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">8</div>
            <div className="text-xs text-purple-300">Game Weeks</div>
          </div>
        </div>

        {!gameState.passTokenId ? (
          <Button
            onClick={handleMintPass}
            disabled={isMinting || passesLeft === 0}
            isLoading={isMinting}
            className="w-full bg-white text-purple-900 hover:bg-purple-100 font-bold py-4 text-lg"
          >
            {mintSuccess
              ? "✅ Pass Minted!"
              : passesLeft === 0
              ? "Season Full"
              : `Mint Manager Pass • 0.03 ETH`}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-200">
              ✅ You own Pass #{gameState.passTokenId}
            </div>
            {gameState.phase === "drafting" && (
              <Button
                onClick={() => onNavigate("draft")}
                className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold py-4"
              >
                🎯 Join Draft Now!
              </Button>
            )}
            {gameState.phase === "playing" && (
              <Button
                onClick={() => onNavigate("squad")}
                className="w-full bg-blue-500 text-white hover:bg-blue-400 font-bold py-4"
              >
                👥 View My Squad
              </Button>
            )}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-purple-900/40 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
        <div className="space-y-4">
          {[
            { emoji: "🎟️", title: "1. Mint Pass", desc: "Secure your manager slot (0.03 ETH)" },
            { emoji: "🎯", title: "2. Draft Squad", desc: "Bid on 5 creators using Influence Coins" },
            { emoji: "📈", title: "3. Earn Points", desc: "Your creators' likes, views, posts = points" },
            { emoji: "💰", title: "4. Win Prizes", desc: "Top 10 split the prize pool each season" },
          ].map((step) => (
            <div key={step.title} className="flex gap-3">
              <div className="text-2xl">{step.emoji}</div>
              <div>
                <div className="font-semibold text-white">{step.title}</div>
                <div className="text-sm text-purple-300">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Breakdown */}
      <div className="bg-purple-900/40 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">💎 Prize Distribution</h3>
        <div className="space-y-2">
          {[
            { place: "🥇 1st", pct: "45%", example: (parseFloat(prizePool) * 0.45).toFixed(2) },
            { place: "🥈 2nd", pct: "25%", example: (parseFloat(prizePool) * 0.25).toFixed(2) },
            { place: "🥉 3rd", pct: "15%", example: (parseFloat(prizePool) * 0.15).toFixed(2) },
            { place: "📊 4-10th", pct: "15% split", example: (parseFloat(prizePool) * 0.15 / 7).toFixed(3) },
          ].map((prize) => (
            <div key={prize.place} className="flex justify-between text-purple-200">
              <span>{prize.place}</span>
              <span className="font-semibold">{prize.pct} • {prize.example} ETH</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <ShareButton
        buttonText="📢 Share with Friends"
        cast={{
          text: `Just joined Influencer Fantasy League Season 1! 🏆\n\nDraft creators, earn from their content, win ETH.\n\n${passesLeft} passes left!`,
          embeds: [process.env.NEXT_PUBLIC_URL + "/fantasy"],
        }}
        className="w-full"
      />
    </div>
  );
}


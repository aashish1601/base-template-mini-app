"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";

interface Creator {
  handle: string;
  followers: number;
  avgLikes: number;
  currentBid: number;
  bidder: string | null;
  imageUrl?: string;
}

interface DraftRoomProps {
  gameState: any;
  onNavigate: (tab: string) => void;
}

export function DraftRoom({ gameState, onNavigate }: DraftRoomProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bidAmount, setBidAmount] = useState(10);
  const [isBidding, setIsBidding] = useState(false);

  useEffect(() => {
    fetchCreators();
    const interval = setInterval(fetchCreators, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await fetch("/api/fantasy/creators");
      const data = await response.json();
      setCreators(data.creators || []);
    } catch (error) {
      console.error("Failed to fetch creators:", error);
    }
  };

  const handleBid = async () => {
    if (!selectedCreator) return;
    
    setIsBidding(true);
    try {
      const response = await fetch("/api/fantasy/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passTokenId: gameState.passTokenId,
          handle: selectedCreator.handle,
          bidIC: bidAmount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Bid placed for @${selectedCreator.handle}!`);
        setSelectedCreator(null);
        fetchCreators();
      } else {
        alert(data.error || "Bid failed");
      }
    } catch (error) {
      console.error("Bid error:", error);
      alert("Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  const mySquadSize = gameState.manager?.squad?.length || 0;
  const myIC = gameState.manager?.influenceCoins || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Draft Header */}
      <div className="bg-purple-900/50 rounded-xl p-4">
        <h2 className="text-2xl font-bold text-white mb-2">🎯 Draft Room</h2>
        <div className="flex justify-between text-purple-200 text-sm">
          <span>Squad: {mySquadSize}/5</span>
          <span>IC Remaining: {myIC}/100</span>
        </div>
        {mySquadSize === 5 && (
          <div className="mt-3 bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-200">
            ✅ Squad complete! Wait for other managers to finish drafting.
          </div>
        )}
      </div>

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {creators.map((creator) => {
          const isDrafted = creator.bidder !== null;
          const isMyPick = creator.bidder === gameState.manager?.wallet;
          
          return (
            <div
              key={creator.handle}
              className={`rounded-xl p-4 transition-all cursor-pointer ${
                isDrafted
                  ? isMyPick
                    ? "bg-green-900/40 border-2 border-green-500"
                    : "bg-gray-800/40 opacity-50"
                  : selectedCreator?.handle === creator.handle
                  ? "bg-purple-700 border-2 border-purple-300"
                  : "bg-purple-900/40 hover:bg-purple-800/60"
              }`}
              onClick={() => !isDrafted && mySquadSize < 5 && setSelectedCreator(creator)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-xl">
                  {creator.imageUrl ? (
                    <img
                      src={creator.imageUrl}
                      alt={creator.handle}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">@{creator.handle}</div>
                  <div className="text-xs text-purple-300 space-y-1">
                    <div>👥 {(creator.followers / 1000).toFixed(1)}k followers</div>
                    <div>❤️ {creator.avgLikes} avg likes</div>
                  </div>
                  {isDrafted && (
                    <div className="mt-2 text-xs">
                      {isMyPick ? (
                        <span className="text-green-400">✓ In your squad</span>
                      ) : (
                        <span className="text-gray-400">Drafted</span>
                      )}
                    </div>
                  )}
                </div>
                {!isDrafted && (
                  <div className="text-right">
                    <div className="text-xs text-purple-400">Suggested</div>
                    <div className="font-bold text-white">{creator.currentBid} IC</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bid Panel */}
      {selectedCreator && mySquadSize < 5 && (
        <div className="fixed bottom-20 left-0 right-0 bg-purple-950/98 backdrop-blur p-4 border-t border-purple-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-semibold">
                  Bid for @{selectedCreator.handle}
                </div>
                <div className="text-sm text-purple-300">
                  Suggested: {selectedCreator.currentBid} IC
                </div>
              </div>
              <button
                onClick={() => setSelectedCreator(null)}
                className="text-purple-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-3">
              <input
                type="number"
                min={selectedCreator.currentBid}
                max={myIC}
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value))}
                className="flex-1 bg-purple-900 text-white rounded-lg px-4 py-3 border border-purple-700"
              />
              <Button
                onClick={handleBid}
                disabled={isBidding || bidAmount > myIC}
                isLoading={isBidding}
                className="px-8 bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
              >
                Place Bid
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


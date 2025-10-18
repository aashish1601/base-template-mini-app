// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title LeagueCore
 * @notice Main game logic for Influencer Fantasy League
 * Manages drafts, scoring, transfers, and prize distribution
 */
contract LeagueCore {
    struct Manager {
        address wallet;
        uint256 passTokenId;
        uint256 influenceCoins; // IC budget
        string[] squad; // Array of 5 creator handles
        uint256 totalPoints;
        mapping(uint256 => uint256) weeklyPoints; // week → points
    }
    
    struct Creator {
        string handle;
        uint256 auctionPrice; // Final IC price
        address currentOwner;
    }
    
    enum GamePhase { Setup, Drafting, Playing, Settled }
    
    GamePhase public phase;
    uint256 public currentWeek;
    uint256 public constant SEASON_WEEKS = 8;
    uint256 public constant STARTING_IC = 100;
    uint256 public prizePool;
    
    address public oracleAddress;
    mapping(uint256 => Manager) public managers; // passTokenId → Manager
    mapping(string => Creator) public creators;
    mapping(uint256 => uint256) public leaderboard; // rank → passTokenId
    
    event DraftBid(uint256 indexed passTokenId, string handle, uint256 bidIC);
    event PointsSubmitted(uint256 indexed passTokenId, uint256 week, uint256 points);
    event PrizeClaimed(uint256 indexed passTokenId, uint256 amount);
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Not oracle");
        _;
    }
    
    constructor(address _oracle) {
        oracleAddress = _oracle;
        phase = GamePhase.Setup;
        currentWeek = 1;
    }
    
    function registerManager(uint256 passTokenId) external payable {
        require(phase == GamePhase.Setup, "Registration closed");
        require(managers[passTokenId].wallet == address(0), "Already registered");
        
        Manager storage mgr = managers[passTokenId];
        mgr.wallet = msg.sender;
        mgr.passTokenId = passTokenId;
        mgr.influenceCoins = STARTING_IC;
        
        prizePool += msg.value;
    }
    
    function startDraft() external onlyOracle {
        phase = GamePhase.Drafting;
    }
    
    function bidCreator(uint256 passTokenId, string calldata handle, uint256 bidIC) external {
        require(phase == GamePhase.Drafting, "Not drafting");
        Manager storage mgr = managers[passTokenId];
        require(mgr.wallet == msg.sender, "Not your pass");
        require(mgr.influenceCoins >= bidIC, "Insufficient IC");
        require(mgr.squad.length < 5, "Squad full");
        
        // Simple auction: first bid wins (or implement Dutch auction)
        if (creators[handle].currentOwner == address(0)) {
            mgr.influenceCoins -= bidIC;
            mgr.squad.push(handle);
            creators[handle] = Creator(handle, bidIC, msg.sender);
            
            emit DraftBid(passTokenId, handle, bidIC);
        }
    }
    
    function startPlaying() external onlyOracle {
        phase = GamePhase.Playing;
    }
    
    function submitPoints(uint256 passTokenId, uint256 week, uint256 points) external onlyOracle {
        require(phase == GamePhase.Playing, "Not playing");
        Manager storage mgr = managers[passTokenId];
        mgr.weeklyPoints[week] = points;
        mgr.totalPoints += points;
        
        emit PointsSubmitted(passTokenId, week, points);
    }
    
    function advanceWeek() external onlyOracle {
        require(currentWeek < SEASON_WEEKS, "Season ended");
        currentWeek++;
    }
    
    function settleSeason(uint256[] calldata topTokenIds) external onlyOracle {
        require(phase == GamePhase.Playing, "Not ready");
        phase = GamePhase.Settled;
        
        // Store final rankings
        for (uint256 i = 0; i < topTokenIds.length && i < 10; i++) {
            leaderboard[i + 1] = topTokenIds[i];
        }
    }
    
    function claimPrize(uint256 passTokenId) external {
        require(phase == GamePhase.Settled, "Season not settled");
        Manager storage mgr = managers[passTokenId];
        require(mgr.wallet == msg.sender, "Not your pass");
        
        uint256 rank = 0;
        for (uint256 i = 1; i <= 10; i++) {
            if (leaderboard[i] == passTokenId) {
                rank = i;
                break;
            }
        }
        require(rank > 0, "Not in top 10");
        
        uint256 payout = _calculatePrize(rank);
        require(payout > 0, "Already claimed");
        
        (bool ok, ) = payable(msg.sender).call{value: payout}("");
        require(ok, "Transfer failed");
        
        emit PrizeClaimed(passTokenId, payout);
    }
    
    function _calculatePrize(uint256 rank) internal view returns (uint256) {
        if (rank == 1) return (prizePool * 45) / 100;
        if (rank == 2) return (prizePool * 25) / 100;
        if (rank == 3) return (prizePool * 15) / 100;
        if (rank <= 10) return (prizePool * 15) / 100 / 7; // Split 15% among 4-10
        return 0;
    }
}


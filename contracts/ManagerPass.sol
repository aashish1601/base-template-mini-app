// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ManagerPass
 * @notice NFT entry pass for Influencer Fantasy League
 * Each pass = one manager slot per season
 */
contract ManagerPass is ERC721, Ownable {
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MINT_PRICE = 0.03 ether;
    uint256 public currentTokenId;
    uint256 public currentSeason;
    
    mapping(uint256 => uint256) public tokenToSeason; // tokenId → season minted
    
    event PassMinted(address indexed manager, uint256 tokenId, uint256 season);
    
    constructor() ERC721("Fantasy Manager Pass", "FMP") Ownable(msg.sender) {
        currentSeason = 1;
    }
    
    function mint() external payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(currentTokenId < MAX_SUPPLY, "Season full");
        
        currentTokenId++;
        uint256 newTokenId = currentTokenId;
        
        _safeMint(msg.sender, newTokenId);
        tokenToSeason[newTokenId] = currentSeason;
        
        emit PassMinted(msg.sender, newTokenId, currentSeason);
        return newTokenId;
    }
    
    function startNewSeason() external onlyOwner {
        currentSeason++;
        currentTokenId = 0; // Reset for new season
    }
    
    function withdrawTreasury() external onlyOwner {
        (bool ok, ) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Transfer failed");
    }
}


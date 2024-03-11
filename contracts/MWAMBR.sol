// MWA Membership NFT //
/////////////////////
// A Soulbound NFT the owner can burn.
// Anyone can mint.
// Price is 0.02 ETH
// Max supply is 100.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MWAMBR is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    uint256 public mintPrice = (0.02 ether);
    uint256 public supply = 100;
    
    constructor(address initialOwner) Ownable(initialOwner) ERC721("MetaWarrior Army Membership", "MWAMBR") { }

    // Mint NFT 
    function mintNFT(address recipient, string memory tokenURI)
        public 
        payable
        returns (uint256)
    {
        require(balanceOf(msg.sender) == 0, "Max Mint per wallet reached");
        require(msg.value == mintPrice, "0.02 ETH to Mint");
        uint256 tokenId = _tokenIds;
        require(tokenId < supply, "No more NFTs");
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIds += 1;

        return tokenId;
    }

    // Burn NFT
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can burn it.");
        _burn(tokenId);
    }
    
    // SOULBOUND: Block transfers
    function transferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721,IERC721) {
        revert("This is a Soulbound NFT, transfers are not allowed.");
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override(ERC721,IERC721) {
        revert("This is a Soulbound NFT, transfers are not allowed.");
    }

   
    // Update token supply
    function updateSupply(uint256 _supply)
        public
        onlyOwner()
        returns (uint256)
    {
        require(_supply > _tokenIds, "New supply must be greater than current minted supply.");
        supply = _supply;
        return supply;
    }

    // Update Mint Price
    function updateMintPrice(uint256 _price)
        public
        onlyOwner()
        returns (uint256)
    {
        mintPrice = _price;
        return mintPrice;
    }
    
    // Withdraw Eth to Owner
    function withdraw()
        public 
        payable
        onlyOwner()
        returns (bool)
    {
        require(msg.sender == owner(), "Unauthorized");
        (bool success, ) = owner().call{value:address(this).balance}("");
        require(success, "Withdraw failed.");
        return true;
    }

}

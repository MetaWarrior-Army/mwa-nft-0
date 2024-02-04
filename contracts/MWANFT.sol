// MWA Founder NFT //
/////////////////////
// A Soulbound NFT the owner can burn.
// Anyone can mint.
// Price is 0.02 ETH
// Max supply is 100.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MWANFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    uint public constant mintPrice = (0.02 ether);
    uint public constant supply = 100;
    
    constructor(address initialOwner) Ownable(initialOwner) ERC721("MetaWarrior Army Founding Member", "MWAFNDR") { }

    // Change contract owner
    function changeOwner(address newOwner)
        public
        onlyOwner()
        returns (bool)
    {
        transferOwnership(newOwner);
        return true;
    }

    // Mint NFT
    function mintNFT(address recipient, string memory tokenURI)
        public 
        payable
        returns (uint256)
    {
        require(msg.value == mintPrice, "Provide more ETH");
        uint256 tokenId = _tokenIds;
        require(tokenId < supply, "No more NFTs");
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIds += 1;

        return tokenId;
    }

    // Get contract Balance
    function getCBalance()
        public
        view 
        onlyOwner()
        returns (uint256)
    {
        return address(this).balance;
    }

    // Withdraw Eth from contract
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

    // Soulbound NFT Features
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can burn it.");
        _burn(tokenId);
    }
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound NFT: Transfer reverted");
        }

        return super._update(to, tokenId, auth);
    }
    
    /*
    function transferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721,IERC721) {
        require(from == address(0) && to == address(0),"This is a non-transferable Soulbound NFT.");
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override(ERC721,IERC721) {
        require(from == address(0) && to == address(0),"This is a non-transferable Soulbound NFT.");
        super.safeTransferFrom(from, to, tokenId, data);
    }
    */


}

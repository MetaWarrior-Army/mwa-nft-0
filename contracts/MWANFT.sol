//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MWANFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    constructor(address initialOwner) Ownable(initialOwner) ERC721("MWANFT", "MWA") { }

    // Change contract owner
    function changeOwner(address newOwner)
        public
        onlyOwner()
        returns (bool)
    {
        transferOwnership(newOwner);
        return true;
    }

    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 tokenId = _tokenIds;
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIds += 1;

        return tokenId;
    }
}

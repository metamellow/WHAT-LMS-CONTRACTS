// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI
    );

    constructor(
        address initialOwner
    ) ERC721("GeneralNFT", "GNFT") Ownable(initialOwner) {
        _tokenIdCounter = 1;
    }

    function mint(
        address to,
        string memory uri
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit NFTMinted(to, tokenId, uri);
        return tokenId;
    }
}

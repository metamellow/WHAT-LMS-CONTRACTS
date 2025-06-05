// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintNFT is ERC721URIStorage, Ownable {
    uint256 private tokenIdCounter;
    mapping(address => mapping(string => bool)) public hasMinted;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        string courseId
    );

    constructor() ERC721("LMSNFT", "LMSNFT") {
        tokenIdCounter = 1;
    }

    function mint(
        address to,
        string memory uri,
        string memory courseId
    ) public onlyOwner returns (uint256) {
        require(bytes(uri).length > 0, "Invalid URI");
        require(!hasMinted[to][courseId], "Already minted for this course");

        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        hasMinted[to][courseId] = true;

        emit NFTMinted(to, tokenId, uri, courseId);
        return tokenId;
    }
}

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import the Counters library from OpenZeppelin
import "@openzeppelin/contracts/utils/Counters.sol"; 
// import the ERC721 contract from OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import the ERC721URIStorage contract from OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 

// define the contract inheriting from the ERC721URIStorage contract
contract RealEstateToken is ERC721URIStorage {
    // import the Counters library to handle counting token IDs
    using Counters for Counters.Counter;
     // declare a private variable to keep track of token IDs
    Counters.Counter private _tokenIds;

    // constructor for the contract, setting the token name and symbol
    constructor() ERC721("Real Estate Token", "RET") {}

    // function to mint a new token, taking the token URI as an argument
    function mint(string memory tokenURI) public returns (uint256) {
        // increase the count of token IDs 
        _tokenIds.increment();

        // assign the current token ID to a variable
        uint256 newItemId = _tokenIds.current();
        // mint the new token, assigning ownership to the sender
        _mint(msg.sender, newItemId);
        // set the token URI for the new token
        _setTokenURI(newItemId, tokenURI);

        // return the ID of the newly minted token
        return newItemId;
    }

    // function to return the total number of tokens
    function totalSupply() public view returns (uint256) {
        // return the current count of token IDs
        return _tokenIds.current();
    }
}




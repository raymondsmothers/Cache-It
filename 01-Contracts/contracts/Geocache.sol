// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

/// @title: Geocache Project
/// @author: hborska

import "hardhat/console.sol";
import {AdminControl} from "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IERC1155CreatorCore} from "@manifoldxyz/creator-core-solidity/contracts/core/IERC1155CreatorCore.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ICreatorExtensionTokenURI} from "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";

// Custom errors
error NotCreator();
error NonExistentToken();
error NotActiveGeocache();
error UserAlreadyFound();
error AlreadyMintedToken();

contract Geocache is AdminControl, ICreatorExtensionTokenURI {
    struct GeocacheInstance {
        address creator; // address of creator
        string tokenURI; // img
        string dateCreated; // when geocache was created
        uint256 numItems; // # of items in the geocache
        bool isActive; // if all items have been found or not
        string epicenterLat;
        string epicenterLong;
        string[] itemGeolocations;
        string name;
        uint256 radius;
    }

    event GeocacheCreated(
        address creator,
        string name,
        uint256 numItems
    );
    event GeocacheItemMinted(
        address sender,
        uint256 geocacheIndex,
        uint256 itemIndex
    );

    //Should we make a mapping of creators to owned geocaches
    

    //should we make a list of active instances?


    // manifold creator contract address
    address public immutable creatorContract;

    // total number of geocaches created so far
    uint256 public numGeocaches = 0;

    // mapping between a tokenId and a geocache
    mapping(uint256 => GeocacheInstance) public tokenIdToGeocache;

    // mapping the geocache id to number of items in a geocache that have been minted -- maybe move this to metadata?
    mapping(uint256 => uint256) public geocacheToNumFound;

    // mapping to keep track of one mint per tokenId per address
    mapping(uint256 => mapping(address => bool)) public hasMintedTokenId;

    constructor(address _creatorContract) {
        creatorContract = _creatorContract;
    }

    //TODO create a function that auto sets geocache to inactive (delete method)

    // Interfaces for project
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165, AdminControl)
        returns (bool)
    {
        return
            interfaceId == type(ICreatorExtensionTokenURI).interfaceId ||
            interfaceId == type(AdminControl).interfaceId ||
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev return the metadata for a given tokenId
     * @param _creatorContract to check the correct manifold creator contract
     * @param _tokenId of the NFT
     */
    function tokenURI(address _creatorContract, uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_creatorContract == creatorContract);
        return tokenIdToGeocache[_tokenId].tokenURI;
    }

    /**
     * @dev make a new geocache and give th first item for the creator
     * @param _numItems the number of items that can be found in the geocache
     * @param _tokenURI of the new Geocache
     * @param _dateCreated the date the geocache was created
     *
     */
    function newGeocache(
        uint256 _numItems,
        string memory _tokenURI,
        string memory _dateCreated,
        string[] memory _itemGeolocations,
        string memory _epicenterLat,
        string memory _epicenterLong,
        uint256 _radius,
        string memory _name
    ) external {
        tokenIdToGeocache[numGeocaches] = GeocacheInstance(
            msg.sender,
            _tokenURI,
            _dateCreated,
            _numItems,
            true, 
            _epicenterLat, // change x and y coord later, for now static
            _epicenterLong,
            _itemGeolocations,
            _name,
            _radius
        );
        ++numGeocaches;

        // mint the first token of the Geocache to the creator
        address[] memory to = new address[](1);
        to[0] = msg.sender;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;

        string[] memory uris = new string[](1);
        uris[0] = "";

        IERC1155CreatorCore(creatorContract).mintExtensionNew(
            to,
            amounts,
            uris
        );
        emit GeocacheCreated(msg.sender, _name, _numItems);
    }

    /**
     * @dev mint an item for the geocache
     * @param _geocacheId the tokenId of the geocachea
     * @param _user address of the user who finds the item in the geocache
     */
    function mintItemInGeocache(uint256 _geocacheId, address _user)
        external
        onlyOwner
    {
        // Check that _tokenId exists
        if (_geocacheId >= numGeocaches) revert NonExistentToken();
        console.log(numGeocaches);
        // Require that the user hasn't found yet
        if(hasMintedTokenId[_geocacheId][_user]) revert UserAlreadyFound();

        GeocacheInstance memory geocache = tokenIdToGeocache[_geocacheId];

        // Require that the geocache is active
        if (!geocache.isActive) revert NotActiveGeocache();

        geocacheToNumFound[_geocacheId]++;
        hasMintedTokenId[_geocacheId][_user] = true;
        // If all of the items are found, deactivating the geocache
        if (geocacheToNumFound[_geocacheId] == geocache.numItems) {
            tokenIdToGeocache[_geocacheId].isActive = false;
        }

        _mint(_geocacheId, _user);
        emit GeocacheItemMinted(msg.sender, _geocacheId, geocacheToNumFound[_geocacheId]);
    }

    /**
     * @dev mint an 1155 token on the manifold creator contract
     * @param _tokenId to mint
     */
    function _mint(uint256 _tokenId, address _user) internal {
        // mint a new item in geocache
        address[] memory to = new address[](1);
        to[0] = _user;

        uint256[] memory token = new uint256[](1);
        token[0] = _tokenId;

        uint256[] memory amount = new uint256[](1);
        amount[0] = 1;

        IERC1155CreatorCore(creatorContract).mintExtensionExisting(
            to,
            token,
            amount
        );
    }

    /**
     * @dev update the tokenURI of a Geocache
     * @param _tokenId of the Geocache you want to update
     * @param _newTokenURI of the Geocache
     */
    function updateGeocacheTokenURI(
        uint256 _tokenId,
        string memory _newTokenURI
    ) public {
        GeocacheInstance storage geocache = tokenIdToGeocache[_tokenId];
        if (msg.sender != geocache.creator) revert NotCreator();
        geocache.tokenURI = _newTokenURI;
    }

    /**
     * @dev returning all geocaches as an array of GeocacheInstance
     */
    function getAllGeocaches()
        external
        view
        returns (GeocacheInstance[] memory)
    {
        GeocacheInstance[] memory geocaches = new GeocacheInstance[](
            numGeocaches
        );

        for (uint256 i; i < numGeocaches; i++) {
            GeocacheInstance storage geocache = tokenIdToGeocache[i];
            geocaches[i] = geocache;
        }

        return geocaches;
    }

    /**
     * @dev returning all geocaches as an array of GeocacheInstance
     */
    function getGeolocationsOfGeocache(uint256 geocacheIndex)
        external
        view
        returns(string[] memory)
    {
        return tokenIdToGeocache[geocacheIndex].itemGeolocations;
    }


}

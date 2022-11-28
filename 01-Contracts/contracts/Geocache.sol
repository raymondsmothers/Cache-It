// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

/// @title: Geocache Project
/// @author: hborska

import "hardhat/console.sol";
import {AdminControl} from "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IERC1155CreatorCore} from "@manifoldxyz/creator-core-solidity/contracts/core/IERC1155CreatorCore.sol";
import {ICreatorExtensionTokenURI} from "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";
import {ICreatorCore} from "@manifoldxyz/creator-core-solidity/contracts/core/ICreatorCore.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Custom errors
error NotCreator();
error NonExistentToken();
error NotActiveGeocache();
error UserAlreadyFound();
error AlreadyMintedToken();

contract Geocache is ICreatorExtensionTokenURI, AdminControl {
    struct GeocacheInstance {
        address creator; // address of creator
        string tokenURI;
        string dateCreated; // when geocache was created
        uint256 numItems; // # of items in the geocache
        bool isActive; // if all items have been found or not
        string epicenterLat;
        string epicenterLong;
        string[] itemGeolocations;
        string name;
        uint256 radius;
        string originStory;
    }

    event GeocacheCreated(address creator, string name, uint256 id);
    event GeocacheItemMinted(
        address receiver,
        uint256 geocacheIndex,
        uint256 itemIndex
    );

    // manifold creator contract address
    address public immutable creatorContract;

    // total number of geocaches created so far
    uint256 public numGeocaches = 0;

    // active geocaches
    uint256 public numActiveGeocaches;

    // mapping between a tokenId and a geocache
    mapping(uint256 => GeocacheInstance) public tokenIdToGeocache;

    // mapping the geocache id to number of items in a geocache that have been minted -- maybe move this to metadata?
    mapping(uint256 => uint256) public geocacheToNumFound;

    // mapping to keep track of one mint per tokenId per address
    mapping(uint256 => mapping(address => bool)) public hasMintedTokenId;

    // Should we make a mapping of creators to owned geocaches
    // Since metadata is glitchy, yes
    // We can remove this once metadata is working well
    mapping(address => uint256[]) public userToGeocache;

    //should we make a list of active instances?
    // ^ Prob not because we already have the isActive property, would take up more gas

    constructor(address _creatorContract) {
        creatorContract = _creatorContract;
    }

    //TODO create a function that auto sets geocache to inactive (delete method)

    // Interfaces for project
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(IERC165, AdminControl) returns (bool) {
        return
            interfaceId == type(ICreatorExtensionTokenURI).interfaceId ||
            // interfaceId == type(ICreatorCore).interfaceId ||
            interfaceId == type(AdminControl).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            super.supportsInterface(interfaceId);
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
        string memory _dateCreated, // TODO: Maybe remove this from params and replace with block.timestamp (less gas)
        string[] memory _itemGeolocations,
        string memory _epicenterLat,
        string memory _epicenterLong,
        uint256 _radius,
        string memory _name,
        string memory _originStory
    ) external {
        ++numGeocaches;
        ++numActiveGeocaches;

        tokenIdToGeocache[numGeocaches] = GeocacheInstance(
            msg.sender,
            _tokenURI,
            _dateCreated,
            _numItems,
            true,
            _epicenterLat,
            _epicenterLong,
            _itemGeolocations,
            _name,
            _radius,
            _originStory
        );
        userToGeocache[msg.sender].push(numGeocaches);
        hasMintedTokenId[numGeocaches][msg.sender] = true;

        // mint the first token of the Geocache to the creator
        address[] memory to = new address[](1);
        to[0] = msg.sender;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;

        string[] memory uris = new string[](1);
        // string memory uri = _generateURI(numGeocaches - 1);
        uris[0] = ""; // Maybe put uri (above) in here?

        // Minting the new extension (geocache 1155)
        IERC1155CreatorCore(creatorContract).mintExtensionNew(
            to,
            amounts,
            uris
        );

        emit GeocacheCreated(msg.sender, _name, numGeocaches);
    }

    /**
     * @dev mint an item for the geocache
     * @param _geocacheId the tokenId of the geocachea
     * @param _user address of the user who finds the item in the geocache
     */
    function mintItemInGeocache(
        uint256 _geocacheId,
        address _user
    ) external onlyOwner {
        // Check that _tokenId exists
        if (_geocacheId >= numGeocaches) revert NonExistentToken();
        // console.log(numGeocaches);
        // Require that the user hasn't found yet
        if (hasMintedTokenId[_geocacheId][_user]) revert UserAlreadyFound();

        GeocacheInstance memory geocache = tokenIdToGeocache[_geocacheId];

        // Require that the geocache is active
        //TODO we need to add language to indicate revert error
        if (!geocache.isActive) revert NotActiveGeocache();

        geocacheToNumFound[_geocacheId]++;
        hasMintedTokenId[_geocacheId][_user] = true;
        // If all of the items are found, deactivating the geocache
        if (geocacheToNumFound[_geocacheId] == geocache.numItems) {
            tokenIdToGeocache[_geocacheId].isActive = false;
            --numActiveGeocaches;
        }

        _mint(_geocacheId, _user);

        userToGeocache[_user].push(_geocacheId);

        emit GeocacheItemMinted(
            _user,
            _geocacheId,
            geocacheToNumFound[_geocacheId]
        );
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
     * @notice return the metadata for a given tokenId
     * @param _creatorContract to check the correct manifold creator contract
     * @param _tokenId of the NFT
     */
    function tokenURI(
        address _creatorContract,
        uint256 _tokenId
    ) public view override returns (string memory) {
        return tokenIdToGeocache[_tokenId].tokenURI;
    }

    /**
     * @notice return the metadata for a given tokenId
     * @param _tokenId of the NFT
     */
    function uri(uint256 _tokenId) public view returns (string memory) {
        return tokenIdToGeocache[_tokenId].tokenURI;
    }

    /**
     * @dev update the tokenURI of a Geocache
     * @param _tokenId of the Geocache you want to update
     * @param _newTokenURI of the Geocache (ipfs)
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
     * @dev returning all active geocache IDs
     */
    function getAllActiveGeocacheIDs()
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory ids = new uint256[](numActiveGeocaches);

        uint256 counter;
        for (uint256 i; i < numGeocaches; i++) {
            GeocacheInstance storage geocache = tokenIdToGeocache[i];
            if (geocache.isActive) {
                ids[counter] = i;
                counter++;
            }
        }
        return ids;
    }

    /**
     * @dev returning the geolocations of a geocache
     * @param geocacheIndex the ID of the geocache to return item geolocations for
     */
    function getGeolocationsOfGeocache(
        uint256 geocacheIndex
    ) external view returns (string[] memory) {
        return tokenIdToGeocache[geocacheIndex].itemGeolocations;
    }

    /**
     * @dev returning the geocache IDs of the geocaches where user has found an item
     * @param _user the user to get geocache IDs for
     */
    function getUsersGeocaches(
        address _user
    ) external view returns (uint256[] memory) {
        return userToGeocache[_user];
    }

    // Keeping this here just in case we need to do on chain metadata
    // TODO: Delete this if off chain is working well
    /**
     * @dev Just a test function to make sure tokenURI is formatted correctly
     * @param _tokenId of the geocache you'd like to log the metadata for
     */
    // function logTokenURI(uint256 _tokenId) public view {
    //     // Getting the geocache info
    //     GeocacheInstance memory cache = tokenIdToGeocache[_tokenId];
    //     bytes memory byteString;
    //     string
    //         memory placeholderImgUrl = "https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png";

    //     // Actual metadata
    //     byteString = abi.encodePacked(
    //         "'data:application/json;utf8,"
    //         '{"name": "',
    //         // Passing in NFT name
    //         cache.name,
    //         // Description
    //         '", "description": "',
    //         cache.originStory,
    //         // Image (IPFS Link)
    //         '", "image": "',
    //         placeholderImgUrl,
    //         // NFT Attributes:
    //         // TODO potentially add more here
    //         '", "attributes": [ { "trait_type": "Geocache Size", "value": ',
    //         Strings.toString(cache.numItems), // need to make string or set dynamically
    //         '}, { "trait_type": "Status", "value": ',
    //         cache.isActive ? '"Active"' : '"Inactive"', // need to make string or set dynamically
    //         // '}, { "trait_type": "Location Created", "value": ',
    //         // Strings.toString(abi.encodePacked(Strings.toString(cache.epicenterLat), ", ", Strings.toString(cache.epicenterLong))),
    //         '}, { "display_type": "date", "trait_type": "Date Created", "value": ',
    //         // Date the NFT was minted (unix timestamp)
    //         cache.dateCreated,
    //         "} ]}'"
    //     );

    //     console.log(string(byteString));
    // }
}

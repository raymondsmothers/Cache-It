// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

/// @title: Geocache Project 1155 MOCK
/// @author: hborska

import "@manifoldxyz/creator-core-solidity/contracts/ERC1155Creator.sol";

contract Geocache1155 is ERC1155Creator {
    constructor() ERC1155Creator() {}
}

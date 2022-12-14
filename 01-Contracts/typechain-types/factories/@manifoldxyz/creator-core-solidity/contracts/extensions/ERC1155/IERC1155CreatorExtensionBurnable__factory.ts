/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IERC1155CreatorExtensionBurnable,
  IERC1155CreatorExtensionBurnableInterface,
} from "../../../../../../@manifoldxyz/creator-core-solidity/contracts/extensions/ERC1155/IERC1155CreatorExtensionBurnable";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    name: "onBurn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IERC1155CreatorExtensionBurnable__factory {
  static readonly abi = _abi;
  static createInterface(): IERC1155CreatorExtensionBurnableInterface {
    return new utils.Interface(
      _abi
    ) as IERC1155CreatorExtensionBurnableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IERC1155CreatorExtensionBurnable {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IERC1155CreatorExtensionBurnable;
  }
}

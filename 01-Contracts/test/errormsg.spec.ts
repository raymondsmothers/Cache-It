import {
  Geocache1155,
  Geocache1155__factory,
  Geocache,
  Geocache__factory,
} from '../typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// This test suite is just for making sure that the errors show up in etherscan after adding the msg attribute
// Run this on Goerli and then verify and test in hardhat, see if error messages log correctly

describe('Geocache Project', async () => {
  // Types
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    addr3: SignerWithAddress,
    addr4: SignerWithAddress;
  let GeocacheInstance: Geocache, Geocache1155Instance: Geocache1155;

  describe('Tests', async () => {
    before(async () => {
      //Signers
      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

      // Deploying manifold creator contract (ERC1155Creator)
      const Geocache1155Factory = new Geocache1155__factory(owner);
      Geocache1155Instance = await Geocache1155Factory.deploy();
      await Geocache1155Instance.deployed();
      console.log('Geocache1155 deployed to:', Geocache1155Instance.address);

      // Deploying Community Creations contract
      const GeocacheFactory = new Geocache__factory(owner);
      GeocacheInstance = await GeocacheFactory.deploy(Geocache1155Instance.address);
      await GeocacheInstance.deployed();
      console.log('Geocache deployed to:', GeocacheInstance.address);

      // Registering geocache as an extension (necessary for using manifold)
      let tx = await Geocache1155Instance['registerExtension(address,string)'](
        GeocacheInstance.address,
        ''
      );
      await tx.wait();
    });

    beforeEach(async () => {});

    // it('Sets up constructor args correctly', async () => {
    //   expect(await GeocacheInstance.connect(owner).numGeocaches()).to.equal(0);
    //   expect(await GeocacheInstance.creatorContract()).to.equal(Geocache1155Instance.address);
    // });

    // Go and check etherscan after this and see
    it('Correctly logs error in etherscan for errors - test 1. inactive geocache 2. already minted and 3. invalid token id ', async () => {
      let txn = await GeocacheInstance.connect(owner).newGeocache(
        2, // only 2 items to make test easy
        'uri',
        String(Date.now()),
        ['1', '2', '3'],
        'epicenterlat',
        'epicenterlong',
        5,
        'Test 3',
        'sample origin story'
      );
      await txn.wait();
    });
  });
});

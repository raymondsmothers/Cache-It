import {
  Geocache1155,
  Geocache1155__factory,
  Geocache,
  Geocache__factory,
} from '../typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

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

    it('Sets up constructor args correctly', async () => {
      expect(await GeocacheInstance.connect(owner).numGeocaches()).to.equal(0);
      expect(await GeocacheInstance.creatorContract()).to.equal(Geocache1155Instance.address);
    });

    it('Anyone can create a new geocache', async () => {
      let txn = await GeocacheInstance.connect(owner).newGeocache(
        3,
        'uri',
        String(Date.now()),
        ['1', '2', '3'],
        'epicenterlat',
        'epicenterlong',
        5,
        'Test 1'
      );
      await txn.wait();
      txn = await GeocacheInstance.connect(addr1).newGeocache(
        3,
        'uri 2',
        String(Date.now()),
        ['1', '2', '3'],
        'epicenterlat',
        'epicenterlong',
        5,
        'Test 2'
      );
      await txn.wait();
      // Updates # of geocaches
      expect(Number(await GeocacheInstance.numGeocaches())).to.equal(2);
    });

    it('Only admin can mint an item in the geocache', async () => {
      // Admin minting an item for addr1 in first geocache
      let txn = await GeocacheInstance.connect(owner).mintItemInGeocache(1, addr1.address);
      await txn.wait();
      // Doesn't let non admin mint item
      await expect(
        GeocacheInstance.connect(addr1).mintItemInGeocache(1, addr1.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
      // Mapping updates
      expect(await GeocacheInstance.geocacheToNumFound(1)).to.equal(1);
    });

    it('Deactives the geocache after all of the items are found', async () => {
      // Making a geocache w three items (easy to see if inactive this way)
      let txn = await GeocacheInstance.connect(owner).newGeocache(
        3,
        'uri 3',
        String(Date.now()),
        ['1', '2', '3'],
        'epicenterlat',
        'epicenterlong',
        5,
        'Test 3'
      );
      await txn.wait();
      // Minting the # of times, shouldn't let people mint more
      expect((await GeocacheInstance.tokenIdToGeocache(2)).tokenURI).to.equal('uri 3');
      txn = await GeocacheInstance.connect(owner).mintItemInGeocache(2, addr1.address);
      await txn.wait();
      txn = await GeocacheInstance.connect(owner).mintItemInGeocache(2, addr2.address);
      await txn.wait();
      txn = await GeocacheInstance.connect(owner).mintItemInGeocache(2, addr3.address);
      await txn.wait();
      await expect(
        GeocacheInstance.connect(owner).mintItemInGeocache(2, addr4.address)
      ).to.be.revertedWithCustomError(GeocacheInstance, 'NotActiveGeocache');
    });

    it("Doesn't let a user mint to a non existent geocache", async () => {
      await expect(
        GeocacheInstance.connect(owner).mintItemInGeocache(3, addr4.address)
      ).to.be.revertedWithCustomError(GeocacheInstance, 'NonExistentToken');
      await expect(
        GeocacheInstance.connect(owner).mintItemInGeocache(35, addr4.address)
      ).to.be.revertedWithCustomError(GeocacheInstance, 'NonExistentToken');
    });

    it("Doesn't let a user mint an item in the geocache if they've already found it", async () => {
      let txn = await GeocacheInstance.connect(owner).mintItemInGeocache(1, owner.address);
      await txn.wait();
      await expect(
        GeocacheInstance.connect(owner).mintItemInGeocache(1, owner.address)
      ).to.be.revertedWithCustomError(GeocacheInstance, 'UserAlreadyFound');
    });

    it('Lets a user change geocache token URI');

    it('Correctly gets all active geocache IDs', async () => {
      const activeGeocaches = await GeocacheInstance.connect(owner).getAllActiveGeocacheIDs();
      await expect(activeGeocaches.length).to.equal(2);
    });
  });
});

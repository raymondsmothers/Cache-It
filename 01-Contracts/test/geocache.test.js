const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Geocache Project', async () => {
  // Any inter test stuff here

  describe('Tests', async () => {
    before(async () => {
      //Signers
      [owner, addr1, addr2, addr3] = await ethers.getSigners();

      // Deploying manifold creator contract (ERC1155Creator)
      const CreatorContractFactory = await ethers.getContractFactory('Geocache1155');
      CreatorContractInstance = await CreatorContractFactory.deploy();
      await CreatorContractInstance.deployed();
      console.log('CreatorContract deployed to:', CreatorContractInstance.address);

      // Deploying Community Creations contract
      const GeocacheFactory = await ethers.getContractFactory('Geocache');
      GeocacheInstance = await GeocacheFactory.deploy(CreatorContractInstance.address);
      await GeocacheInstance.deployed();
      console.log('Geocache Contract deployed to:', GeocacheInstance.address);

      // Registering geocache as an extension (necessary for using manifold)
      let tx = await CreatorContractInstance['registerExtension(address,string)'](
        GeocacheInstance.address,
        ''
      );
      await tx.wait();
    });

    beforeEach(async () => {});

    it('Sets up constructor args correctly', async () => {
      expect(await GeocacheInstance.connect(owner).numGeocaches()).to.equal(0);
      expect(await GeocacheInstance.creatorContract()).to.equal(CreatorContractInstance.address);
    });

    it('Anyone can create a new geocache', async () => {
      let txn = await GeocacheInstance.connect(owner).newGeocache(10, 'uri', Date.now());
      await txn.wait();
      txn = await GeocacheInstance.connect(addr1).newGeocache(20, 'uri 2', Date.now());
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
      // Making a geocache w three items (easy to see if inactive)
      let txn = await GeocacheInstance.connect(owner).newGeocache(3, 'uri 2', Date.now());
      await txn.wait();

      txn = await GeocacheInstance.connect(owner).mintItemInGeocache(1, owner.address);
      await txn.wait();
    });

    it("Doesn't let a user mint an item in the geocache if they've already found it");
    it("Doesn't let a user mint to a non active geocache");
    it('Lets a user change geocache token URI');
    it('Correctly gets all geocaches');
  });
});

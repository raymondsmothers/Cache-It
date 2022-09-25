const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Geocache Project', async () => {
  // Any inter test stuff here
  describe('Tests', async () => {
    before(async () => {
      //Signers
      [owner, addr1, addr2] = await ethers.getSigners();

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

    // TODO: Add tests for functionality
  });
});

import {
  Geocache1155,
  Geocache1155__factory,
  Geocache,
  Geocache__factory,
} from '../typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// For testing on Goerli
// Make sure log metadata function is working first

describe('Geocache Project', async () => {
  // Types
  let owner: SignerWithAddress;
  let GeocacheInstance: Geocache;
  let Geocache1155Instance: Geocache1155;

  describe('Tests', async () => {
    before(async () => {
      //Signers
      [owner] = await ethers.getSigners();

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
      console.log('Extension registered');
    });

    beforeEach(async () => {});

    it('Creates a new geocache', async () => {
      console.log('Creating geocache');
      let txn = await GeocacheInstance.connect(owner).newGeocache(
        3,
        'ipfs://QmXbDR6LEoPQRhdqPUSYKme6TraQd7MPbMRaT3vBknvi6K', // testing out an actual URI WITH description
        String(Date.now()),
        ['1', '2', '3'],
        'epicenterlat',
        'epicenterlong',
        5,
        'Test 1',
        'sample origin story'
      );
      await txn.wait();
    });

    it('Gets the URI for the newly made geocache', async () => {
      let txn = await GeocacheInstance.tokenURI(Geocache1155Instance.address, 0);
      console.log(txn);
    });
  });
});

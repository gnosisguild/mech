import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre, { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

import {
  calculateERC1155MechAddress,
  calculateERC1155MechMastercopyAddress,
  calculateERC721MechAddress,
  calculateERC721MechMastercopyAddress,
  calculateZodiacMechAddress,
  calculateZodiacMechMastercopyAddress,
  deployERC1155Mech,
  deployERC1155MechMastercopy,
  deployERC721Mech,
  deployERC721MechMastercopy,
  deployZodiacMech,
  deployZodiacMechMastercopy,
} from "../sdk"
import { SENTINEL_MODULES, ZERO_ADDRESS } from "../sdk/constants"
import {
  ERC1155Mech__factory,
  ERC721Mech__factory,
  ZodiacMech__factory,
} from "../typechain-types"

describe("deterministic deployment", () => {
  async function deploySingletonFactoryAndMastercopies() {
    const [signer] = await hre.ethers.getSigners()
    const deployer = hre.ethers.provider.getSigner(signer.address)

    const mastercopyAddresses = {
      erc721: await deployERC721MechMastercopy(deployer),
      erc1155: await deployERC1155MechMastercopy(deployer),
      zodiac: await deployZodiacMechMastercopy(deployer),
    }

    return {
      mastercopyAddresses,
      deployer,
    }
  }

  describe("calculateERC721MechMastercopyAddress", () => {
    it("returns the address of the ERC721Mech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(
        deploySingletonFactoryAndMastercopies
      )

      expect(calculateERC721MechMastercopyAddress()).to.equal(
        mastercopyAddresses.erc721
      )
    })
  })

  describe("calculateERC721MechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
      await loadFixture(deploySingletonFactoryAndMastercopies)

      const TestToken = await ethers.getContractFactory("ERC721Token")
      const testToken = await TestToken.deploy()

      const calculatedAddress = calculateERC721MechAddress(testToken.address, 1)

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployERC721Mech(
        testToken.address,
        1,
        hre.ethers.provider.getSigner()
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.not.equal(
        "0x"
      )
    })
  })

  describe("deployERC721MechMastercopy()", () => {
    it("initializes the mastercopy with zero address and token ID 0", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deploySingletonFactoryAndMastercopies
      )

      const mech = ERC721Mech__factory.connect(
        mastercopyAddresses.erc721,
        deployer
      )
      expect(await mech.token()).to.equal(ZERO_ADDRESS)
      expect(await mech.tokenId()).to.equal(0)
    })
  })

  ///// ERC1155Mech

  describe("calculateERC1155MechMastercopyAddress", () => {
    it("returns the address of the ERC1155Mech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(
        deploySingletonFactoryAndMastercopies
      )

      expect(calculateERC1155MechMastercopyAddress()).to.equal(
        mastercopyAddresses.erc1155
      )
    })
  })

  describe("calculateERC1155MechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
      await loadFixture(deploySingletonFactoryAndMastercopies)

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()

      const calculatedAddress = calculateERC1155MechAddress(
        testToken.address,
        [1],
        [1]
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployERC1155Mech(
        testToken.address,
        [1],
        [1],
        hre.ethers.provider.getSigner()
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.not.equal(
        "0x"
      )
    })
  })

  describe("deployERC1155MechMastercopy()", () => {
    it("initializes the mastercopy with zero address and threshold [0, 0]", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deploySingletonFactoryAndMastercopies
      )

      const mech = ERC1155Mech__factory.connect(
        mastercopyAddresses.erc1155,
        deployer
      )
      expect(await mech.token()).to.equal(ZERO_ADDRESS)
      expect(await mech.tokenIds(0)).to.equal(0)
      expect(await mech.minBalances(0)).to.equal(0)
    })
  })

  ///// ZodiacMech

  describe("calculateZodiacMechMastercopyAddress", () => {
    it("returns the address of the ZodiacMech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(
        deploySingletonFactoryAndMastercopies
      )

      expect(calculateZodiacMechMastercopyAddress()).to.equal(
        mastercopyAddresses.zodiac
      )
    })
  })

  describe("calculateZodiacMechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
      await loadFixture(deploySingletonFactoryAndMastercopies)

      const [, mod1, mod2] = await hre.ethers.getSigners()

      const calculatedAddress = calculateZodiacMechAddress([
        mod1.address,
        mod2.address,
      ])

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployZodiacMech(
        [mod1.address, mod2.address],
        hre.ethers.provider.getSigner()
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.not.equal(
        "0x"
      )
    })
  })

  describe("deployZodiacMechMastercopy()", () => {
    it("initializes the mastercopy with an empty modules array", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deploySingletonFactoryAndMastercopies
      )

      const mech = ZodiacMech__factory.connect(
        mastercopyAddresses.zodiac,
        deployer
      )

      expect(await mech.getModulesPaginated(SENTINEL_MODULES, 2)).to.deep.equal(
        [[], "0x0000000000000000000000000000000000000001"]
      )
    })
  })
})

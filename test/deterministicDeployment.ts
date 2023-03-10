import { defaultAbiCoder } from "@ethersproject/abi"
import { deployModuleFactory } from "@gnosis.pm/zodiac"
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
import { ZERO_ADDRESS } from "../sdk/constants"
import {
  ERC1155Mech__factory,
  ERC721Mech__factory,
  ZodiacMech__factory,
} from "../typechain-types"

describe("deterministic deployment", () => {
  async function deployModuleFactoryAndMastercopy() {
    const [signer] = await hre.ethers.getSigners()
    const deployer = hre.ethers.provider.getSigner(signer.address)
    const moduleProxyFactoryAddress = await deployModuleFactory(deployer)
    if (moduleProxyFactoryAddress === ZERO_ADDRESS) {
      throw new Error("Module proxy factory address is already deployed")
    }

    const mastercopyAddresses = {
      erc721: await deployERC721MechMastercopy(deployer),
      erc1155: await deployERC1155MechMastercopy(deployer),
      zodiac: await deployZodiacMechMastercopy(deployer),
    }

    return {
      moduleProxyFactoryAddress: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
      mastercopyAddresses,
      deployer,
    }
  }

  describe("calculateERC721MechMastercopyAddress", () => {
    it("returns the address of the ERC721Mech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      expect(calculateERC721MechMastercopyAddress()).to.equal(
        mastercopyAddresses.erc721
      )
    })
  })

  describe("calculateERC721MechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
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
    it("initializes the mastercopy", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      const mech = ERC721Mech__factory.connect(
        mastercopyAddresses.erc721,
        deployer
      )
      const SOME_ADDRESS = "0x1111111111111111111111111111111111111111"
      expect(
        mech.setUp(
          defaultAbiCoder.encode(["address", "uint256"], [SOME_ADDRESS, 1])
        )
      ).to.be.revertedWith("Already initialized")
    })
  })

  ///// ERC1155Mech

  describe("calculateERC1155MechMastercopyAddress", () => {
    it("returns the address of the ERC1155Mech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      expect(calculateERC1155MechMastercopyAddress()).to.equal(
        mastercopyAddresses.erc1155
      )
    })
  })

  describe("calculateERC1155MechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
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
    it("initializes the mastercopy", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      const mech = ERC1155Mech__factory.connect(
        mastercopyAddresses.erc1155,
        deployer
      )
      const SOME_ADDRESS = "0x1111111111111111111111111111111111111111"
      expect(
        mech.setUp(
          defaultAbiCoder.encode(
            ["address", "uint256[]", "uint256[]"],
            [SOME_ADDRESS, [1], [1]]
          )
        )
      ).to.be.revertedWith("Already initialized")
    })
  })

  ///// ZodiacMech

  describe("calculateZodiacMechMastercopyAddress", () => {
    it("returns the address of the ZodiacMech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      expect(calculateZodiacMechMastercopyAddress()).to.equal(
        mastercopyAddresses.zodiac
      )
    })
  })

  describe("calculateZodiacMechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
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
    it("initializes the mastercopy", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      const mech = ZodiacMech__factory.connect(
        mastercopyAddresses.zodiac,
        deployer
      )
      const SOME_ADDRESS = "0x1111111111111111111111111111111111111111"
      expect(
        mech.setUp(defaultAbiCoder.encode(["address[]"], [[SOME_ADDRESS]]))
      ).to.be.revertedWith("Already initialized")
    })
  })
})

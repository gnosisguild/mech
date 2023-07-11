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
import { SENTINEL_MODULES, ZERO_ADDRESS } from "../sdk/src/constants"
import {
  ERC1155Mech__factory,
  ERC721Mech__factory,
  ZodiacMech__factory,
} from "../typechain-types"

describe("deterministic deployment", () => {
  async function deployModuleFactoryAndMastercopy() {
    const [signer, alice] = await hre.ethers.getSigners()
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
      moduleProxyFactoryAddress,
      mastercopyAddresses,
      deployer,
      alice,
    }
  }

  describe("deployERC721Mech()", () => {
    it("correctly initializes the mech proxy instance", async () => {
      const { alice, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      const TestToken = await ethers.getContractFactory("ERC721Token")
      const testToken = await TestToken.deploy()

      await deployERC721Mech(testToken.address, 1, deployer)
      const mechAddress = calculateERC721MechAddress(testToken.address, 1)
      const mech = ERC721Mech__factory.connect(mechAddress, alice)

      expect(await mech.token()).to.equal(testToken.address)
      expect(await mech.tokenId()).to.equal(1)
    })
  })

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
      await loadFixture(deployModuleFactoryAndMastercopy)

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

    it("makes sure no one can operate the mastercopy", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )
      const mech = ERC721Mech__factory.connect(
        mastercopyAddresses.erc721,
        deployer
      )
      await expect(mech.isOperator(deployer._address)).to.be.reverted
    })
  })

  ///// ERC1155Mech

  describe("deployERC1155Mech()", () => {
    it("correctly initializes the mech proxy instance", async () => {
      const { alice, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()

      await deployERC1155Mech(testToken.address, [1, 2], [10, 20], 0, deployer)
      const mechAddress = calculateERC1155MechAddress(
        testToken.address,
        [1, 2],
        [10, 20],
        0
      )
      const mech = ERC1155Mech__factory.connect(mechAddress, alice)

      expect(await mech.token()).to.equal(testToken.address)
      expect(await mech.tokenIds(0)).to.equal(1)
      expect(await mech.tokenIds(1)).to.equal(2)
      expect(await mech.minBalances(0)).to.equal(10)
      expect(await mech.minBalances(1)).to.equal(20)
    })
  })

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
      await loadFixture(deployModuleFactoryAndMastercopy)

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()

      const calculatedAddress = calculateERC1155MechAddress(
        testToken.address,
        [1],
        [1],
        0
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployERC1155Mech(
        testToken.address,
        [1],
        [1],
        0,
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
        deployModuleFactoryAndMastercopy
      )

      const mech = ERC1155Mech__factory.connect(
        mastercopyAddresses.erc1155,
        deployer
      )
      expect(await mech.token()).to.equal(ZERO_ADDRESS)
      expect(await mech.tokenIds(0)).to.equal(0)
      expect(await mech.minBalances(0)).to.equal(0)
      expect(await mech.minTotalBalance()).to.equal(0)
    })

    it("makes sure no one can operate the mastercopy", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )
      const mech = ERC1155Mech__factory.connect(
        mastercopyAddresses.erc1155,
        deployer
      )
      await expect(mech.isOperator(deployer._address)).to.be.reverted
    })
  })

  ///// ZodiacMech

  describe("deployZodiacMech()", () => {
    it("correctly initializes the mech proxy instance", async () => {
      const { deployer, alice } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      await deployZodiacMech([alice.address], deployer)
      const mechAddress = calculateZodiacMechAddress([alice.address])
      const mech = ZodiacMech__factory.connect(mechAddress, alice)

      expect(await mech.getModulesPaginated(SENTINEL_MODULES, 2)).to.deep.equal(
        [[alice.address], SENTINEL_MODULES]
      )
    })
  })

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
      await loadFixture(deployModuleFactoryAndMastercopy)

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
        deployModuleFactoryAndMastercopy
      )

      const mech = ZodiacMech__factory.connect(
        mastercopyAddresses.zodiac,
        deployer
      )

      expect(await mech.getModulesPaginated(SENTINEL_MODULES, 2)).to.deep.equal(
        [[], SENTINEL_MODULES]
      )
    })

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

    it("makes sure no one can operate the mastercopy", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      const mech = ZodiacMech__factory.connect(
        mastercopyAddresses.zodiac,
        deployer
      )
      expect(await mech.isOperator(deployer._address)).to.be.false
    })
  })
})

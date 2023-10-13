import { defaultAbiCoder } from "@ethersproject/abi"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre, { ethers } from "hardhat"

import {
  calculateERC1155ThresholdMechAddress,
  calculateERC1155ThresholdMechMastercopyAddress,
  calculateERC1155TokenboundMechAddress,
  calculateERC1155TokenboundMechMastercopyAddress,
  calculateERC721TokenboundMechAddress,
  calculateERC721TokenboundMechMastercopyAddress,
  calculateZodiacMechAddress,
  calculateZodiacMechMastercopyAddress,
  deployERC1155ThresholdMech,
  deployERC1155ThresholdMechMastercopy,
  deployERC1155TokenboundMech,
  deployERC1155TokenboundMechMastercopy,
  deployERC721TokenboundMech,
  deployERC721TokenboundMechMastercopy,
  deployZodiacMech,
  deployZodiacMechMastercopy,
} from "../sdk"
import {
  DEFAULT_SALT,
  SENTINEL_MODULES,
  ZERO_ADDRESS,
} from "../sdk/src/constants"
import {
  ERC1155TokenboundMech__factory,
  ERC721TokenboundMech__factory,
  ZodiacMech__factory,
} from "../typechain-types"

import { deployFactories } from "./utils"

describe("deterministic deployment", () => {
  describe("calculateERC721TokenboundMechAddress()", () => {
    it("returns the correct address", async () => {
      const { deployerClient, erc6551Registry } = await loadFixture(
        deployFactories
      )
      const chainId = deployerClient.chain.id

      const TestToken = await ethers.getContractFactory("ERC721Token")
      const testToken = await TestToken.deploy()
      const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

      expect(
        calculateERC721TokenboundMechAddress({
          chainId,
          token: testTokenAddress,
          tokenId: 1n,
          from: (await erc6551Registry.getAddress()) as `0x${string}`,
        })
      ).to.equal(
        await erc6551Registry.account(
          calculateERC721TokenboundMechMastercopyAddress(),
          deployerClient.chain.id,
          testTokenAddress,
          1n,
          DEFAULT_SALT
        )
      )
    })
  })

  describe("deployERC721TokenboundMech()", () => {
    it("correctly initializes the 6551 proxy instance at the expected address", async () => {
      const { alice, deployerClient, erc6551Registry } = await loadFixture(
        deployFactories
      )

      const chainId = deployerClient.chain.id
      const registryAddress =
        (await erc6551Registry.getAddress()) as `0x${string}`

      const TestToken = await ethers.getContractFactory("ERC721Token")
      const testToken = await TestToken.deploy()
      const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

      await deployERC721TokenboundMechMastercopy(deployerClient)
      await deployERC721TokenboundMech(deployerClient, {
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      })

      const mechAddress = calculateERC721TokenboundMechAddress({
        chainId,
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      })

      const mech = ERC721TokenboundMech__factory.connect(mechAddress, alice)

      expect(await mech.token()).to.deep.equal([
        BigInt(deployerClient.chain.id),
        testTokenAddress,
        1n,
      ])
    })
  })

  describe("calculateERC721TokenboundMechMastercopyAddress", () => {
    it("returns the address of the ERC721TokenboundMech mastercopy", async () => {
      const { deployerClient } = await loadFixture(deployFactories)

      expect(
        await hre.ethers.provider.getCode(
          calculateERC721TokenboundMechMastercopyAddress()
        )
      ).to.equal("0x")

      await deployERC721TokenboundMechMastercopy(deployerClient)

      expect(
        await hre.ethers.provider.getCode(
          calculateERC721TokenboundMechMastercopyAddress()
        )
      ).to.not.equal("0x")
    })
  })

  ///// ERC1155TokenboundMech

  describe("calculateERC1155TokenboundMechAddress()", () => {
    it("returns the correct address", async () => {
      const { deployerClient, erc6551Registry } = await loadFixture(
        deployFactories
      )
      const chainId = deployerClient.chain.id
      const registryAddress =
        (await erc6551Registry.getAddress()) as `0x${string}`

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()
      const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

      expect(
        calculateERC1155TokenboundMechAddress({
          chainId,
          token: testTokenAddress,
          tokenId: 1n,
          from: registryAddress,
        })
      ).to.equal(
        await erc6551Registry.account(
          calculateERC1155TokenboundMechMastercopyAddress(),
          deployerClient.chain.id,
          testTokenAddress,
          1n,
          DEFAULT_SALT
        )
      )
    })
  })

  describe("deployERC1155TokenboundMech()", () => {
    it("correctly initializes the 6551 proxy instance at the expected address", async () => {
      const { alice, deployerClient, erc6551Registry } = await loadFixture(
        deployFactories
      )

      const chainId = deployerClient.chain.id
      const registryAddress =
        (await erc6551Registry.getAddress()) as `0x${string}`

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()
      const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

      await deployERC1155TokenboundMechMastercopy(deployerClient)
      await deployERC1155TokenboundMech(deployerClient, {
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      })

      const mechAddress = calculateERC1155TokenboundMechAddress({
        chainId,
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      })

      const mech = ERC1155TokenboundMech__factory.connect(mechAddress, alice)

      expect(await mech.token()).to.deep.equal([
        BigInt(deployerClient.chain.id),
        testTokenAddress,
        1n,
      ])
    })
  })

  describe("calculateERC1155TokenboundMechMastercopyAddress", () => {
    it("returns the address of the ERC721TokenboundMech mastercopy", async () => {
      const { deployerClient } = await loadFixture(deployFactories)

      expect(
        await hre.ethers.provider.getCode(
          calculateERC1155TokenboundMechMastercopyAddress()
        )
      ).to.equal("0x")

      await deployERC1155TokenboundMechMastercopy(deployerClient)

      expect(
        await hre.ethers.provider.getCode(
          calculateERC1155TokenboundMechMastercopyAddress()
        )
      ).to.not.equal("0x")
    })
  })

  ///// ERC1155ThresholdMech

  describe.skip("deployERC1155ThresholdMech()", () => {
    it("correctly initializes the mech proxy instance", async () => {
      const { alice, deployer } = await loadFixture(deployFactories)

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()

      await deployERC1155ThresholdMech(
        testToken.getAddress(),
        [1, 2],
        [10, 20],
        0,
        deployer
      )
      const mechAddress = calculateERC1155ThresholdMechAddress(
        testToken.getAddress(),
        [1, 2],
        [10, 20],
        0
      )
      const mech = ERC1155ThresholdMech__factory.connect(mechAddress, alice)

      expect(await mech.token()).to.equal(testToken.getAddress())
      expect(await mech.tokenIds(0)).to.equal(1)
      expect(await mech.tokenIds(1)).to.equal(2)
      expect(await mech.minBalances(0)).to.equal(10)
      expect(await mech.minBalances(1)).to.equal(20)
    })
  })

  describe.skip("calculateERC1155ThresholdMechMastercopyAddress", () => {
    it("returns the address of the ERC1155ThresholdMech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(deployFactories)

      expect(calculateERC1155ThresholdMechMastercopyAddress()).to.equal(
        mastercopyAddresses.erc1155
      )
    })
  })

  describe.skip("calculateERC1155ThresholdMechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
      await loadFixture(deployFactories)

      const TestToken = await ethers.getContractFactory("ERC1155Token")
      const testToken = await TestToken.deploy()

      const calculatedAddress = calculateERC1155ThresholdMechAddress(
        testToken.getAddress(),
        [1],
        [1],
        0
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployERC1155ThresholdMech(
        testToken.getAddress(),
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

  ///// ZodiacMech

  describe.skip("deployZodiacMech()", () => {
    it("correctly initializes the mech proxy instance", async () => {
      const { deployer, alice } = await loadFixture(deployFactories)

      await deployZodiacMech([alice.getAddress()], deployer)
      const mechAddress = calculateZodiacMechAddress([alice.getAddress()])
      const mech = ZodiacMech__factory.connect(mechAddress, alice)

      expect(await mech.getModulesPaginated(SENTINEL_MODULES, 2)).to.deep.equal(
        [[alice.getAddress()], SENTINEL_MODULES]
      )
    })
  })

  describe.skip("calculateZodiacMechMastercopyAddress", () => {
    it("returns the address of the ZodiacMech mastercopy", async () => {
      const { mastercopyAddresses } = await loadFixture(deployFactories)

      expect(calculateZodiacMechMastercopyAddress()).to.equal(
        mastercopyAddresses.zodiac
      )
    })
  })

  describe.skip("calculateZodiacMechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
      await loadFixture(deployFactories)

      const [, mod1, mod2] = await hre.ethers.getSigners()

      const calculatedAddress = calculateZodiacMechAddress([
        mod1.getAddress(),
        mod2.getAddress(),
      ])

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployZodiacMech(
        [mod1.getAddress(), mod2.getAddress()],
        hre.ethers.provider.getSigner()
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.not.equal(
        "0x"
      )
    })
  })

  describe.skip("deployZodiacMechMastercopy()", () => {
    it("initializes the mastercopy with an empty modules array", async () => {
      const { mastercopyAddresses, deployer } = await loadFixture(
        deployFactories
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
        deployFactories
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
        deployFactories
      )

      const mech = ZodiacMech__factory.connect(
        mastercopyAddresses.zodiac,
        deployer
      )
      expect(await mech.isOperator(deployer._address)).to.be.false
    })
  })
})

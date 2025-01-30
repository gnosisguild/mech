import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { parseEther, randomBytes } from "ethers"
import { ethers } from "hardhat"

import {
  calculateERC721TokenboundMechAddress,
  deployERC721TokenboundMech,
  deployERC721TokenboundMechMastercopy,
} from "../sdk/src"
import { ERC721TokenboundMech__factory } from "../typechain-types"

import { deployFactories } from "./utils"

describe("Receiver base contract", () => {
  before(async () => {
    await ethers.provider.send("hardhat_reset", [])
  })
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const { deployerClient, erc6551Registry, alice } = await deployFactories()

    await deployERC721TokenboundMechMastercopy(deployerClient)

    const TestToken = await ethers.getContractFactory("ERC721Token")
    const testToken = await TestToken.deploy()
    const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

    const chainId = deployerClient.chain.id
    const registryAddress =
      (await erc6551Registry.getAddress()) as `0x${string}`

    await deployERC721TokenboundMech(deployerClient, {
      token: testTokenAddress,
      tokenId: 1n,
      from: registryAddress,
    })

    const mech1 = ERC721TokenboundMech__factory.connect(
      calculateERC721TokenboundMechAddress({
        chainId,
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      }),
      ethers.provider
    )

    // make alice the operator of mech1
    await testToken.mintToken(alice.address, 1n)

    // Fixtures can return anything you consider useful for your tests
    return {
      testToken,
      mech1,
      alice,
      chainId,
    }
  }

  describe("send and receive tokens", () => {
    it("is able to receive ether", async () => {
      const { mech1 } = await loadFixture(deployMech1)
      const [deployer] = await ethers.getSigners()

      await deployer.sendTransaction({
        to: await mech1.getAddress(),
        value: parseEther("1.0"),
      })

      expect(await ethers.provider.getBalance(mech1.getAddress())).to.equal(
        parseEther("1.0")
      )
    })

    it("can receive and send erc20 tokens", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      const Erc20Token = await ethers.getContractFactory("ERC20Token")
      const erc20Token = await Erc20Token.deploy()

      await erc20Token.mintToken(await mech1.getAddress(), 1000)
      expect(await erc20Token.balanceOf(await mech1.getAddress())).to.equal(
        1000
      )

      await mech1
        .connect(alice)
        ["execute(address,uint256,bytes,uint8)"](
          await erc20Token.getAddress(),
          0,
          erc20Token.interface.encodeFunctionData("transfer", [
            await alice.getAddress(),
            500,
          ]),
          0
        )

      expect(await erc20Token.balanceOf(await alice.getAddress())).to.equal(500)
    })

    it("can receive erc721 tokens", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint alice another nft to send to the mech
      await testToken.mintToken(await alice.getAddress(), 2)

      await alice.sendTransaction({
        to: await testToken.getAddress(),
        value: 0,
        data: testToken.interface.encodeFunctionData(
          "safeTransferFrom(address,address,uint256)",
          [await alice.getAddress(), await mech1.getAddress(), 2]
        ),
      })
      expect(await testToken.ownerOf(2)).to.equal(await mech1.getAddress())
    })

    it("can receive erc1155 tokens", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      const Erc1155Token = await ethers.getContractFactory("ERC1155Token")
      const erc1155Token = await Erc1155Token.deploy()

      // mint alice an 1155 nft to send to the mech
      await erc1155Token.mintToken(
        await alice.getAddress(),
        1,
        2,
        randomBytes(0)
      )

      await alice.sendTransaction({
        to: await erc1155Token.getAddress(),
        value: 0,
        data: erc1155Token.interface.encodeFunctionData("safeTransferFrom", [
          await alice.getAddress(),
          await mech1.getAddress(),
          1,
          2,
          randomBytes(0),
        ]),
      })
      expect(
        await erc1155Token.balanceOf(await mech1.getAddress(), 1)
      ).to.equal(2)
    })

    it("can receive erc1155 token batches", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      const Erc1155Token = await ethers.getContractFactory("ERC1155Token")
      const erc1155Token = await Erc1155Token.deploy()

      // mint alice some tokens
      await erc1155Token.mintToken(
        await alice.getAddress(),
        1,
        10,
        randomBytes(0)
      )
      await erc1155Token.mintToken(
        await alice.getAddress(),
        2,
        20,
        randomBytes(0)
      )

      await alice.sendTransaction({
        to: await erc1155Token.getAddress(),
        value: 0,
        data: erc1155Token.interface.encodeFunctionData(
          "safeBatchTransferFrom",
          [
            await alice.getAddress(),
            await mech1.getAddress(),
            [1, 2],
            [10, 20],
            randomBytes(0),
          ]
        ),
      })
      expect(
        await erc1155Token.balanceOf(await mech1.getAddress(), 1)
      ).to.equal(10)
      expect(
        await erc1155Token.balanceOf(await mech1.getAddress(), 2)
      ).to.equal(20)
    })
  })
})

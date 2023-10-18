import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

import {
  calculateERC721TokenboundMechAddress,
  deployERC721TokenboundMech,
  deployERC721TokenboundMechMastercopy,
} from "../sdk/src"
import { ERC721TokenboundMech__factory } from "../typechain-types"

import { deployFactories } from "./utils"

describe("ERC721TokenboundMech contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const { deployerClient, erc6551Registry, alice, bob } =
      await deployFactories()

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

    // Fixtures can return anything you consider useful for your tests
    return {
      testToken,
      mech1,
      alice,
      bob,
      chainId,
    }
  }

  describe("token()", () => {
    it("should return chain ID. token address and token ID", async () => {
      const { mech1, chainId, testToken } = await loadFixture(deployMech1)

      expect(await mech1.token()).to.deep.equal([
        chainId,
        await testToken.getAddress(),
        1n,
      ])
    })
  })

  describe("isOperator()", () => {
    it("returns true for the owner of the linked NFT", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1n)
      expect(await mech1.isOperator(alice.address)).to.equal(true)
    })

    it("returns false for any other address", async () => {
      const { mech1, testToken, alice, bob } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1n)
      // mint testToken#2 to bob
      await testToken.mintToken(bob.address, 2n)

      // bob does not hold mech1 since he doesn't own testToken#1
      expect(await mech1.isOperator(bob.address)).to.equal(false)
    })

    it("reverts if the linked token does not exist", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // testToken#1 has not been minted
      expect(mech1.isOperator(alice.address)).to.be.revertedWith(
        "ERC721: invalid token ID"
      )
    })
  })
})

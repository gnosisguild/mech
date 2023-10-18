import { verifyMessage } from "@ambire/signature-validator"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

import {
  calculateERC721TokenboundMechAddress,
  deployERC721TokenboundMech,
  deployERC721TokenboundMechMastercopy,
  signWithMech,
} from "../sdk/src"
import { ERC721TokenboundMech__factory } from "../typechain-types"

import { deployFactories } from "./utils"

describe("signing", () => {
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

    // make alice the operator of mech1
    await testToken.mintToken(await alice.getAddress(), 1n)

    // Fixtures can return anything you consider useful for your tests
    return {
      testToken,
      mech1,
      alice,
      bob,
      chainId,
    }
  }

  describe("signWithMech()", () => {
    it("generates valid EIP-1272 signatures", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      const message = "Congratulations!"

      const operatorSignature = await alice.signMessage(message)
      const mechSignature = signWithMech(
        await mech1.getAddress(),
        operatorSignature
      )

      const isValidSig = await verifyMessage({
        signer: await mech1.getAddress(),
        message,
        signature: mechSignature,
        provider: ethers.provider,
      })

      expect(isValidSig).to.be.true
    })
  })
})

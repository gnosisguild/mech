import { verifyMessage } from "@ambire/signature-validator"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

import { signWithMech } from "../sdk"

describe("signing", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const TestToken = await ethers.getContractFactory("ERC721Token")
    const ERC721Mech = await ethers.getContractFactory("ERC721Mech")
    const [deployer, alice, bob, eve] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const mech1 = await ERC721Mech.deploy(testToken.address, 1)

    await mech1.deployed()
    await testToken.mintToken(alice.address, 1)

    // Fixtures can return anything you consider useful for your tests
    return { ERC721Mech, testToken, mech1, alice, bob, eve }
  }

  describe("signWithMech()", () => {
    it("generates valid EIP-1272 signatures", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      const message = "Congratulations!"

      const operatorSignature = await alice.signMessage(message)
      const mechSignature = signWithMech(mech1.address, operatorSignature)

      const isValidSig = await verifyMessage({
        signer: mech1.address,
        message,
        signature: mechSignature,
        provider: ethers.provider,
      })

      expect(isValidSig).to.be.true
    })
  })
})

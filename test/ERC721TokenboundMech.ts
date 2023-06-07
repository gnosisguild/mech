import { defaultAbiCoder } from "@ethersproject/abi"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("ERC721TokenboundMech contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const TestToken = await ethers.getContractFactory("ERC721Token")
    const ERC721TokenboundMech = await ethers.getContractFactory(
      "ERC721TokenboundMech"
    )
    const [, alice, bob] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const mech1 = await ERC721TokenboundMech.deploy(testToken.address, 1)

    await mech1.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { ERC721TokenboundMech, testToken, mech1, alice, bob }
  }

  describe("deployment", () => {
    it("should set token address and ID", async () => {
      const { mech1, testToken } = await loadFixture(deployMech1)

      expect(await mech1.token()).to.equal(testToken.address)
      expect(await mech1.tokenId()).to.equal(1)
    })

    it("should not allow any calls to setUp() afterwards", async () => {
      const { mech1, testToken } = await loadFixture(deployMech1)

      expect(
        mech1.setUp(
          defaultAbiCoder.encode(["address", "uint256"], [testToken.address, 2])
        )
      ).to.be.revertedWith("Already initialized")
    })
  })

  describe("isOperator()", () => {
    it("returns true for the owner of the linked NFT", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)
      expect(await mech1.isOperator(alice.address)).to.equal(true)
    })

    it("returns false for any other address", async () => {
      const { mech1, testToken, alice, bob } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)
      // mint testToken#2 to bob
      await testToken.mintToken(bob.address, 2)

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

import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

describe("ClubCardERC721 contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployClubCard1() {
    const TestToken = await ethers.getContractFactory("ERC721Token")
    const ClubCardERC721 = await ethers.getContractFactory("ClubCardERC721")
    const [deployer, alice, bob] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const clubCard1 = await ClubCardERC721.deploy(testToken.address, 1)

    await clubCard1.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { ClubCardERC721, testToken, clubCard1, alice, bob }
  }

  describe("deployment", () => {
    it("should set token address and ID", async () => {
      const { clubCard1, testToken } = await loadFixture(deployClubCard1)

      expect(await clubCard1.token()).to.equal(testToken.address)
      expect(await clubCard1.tokenId()).to.equal(1)
    })
  })

  describe("isCardHolder()", () => {
    it("returns true for the owner of the linked NFT", async () => {
      const { clubCard1, testToken, alice } = await loadFixture(deployClubCard1)
      // clubCard1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)
      expect(await clubCard1.isCardHolder(alice.address)).to.equal(true)
    })

    it("returns false for any other address", async () => {
      const { clubCard1, testToken, alice, bob } = await loadFixture(
        deployClubCard1
      )
      // clubCard1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)
      // mint testToken#2 to bob
      await testToken.mintToken(bob.address, 2)

      // bob does not hold clubCard1 since he doesn't own testToken#1
      expect(await clubCard1.isCardHolder(bob.address)).to.equal(false)
    })

    it("reverts if the linked token does not exist", async () => {
      const { clubCard1, testToken, alice, bob } = await loadFixture(
        deployClubCard1
      )
      // clubCard1 is linked to testToken#1

      // testToken#1 has not been minted
      expect(clubCard1.isCardHolder(alice.address)).to.be.revertedWith(
        "ERC721: invalid token ID"
      )
    })
  })
})

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("ERC1155Mech contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const TestToken = await ethers.getContractFactory("ERC1155Token")
    const ERC1155Mech = await ethers.getContractFactory("ERC1155Mech")
    const [, alice, bob] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const mech1 = await ERC1155Mech.deploy(
      testToken.address,
      [1, 2, 3],
      [1, 2, 3]
    )

    await mech1.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { ERC1155Mech, testToken, mech1, alice, bob }
  }

  describe("deployment", () => {
    it("sets token address, ids, and min balances", async () => {
      const { testToken } = await loadFixture(deployMech1)

      const ERC1155Mech = await ethers.getContractFactory("ERC1155Mech")
      const mechWithAllThresholds = await ERC1155Mech.deploy(
        testToken.address,
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        [11, 22, 33, 44, 55, 66, 77, 88, 99, 100, 111, 122, 133, 144, 155, 166]
      )

      expect(await mechWithAllThresholds.token()).to.equal(testToken.address)

      expect(await mechWithAllThresholds.tokenIds(0)).to.equal(1)
      expect(await mechWithAllThresholds.tokenIds(1)).to.equal(2)
      expect(await mechWithAllThresholds.tokenIds(2)).to.equal(3)
      expect(await mechWithAllThresholds.tokenIds(3)).to.equal(4)
      expect(await mechWithAllThresholds.tokenIds(4)).to.equal(5)
      expect(await mechWithAllThresholds.tokenIds(5)).to.equal(6)
      expect(await mechWithAllThresholds.tokenIds(6)).to.equal(7)
      expect(await mechWithAllThresholds.tokenIds(7)).to.equal(8)
      expect(await mechWithAllThresholds.tokenIds(8)).to.equal(9)
      expect(await mechWithAllThresholds.tokenIds(9)).to.equal(10)
      expect(await mechWithAllThresholds.tokenIds(10)).to.equal(11)
      expect(await mechWithAllThresholds.tokenIds(11)).to.equal(12)
      expect(await mechWithAllThresholds.tokenIds(12)).to.equal(13)
      expect(await mechWithAllThresholds.tokenIds(13)).to.equal(14)
      expect(await mechWithAllThresholds.tokenIds(14)).to.equal(15)
      expect(await mechWithAllThresholds.tokenIds(15)).to.equal(16)

      expect(await mechWithAllThresholds.minBalances(0)).to.equal(11)
      expect(await mechWithAllThresholds.minBalances(1)).to.equal(22)
      expect(await mechWithAllThresholds.minBalances(2)).to.equal(33)
      expect(await mechWithAllThresholds.minBalances(3)).to.equal(44)
      expect(await mechWithAllThresholds.minBalances(4)).to.equal(55)
      expect(await mechWithAllThresholds.minBalances(5)).to.equal(66)
      expect(await mechWithAllThresholds.minBalances(6)).to.equal(77)
      expect(await mechWithAllThresholds.minBalances(7)).to.equal(88)
      expect(await mechWithAllThresholds.minBalances(8)).to.equal(99)
      expect(await mechWithAllThresholds.minBalances(9)).to.equal(100)
      expect(await mechWithAllThresholds.minBalances(10)).to.equal(111)
      expect(await mechWithAllThresholds.minBalances(11)).to.equal(122)
      expect(await mechWithAllThresholds.minBalances(12)).to.equal(133)
      expect(await mechWithAllThresholds.minBalances(13)).to.equal(144)
      expect(await mechWithAllThresholds.minBalances(14)).to.equal(155)
      expect(await mechWithAllThresholds.minBalances(15)).to.equal(166)
    })
  })

  describe("isOperator()", () => {
    it("returns true for an address that has meets the token threshold", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint sufficient tokens to alice
      await testToken.mintToken(alice.address, 1, 1, "0x")
      await testToken.mintToken(alice.address, 2, 2, "0x")
      await testToken.mintToken(alice.address, 3, 3, "0x")

      expect(await mech1.isOperator(alice.address)).to.equal(true)
    })

    it("returns false for any other address", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint one token#3 to few to alice
      await testToken.mintToken(alice.address, 1, 1, "0x")
      await testToken.mintToken(alice.address, 2, 2, "0x")
      await testToken.mintToken(alice.address, 3, 2, "0x")

      // bob does not hold mech1 since he doesn't own testToken#1
      expect(await mech1.isOperator(alice.address)).to.equal(false)
    })

    it("returns false if some of linked token IDs do not exist", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      expect(await mech1.isOperator(alice.address)).to.equal(false)
    })
  })

  describe("tokenIds()", () => {
    it("reverts if index is out of bounds", async () => {
      const { mech1 } = await loadFixture(deployMech1)
      await expect(mech1.tokenIds(3)).to.be.revertedWith("Index out of bounds")
    })
  })

  describe("minBalances()", () => {
    it("reverts if index is out of bounds", async () => {
      const { mech1 } = await loadFixture(deployMech1)
      await expect(mech1.minBalances(3)).to.be.revertedWith(
        "Index out of bounds"
      )
    })
  })
})

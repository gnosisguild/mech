import { defaultAbiCoder } from "@ethersproject/abi"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe.skip("ERC1155ThresholdMech contract", () => {
  before(async () => {
    await ethers.provider.send("hardhat_reset", [])
  })
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const TestToken = await ethers.getContractFactory("ERC1155Token")
    const ERC1155ThresholdMech = await ethers.getContractFactory(
      "ERC1155ThresholdMech"
    )
    const [, alice, bob] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const mech1 = await ERC1155ThresholdMech.deploy(
      testToken.address,
      [1, 2, 3],
      [1, 2, 3],
      0
    )

    await mech1.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { ERC1155ThresholdMech, testToken, mech1, alice, bob }
  }

  describe("deployment", () => {
    it("sets token address, ids, and min balances", async () => {
      const { testToken, mech1 } = await loadFixture(deployMech1)

      expect(await mech1.token()).to.equal(testToken.address)

      expect(await mech1.tokenIds(0)).to.equal(1)
      expect(await mech1.tokenIds(1)).to.equal(2)
      expect(await mech1.tokenIds(2)).to.equal(3)

      expect(await mech1.minBalances(0)).to.equal(1)
      expect(await mech1.minBalances(1)).to.equal(2)
      expect(await mech1.minBalances(2)).to.equal(3)

      expect(await mech1.minTotalBalance()).to.equal(0)
    })

    it("reverts if tokenIds and minBalances are not of same length", async () => {
      const { testToken, ERC1155ThresholdMech } = await loadFixture(deployMech1)
      await expect(
        ERC1155ThresholdMech.deploy(testToken.address, [1, 2, 3], [1, 2], 0)
      ).to.be.revertedWith("Length mismatch")
    })

    it("should not allow any calls to setUp() afterwards", async () => {
      const { mech1, testToken } = await loadFixture(deployMech1)
      expect(
        mech1.setUp(
          defaultAbiCoder.encode(
            ["address", "uint256[]", "uint256[]"],
            [testToken.address, [4], [4]]
          )
        )
      ).to.be.revertedWith("Already initialized")
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

    it("returns false if the minimum total balance threshold is not met", async () => {
      const { testToken, ERC1155ThresholdMech, alice } = await loadFixture(
        deployMech1
      )
      const mech = await ERC1155ThresholdMech.deploy(
        testToken.address,
        [1, 2],
        [1, 1],
        4
      )

      // mint a total token balance of 2 to alice
      await testToken.mintToken(alice.address, 1, 1, "0x")
      await testToken.mintToken(alice.address, 2, 1, "0x")

      expect(await mech.isOperator(alice.address)).to.equal(false)

      // mint an additional 2 tokens to alice, now total balance is 4
      await testToken.mintToken(alice.address, 1, 2, "0x")

      expect(await mech.isOperator(alice.address)).to.equal(true)
    })
  })
})

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
import { signWithClubCard } from "../sdk/signWithClubCard"

const EIP1271_MAGIC_VALUE = "0x1626ba7e"

describe("ClubCardBase contract", () => {
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

  it("should be able to receive ether", async () => {
    const { clubCard1 } = await loadFixture(deployClubCard1)
    const [deployer] = await ethers.getSigners()

    await deployer.sendTransaction({
      to: clubCard1.address,
      value: ethers.utils.parseEther("1.0"),
    })

    expect(await ethers.provider.getBalance(clubCard1.address)).to.equal(
      ethers.utils.parseEther("1.0")
    )
  })

  describe("isValidSignature()", () => {
    it("returns magic value for a valid signature of the card holder EOA", async () => {
      const { clubCard1, testToken, alice } = await loadFixture(deployClubCard1)
      // clubCard1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      const message = "Test message"
      const signature = await alice.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      expect(await clubCard1.isValidSignature(messageHash, signature)).to.equal(
        EIP1271_MAGIC_VALUE
      )
    })

    it("returns zero for any other ECDSA signature", async () => {
      const { clubCard1, testToken, alice, bob } = await loadFixture(
        deployClubCard1
      )
      // clubCard1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // let bob sign message
      const message = "Test message"
      const signature = await bob.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      expect(await clubCard1.isValidSignature(messageHash, signature)).to.equal(
        "0xffffffff"
      )
    })

    it("returns magic value for a valid EIP-1271 signature of the card holder contract", async () => {
      const { ClubCardERC721, clubCard1, testToken, alice } = await loadFixture(
        deployClubCard1
      )
      // clubCard1 is linked to testToken#1

      const clubCard2 = await ClubCardERC721.deploy(testToken.address, 2)
      await clubCard2.deployed()

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to clubCard1
      await testToken.mintToken(clubCard1.address, 2)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      const contractSignature = signWithClubCard(
        clubCard1.address,
        ecdsaSignature
      )

      expect(
        await clubCard2.isValidSignature(messageHash, contractSignature)
      ).to.equal(EIP1271_MAGIC_VALUE)
    })

    it("returns zero for an invalid EIP-1271 signature of the card holder contract", async () => {
      const { ClubCardERC721, clubCard1, testToken, alice, bob } =
        await loadFixture(deployClubCard1)
      // clubCard1 is linked to testToken#1

      const clubCard2 = await ClubCardERC721.deploy(testToken.address, 2)
      await clubCard2.deployed()

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to clubCard1
      await testToken.mintToken(clubCard1.address, 2)

      const message = "Test message"
      const wrongEcdsaSignature = await bob.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      const contractSignature = signWithClubCard(
        clubCard1.address,
        wrongEcdsaSignature
      )

      expect(
        await clubCard2.isValidSignature(messageHash, contractSignature)
      ).to.equal("0xffffffff")
    })

    it("returns zero for an EIP-1271 signature from a contract that does not hold the card", async () => {
      const { ClubCardERC721, clubCard1, testToken, alice } = await loadFixture(
        deployClubCard1
      )
      // clubCard1 is linked to testToken#1

      const clubCard2 = await ClubCardERC721.deploy(testToken.address, 2)
      await clubCard2.deployed()

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to clubCard1
      await testToken.mintToken(clubCard1.address, 2)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      const contractSignature = signWithClubCard(
        clubCard2.address,
        ecdsaSignature
      )

      expect(
        await clubCard2.isValidSignature(messageHash, contractSignature)
      ).to.equal("0xffffffff")
    })
  })

  describe("exec()", () => {
    it("reverts if called from an account that doesn't hold the card")
    it("returns true if the call succeeds")
    it("returns false if the call reverts")
  })

  describe("execReturnData()", () => {
    it("reverts if called from an account that doesn't hold the card")
    it("returns true and call result if the call succeeds")
    it("returns false and revert data if the call reverts")
  })
})

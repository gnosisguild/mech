import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("ClubCard Account", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployClubCard1() {
    const test721 = await ethers.getContractFactory("ERC721Token")
    const test1155 = await ethers.getContractFactory("ERC1155Token")
    const test20 = await ethers.getContractFactory("ERC20Token")
    const ClubCardERC721 = await ethers.getContractFactory("ClubCardERC721")
    const [deployer, alice, bob] = await ethers.getSigners()

    const test721Token = await test721.deploy()
    const test1155Token = await test1155.deploy()
    const test20Token = await test20.deploy()
    const clubCard1 = await ClubCardERC721.deploy(test721Token.address, 1)

    await clubCard1.deployed()

    // send alice a nft associated with the clubcard
    await test721Token.mintToken(alice.address, 1)

    // Fixtures can return anything you consider useful for your tests
    return {
      ClubCardERC721,
      test721Token,
      test1155Token,
      test20Token,
      clubCard1,
      alice,
      bob,
    }
  }

  describe("Send and Receive tokens", () => {
    it("clubcard can receive and send erc20 tokens", async () => {
      const { clubCard1, test20Token, alice } = await loadFixture(
        deployClubCard1
      )
      await test20Token.mintToken(clubCard1.address, 1000)
      expect(await test20Token.balanceOf(clubCard1.address)).to.equal(1000)

      await alice.sendTransaction({
        to: clubCard1.address,
        value: ethers.utils.parseUnits("0", "ether"),
        data: clubCard1.interface.encodeFunctionData("execReturnData", [
          test20Token.address,
          ethers.utils.parseUnits("0", "ether"),
          test20Token.interface.encodeFunctionData("transfer", [
            alice.address,
            500,
          ]),
          "0",
        ]),
      })

      expect(await test20Token.balanceOf(alice.address)).to.equal(500)
    })

    it("clubcard can receive erc721 tokens", async () => {
      const { clubCard1, test721Token, alice } = await loadFixture(
        deployClubCard1
      )
      // mint alice another nft to send to the clubcard
      await test721Token.mintToken(alice.address, 2)

      await alice.sendTransaction({
        to: test721Token.address,
        value: ethers.utils.parseUnits("0", "ether"),
        data: test721Token.interface.encodeFunctionData(
          "safeTransferFrom(address,address,uint256)",
          [alice.address, clubCard1.address, 2]
        ),
      })
      expect(await test721Token.ownerOf(2)).to.equal(clubCard1.address)
    })

    it("clubcard can receive erc1155 tokens", async () => {
      const { clubCard1, test1155Token, alice } = await loadFixture(
        deployClubCard1
      )
      // mint alice an 1155 nft to send to the clubcard
      await test1155Token.mintToken(
        alice.address,
        1,
        2,
        ethers.utils.randomBytes(0)
      )

      await alice.sendTransaction({
        to: test1155Token.address,
        value: ethers.utils.parseUnits("0", "ether"),
        data: test1155Token.interface.encodeFunctionData("safeTransferFrom", [
          alice.address,
          clubCard1.address,
          1,
          2,
          ethers.utils.randomBytes(0),
        ]),
      })
      expect(await test1155Token.balanceOf(clubCard1.address, 1)).to.equal(2)
    })
  })
})

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("Mech Account", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const test721 = await ethers.getContractFactory("ERC721Token")
    const test1155 = await ethers.getContractFactory("ERC1155Token")
    const test20 = await ethers.getContractFactory("ERC20Token")
    const ERC721Mech = await ethers.getContractFactory("ERC721Mech")
    const [deployer, alice, bob] = await ethers.getSigners()

    const test721Token = await test721.deploy()
    const test1155Token = await test1155.deploy()
    const test20Token = await test20.deploy()
    const mech1 = await ERC721Mech.deploy(test721Token.address, 1)

    await mech1.deployed()

    // send alice a nft associated with the mech
    await test721Token.mintToken(alice.address, 1)

    // Fixtures can return anything you consider useful for your tests
    return {
      ERC721Mech,
      test721Token,
      test1155Token,
      test20Token,
      mech1,
      alice,
      bob,
    }
  }

  describe("Send and Receive tokens", () => {
    it("mech can receive and send erc20 tokens", async () => {
      const { mech1, test20Token, alice } = await loadFixture(deployMech1)
      await test20Token.mintToken(mech1.address, 1000)
      expect(await test20Token.balanceOf(mech1.address)).to.equal(1000)

      await alice.sendTransaction({
        to: mech1.address,
        value: ethers.utils.parseUnits("0", "ether"),
        data: mech1.interface.encodeFunctionData("execReturnData", [
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

    it("mech can receive erc721 tokens", async () => {
      const { mech1, test721Token, alice } = await loadFixture(deployMech1)
      // mint alice another nft to send to the mech
      await test721Token.mintToken(alice.address, 2)

      await alice.sendTransaction({
        to: test721Token.address,
        value: ethers.utils.parseUnits("0", "ether"),
        data: test721Token.interface.encodeFunctionData(
          "safeTransferFrom(address,address,uint256)",
          [alice.address, mech1.address, 2]
        ),
      })
      expect(await test721Token.ownerOf(2)).to.equal(mech1.address)
    })

    it("mech can receive erc1155 tokens", async () => {
      const { mech1, test1155Token, alice } = await loadFixture(deployMech1)
      // mint alice an 1155 nft to send to the mech
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
          mech1.address,
          1,
          2,
          ethers.utils.randomBytes(0),
        ]),
      })
      expect(await test1155Token.balanceOf(mech1.address, 1)).to.equal(2)
    })
  })
})

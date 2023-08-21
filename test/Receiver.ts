import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("Receiver base contract", () => {
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

  describe("send and receive tokens", () => {
    it("is able to receive ether", async () => {
      const { mech1 } = await loadFixture(deployMech1)
      const [deployer] = await ethers.getSigners()

      await deployer.sendTransaction({
        to: mech1.address,
        value: ethers.utils.parseEther("1.0"),
      })

      expect(await ethers.provider.getBalance(mech1.address)).to.equal(
        ethers.utils.parseEther("1.0")
      )
    })

    it("can receive and send erc20 tokens", async () => {
      const { mech1, test20Token, alice } = await loadFixture(deployMech1)
      await test20Token.mintToken(mech1.address, 1000)
      expect(await test20Token.balanceOf(mech1.address)).to.equal(1000)

      await mech1
        .connect(alice)
        .execute(
          test20Token.address,
          0,
          test20Token.interface.encodeFunctionData("transfer", [
            alice.address,
            500,
          ]),
          0
        )

      expect(await test20Token.balanceOf(alice.address)).to.equal(500)
    })

    it("can receive erc721 tokens", async () => {
      const { mech1, test721Token, alice } = await loadFixture(deployMech1)
      // mint alice another nft to send to the mech
      await test721Token.mintToken(alice.address, 2)

      await alice.sendTransaction({
        to: test721Token.address,
        value: 0,
        data: test721Token.interface.encodeFunctionData(
          "safeTransferFrom(address,address,uint256)",
          [alice.address, mech1.address, 2]
        ),
      })
      expect(await test721Token.ownerOf(2)).to.equal(mech1.address)
    })

    it("can receive erc1155 tokens", async () => {
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
        value: 0,
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

    it("can receive erc1155 token batches", async () => {
      const { mech1, test1155Token, alice } = await loadFixture(deployMech1)
      // mint alice some tokens
      await test1155Token.mintToken(
        alice.address,
        1,
        10,
        ethers.utils.randomBytes(0)
      )
      await test1155Token.mintToken(
        alice.address,
        2,
        20,
        ethers.utils.randomBytes(0)
      )

      await alice.sendTransaction({
        to: test1155Token.address,
        value: 0,
        data: test1155Token.interface.encodeFunctionData(
          "safeBatchTransferFrom",
          [
            alice.address,
            mech1.address,
            [1, 2],
            [10, 20],
            ethers.utils.randomBytes(0),
          ]
        ),
      })
      expect(await test1155Token.balanceOf(mech1.address, 1)).to.equal(10)
      expect(await test1155Token.balanceOf(mech1.address, 2)).to.equal(20)
    })
  })
})

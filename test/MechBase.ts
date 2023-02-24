import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
import { signWithMech } from "../sdk/signWithMech"

const EIP1271_MAGIC_VALUE = "0x1626ba7e"

describe("MechBase contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const TestToken = await ethers.getContractFactory("ERC721Token")
    const ERC721Mech = await ethers.getContractFactory("ERC721Mech")
    const [deployer, alice, bob] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const mech1 = await ERC721Mech.deploy(testToken.address, 1)

    await mech1.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { ERC721Mech, testToken, mech1, alice, bob }
  }

  it("should be able to receive ether", async () => {
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

  describe("isValidSignature()", () => {
    it("returns magic value for a valid signature of the mech operator EOA", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      const message = "Test message"
      const signature = await alice.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      expect(await mech1.isValidSignature(messageHash, signature)).to.equal(
        EIP1271_MAGIC_VALUE
      )
    })

    it("returns zero for any other ECDSA signature", async () => {
      const { mech1, testToken, alice, bob } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // let bob sign message
      const message = "Test message"
      const signature = await bob.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      expect(await mech1.isValidSignature(messageHash, signature)).to.equal(
        "0xffffffff"
      )
    })

    it("returns magic value for a valid EIP-1271 signature of the mech operator contract", async () => {
      const { ERC721Mech, mech1, testToken, alice } = await loadFixture(
        deployMech1
      )
      // mech1 is linked to testToken#1

      const mech2 = await ERC721Mech.deploy(testToken.address, 2)
      await mech2.deployed()

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.address, 2)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      const contractSignature = signWithMech(mech1.address, ecdsaSignature)

      expect(
        await mech2.isValidSignature(messageHash, contractSignature)
      ).to.equal(EIP1271_MAGIC_VALUE)
    })

    it("returns zero for an invalid EIP-1271 signature of the mech operator contract", async () => {
      const { ERC721Mech, mech1, testToken, alice, bob } = await loadFixture(
        deployMech1
      )
      // mech1 is linked to testToken#1

      const mech2 = await ERC721Mech.deploy(testToken.address, 2)
      await mech2.deployed()

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.address, 2)

      const message = "Test message"
      const wrongEcdsaSignature = await bob.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      const contractSignature = signWithMech(mech1.address, wrongEcdsaSignature)

      expect(
        await mech2.isValidSignature(messageHash, contractSignature)
      ).to.equal("0xffffffff")
    })

    it("returns zero for an EIP-1271 signature from a contract that is not the mech operator", async () => {
      const { ERC721Mech, mech1, testToken, alice } = await loadFixture(
        deployMech1
      )
      // mech1 is linked to testToken#1

      const mech2 = await ERC721Mech.deploy(testToken.address, 2)
      await mech2.deployed()

      // mint testToken#1 to alice
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.address, 2)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = ethers.utils.hashMessage(message)

      const contractSignature = signWithMech(mech2.address, ecdsaSignature)

      expect(
        await mech2.isValidSignature(messageHash, contractSignature)
      ).to.equal("0xffffffff")
    })
  })

  describe("exec()", () => {
    it("reverts if called when the connected token ID is not valid", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // don't mint testToken#1

      // make testTx (token#2 transfer from mech1 to alice)
      await testToken.mintToken(mech1.address, 2)
      const testTx = await testToken.populateTransaction.transferFrom(
        mech1.address,
        alice.address,
        2
      )

      await expect(
        mech1.exec(testToken.address, 0, testTx.data as string, 0, 0)
      ).to.be.revertedWith("ERC721: invalid token ID")
    })

    it("reverts if called from an account that is not the mech operator", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.address, 1)

      // make testTx (token#2 transfer from mech1 to alice)
      await testToken.mintToken(mech1.address, 2)
      const testTx = await testToken.populateTransaction.transferFrom(
        mech1.address,
        alice.address,
        2
      )

      // call exec() from deployer who is not an operator
      await expect(
        mech1.exec(testToken.address, 0, testTx.data as string, 0, 0)
      ).to.be.revertedWith("Only callable by the mech operator")
    })

    it("returns true if the call succeeds")
    it("returns false if the call reverts")

    it('respects the "txGas" argument', async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.address, 2)

      const transferTx = await testToken.populateTransaction.transferFrom(
        mech1.address,
        alice.address,
        2
      )

      // succeeds when enough gas is provided
      await expect(
        mech1
          .connect(alice)
          .exec(
            testToken.address,
            0,
            transferTx.data as string,
            0,
            transferTx.gasLimit as BigNumber
          )
      ).to.not.be.reverted

      // fails when not enough gas is provided
      await expect(
        mech1
          .connect(alice)
          .exec(
            testToken.address,
            0,
            transferTx.data as string,
            0,
            (transferTx.gasLimit as BigNumber).div(2)
          )
      ).to.be.revertedWith("Not enough gas to execute the transaction")
    })

    it("reverts before executing the meta transaction if not enough gas is provided", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.address, 2)

      const transferTx = await testToken.populateTransaction.transferFrom(
        mech1.address,
        alice.address,
        2
      )

      await expect(
        mech1.connect(alice).exec(
          testToken.address,
          0,
          transferTx.data as string,
          0,
          transferTx.gasLimit as BigNumber,
          { gasLimit: transferTx.gasLimit as BigNumber } // same as gas for meta tx, so there won't be enough gas for the rest of the exec() call
        )
      ).to.be.revertedWith("Not enough gas to execute the transaction")
    })

    it.only("reserves just enough gas for the exec() function itself", async () => {
      // TODO TODO
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.address, 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.address, 2)

      const transferTx = await testToken.populateTransaction.transferFrom(
        mech1.address,
        alice.address,
        2
      )

      // get actual gas used for the exec() call
      const res = await mech1
        .connect(alice)
        .exec(testToken.address, 0, "0x", 0, 0)
      const { gasUsed } = await res.wait()
      console.log("gasUsed", gasUsed.toString())
    })
  })

  describe("execReturnData()", () => {
    it("reverts if called from an account that is not the mech operator")
    it("returns true and call result if the call succeeds")
    it("returns false and revert data if the call reverts")
    it('respects the "txGas" argument')
  })
})

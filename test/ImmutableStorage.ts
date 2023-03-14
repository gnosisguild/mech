import { defaultAbiCoder } from "@ethersproject/abi"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("ImmutableStorage base contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTestContract() {
    const ImmutableStorageTest = await ethers.getContractFactory(
      "ImmutableStorageTest"
    )
    const contract = await ImmutableStorageTest.deploy()

    return { ImmutableStorageTest, contract }
  }

  describe("writeImmutable()", () => {
    it("can be called once and never again", async () => {
      const { contract } = await loadFixture(deployTestContract)

      await contract.write(defaultAbiCoder.encode(["uint256"], [1]))

      await expect(
        contract.write(defaultAbiCoder.encode(["uint256"], [2]))
      ).to.be.revertedWith("Write failed")
    })
  })

  describe("readImmutable()", () => {
    it("returns empty bytes if nothing has been stored yet", async () => {
      const { contract } = await loadFixture(deployTestContract)

      expect(await contract.read()).to.equal("0x")
    })

    it("returns the stored value", async () => {
      const { contract } = await loadFixture(deployTestContract)

      const bytes = defaultAbiCoder.encode(["uint256"], [1])
      await contract.write(bytes)

      expect(await contract.read()).to.equal(bytes)
    })
  })
})

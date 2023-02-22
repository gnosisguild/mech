import { defaultAbiCoder } from "@ethersproject/abi"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

import { SENTINEL_MODULES, ZERO_ADDRESS } from "../sdk/constants"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

describe("ZodiacMech contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const ZodiacMech = await ethers.getContractFactory("ZodiacMech")
    const [deployer, alice, bob, eve] = await ethers.getSigners()

    const mech1 = await ZodiacMech.deploy([alice.address, bob.address])

    await mech1.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { ZodiacMech, mech1, alice, bob, eve }
  }

  describe("deployment", () => {
    it("should enable the passed modules", async () => {
      const { mech1, alice, bob } = await loadFixture(deployMech1)

      const enabledModules = await mech1.getModulesPaginated(
        SENTINEL_MODULES,
        2
      )
      expect(enabledModules.toString()).to.equal(
        [bob.address, alice.address, SENTINEL_MODULES].toString()
      )
    })
  })

  describe("setUp()", () => {
    it("reverts if called when modules are enabled", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      await expect(
        mech1.setUp(defaultAbiCoder.encode(["address[]"], [[alice.address]]))
      ).to.be.revertedWith("Already initialized")
    })
  })

  describe("isOperator() / isModuleEnabled()", () => {
    it("returns true for enabled modules", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      expect(await mech1.isModuleEnabled(alice.address)).to.equal(true)
      expect(await mech1.isOperator(alice.address)).to.equal(true)
    })

    it("returns false for any other address", async () => {
      const { mech1, eve } = await loadFixture(deployMech1)
      expect(await mech1.isModuleEnabled(eve.address)).to.equal(false)
      expect(await mech1.isOperator(eve.address)).to.equal(false)
    })
  })
})

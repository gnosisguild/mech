import { defaultAbiCoder } from "@ethersproject/abi"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { parseEther } from "ethers/lib/utils"
import { ethers, network } from "hardhat"

import { SENTINEL_MODULES, ZERO_ADDRESS } from "../sdk/constants"

import { entryPoint, fillUserOp, getUserOpHash, signUserOp } from "./Account"

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

    it("returns false if SENTINEL_MODULES is provided", async () => {
      const { mech1 } = await loadFixture(deployMech1)
      await expect(await mech1.isModuleEnabled(SENTINEL_MODULES)).to.be.equals(
        false
      )
    })

    it("returns false if AddressZero is provided", async () => {
      const { mech1 } = await loadFixture(deployMech1)
      await expect(await mech1.isModuleEnabled(ZERO_ADDRESS)).to.be.equals(
        false
      )
    })
  })

  describe("enableModule", async () => {
    it("reverts if caller is not an enabled module", async () => {
      const { mech1, eve } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(eve).enableModule(eve.address)
      ).to.be.revertedWith(
        "Only callable by the mech operator or the entry point contract"
      )
    })

    it("reverts if module is zero address", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(alice).enableModule(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(mech1, "InvalidModule")
    })

    it("reverts if module is SENTINEL_MODULES", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(alice).enableModule(SENTINEL_MODULES)
      ).to.be.revertedWithCustomError(mech1, "InvalidModule")
    })

    it('emits "EnabledModule" event and enables the module', async () => {
      const { mech1, alice, eve } = await loadFixture(deployMech1)
      await expect(mech1.connect(alice).enableModule(eve.address))
        .to.emit(mech1, "EnabledModule")
        .withArgs(eve.address)
      expect(await mech1.isModuleEnabled(eve.address)).to.equal(true)
    })

    it("reverts if module is already enabled", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(alice).enableModule(alice.address)
      ).to.be.revertedWithCustomError(mech1, "AlreadyEnabledModule")
    })
  })

  describe("disableModule", async () => {
    it("reverts if caller is not the owner", async () => {
      const { mech1, alice, eve } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(eve).disableModule(SENTINEL_MODULES, alice.address)
      ).to.be.revertedWith(
        "Only callable by the mech operator or the entry point contract"
      )
    })

    it("reverts if module is zero address", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(alice).disableModule(SENTINEL_MODULES, ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(mech1, "InvalidModule")
    })

    it("reverts if module is SENTINEL_MODULES", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(alice).disableModule(SENTINEL_MODULES, SENTINEL_MODULES)
      ).to.be.revertedWithCustomError(mech1, "InvalidModule")
    })

    it("reverts if module is already disabled", async () => {
      const { mech1, alice, eve } = await loadFixture(deployMech1)
      await expect(
        mech1.connect(alice).disableModule(SENTINEL_MODULES, eve.address)
      ).to.be.revertedWithCustomError(mech1, "AlreadyDisabledModule")
    })

    it('emits a "DisabledModule" event and disables a module', async () => {
      const { mech1, alice, bob } = await loadFixture(deployMech1)

      await expect(
        mech1.connect(alice).disableModule(SENTINEL_MODULES, bob.address)
      )
        .to.emit(mech1, "DisabledModule")
        .withArgs(bob.address)

      expect(await mech1.isModuleEnabled(bob.address)).to.equal(false)
    })
  })

  describe("getModulesPaginated", async () => {
    it("returns the enabled modules and the SENTINAL_MODULES at the end", async () => {
      const { mech1, alice, bob } = await loadFixture(deployMech1)

      const { array, next } = await mech1.getModulesPaginated(
        SENTINEL_MODULES,
        3
      )
      await expect(array).to.deep.equal([bob.address, alice.address])
      expect(next).to.equal(SENTINEL_MODULES)
    })
  })

  describe("execTransactionFromModule", async () => {
    it("reverts if module is not enabled", async () => {
      const { mech1, eve } = await loadFixture(deployMech1)
      await expect(
        mech1
          .connect(eve)
          .execTransactionFromModule(ZERO_ADDRESS, parseEther("1.0"), "0x", 0)
      ).to.be.revertedWith(
        "Only callable by the mech operator or the entry point contract"
      )
    })

    it("executes a transaction", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      // fund mech1 with 1 ETH
      await alice.sendTransaction({
        to: mech1.address,
        value: parseEther("1.0"),
      })

      // burn 1 ETH from mech1
      await expect(
        mech1
          .connect(alice)
          .execTransactionFromModule(ZERO_ADDRESS, parseEther("1.0"), "0x", 0)
      ).to.changeEtherBalance(mech1, parseEther("-1.0"))
    })
  })

  describe("execTransactionFromModuleReturnData", async () => {
    it("reverts if module is not enabled", async () => {
      const { mech1, eve } = await loadFixture(deployMech1)
      await expect(
        mech1
          .connect(eve)
          .execTransactionFromModuleReturnData(
            mech1.address,
            0,
            mech1.interface.encodeFunctionData("getModulesPaginated", [
              SENTINEL_MODULES,
              3,
            ]),
            0
          )
      ).to.be.revertedWith(
        "Only callable by the mech operator or the entry point contract"
      )
    })

    it("executes a transaction and returns success and call result", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      // fund mech1 with 1 ETH
      await alice.sendTransaction({
        to: mech1.address,
        value: parseEther("1.0"),
      })

      const { success, returnData } = await mech1
        .connect(alice)
        .callStatic.execTransactionFromModuleReturnData(
          mech1.address,
          0,
          mech1.interface.encodeFunctionData("getModulesPaginated", [
            SENTINEL_MODULES,
            3,
          ]),
          0
        )

      expect(success).to.be.true
      expect(returnData).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"
      )
    })
  })

  describe("nonce storage", async () => {
    it("reads the nonce from Safe's storage slot and increments it on successful validation", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

      // set safeNonce storage slot to 99
      const nonceEncoded = defaultAbiCoder.encode(["uint256"], [99])
      const nonceSlot = "0x5" // see SafeStorage.sol
      await network.provider.request({
        method: "hardhat_setStorageAt",
        params: [mech1.address, nonceSlot, nonceEncoded],
      })

      // validate that the nonce is read from that slot
      expect(await mech1.nonce()).to.equal(99)

      // prepare ERC4337 entry point
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [entryPoint],
      })
      const entryPointSigner = await ethers.getSigner(entryPoint)
      await alice.sendTransaction({
        to: entryPoint,
        value: parseEther("1.0"),
      })

      // fund mech1 with 1 ETH
      await alice.sendTransaction({
        to: mech1.address,
        value: parseEther("1.0"),
      })

      const BURN_1_ETH = mech1.interface.encodeFunctionData("exec", [
        ZERO_ADDRESS,
        parseEther("1.0"),
        "0x",
        0,
        0,
      ])

      const userOp = await signUserOp(
        await fillUserOp(
          {
            callData: BURN_1_ETH,
          },
          mech1
        ),
        alice
      )

      // call validateUserOp so that the nonce is incremented
      expect(
        await mech1
          .connect(entryPointSigner)
          .validateUserOp(userOp, getUserOpHash(userOp), 0)
      ).to.not.be.reverted

      expect(await mech1.nonce()).to.equal(100)
    })
  })
})

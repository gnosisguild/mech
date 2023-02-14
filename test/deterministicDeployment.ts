import { deployModuleFactory } from "@gnosis.pm/zodiac"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre, { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.

import {
  calculateERC721MechAddress,
  calculateERC721MechMastercopyAddress,
} from "../sdk/calculateERC721MechAddress"
import { ZERO_ADDRESS } from "../sdk/constants"
import {
  deployERC721Mech,
  deployERC721MechMastercopy,
} from "../sdk/deployERC721Mech"

describe("deterministic deployment", () => {
  async function deployModuleFactoryAndMastercopy() {
    const [signer] = await hre.ethers.getSigners()
    const deployer = hre.ethers.provider.getSigner(signer.address)
    const moduleProxyFactoryAddress = await deployModuleFactory(deployer)
    if (moduleProxyFactoryAddress === ZERO_ADDRESS) {
      throw new Error("Module proxy factory address is already deployed")
    }

    const mastercopyAddress = await deployERC721MechMastercopy(deployer)

    return {
      moduleProxyFactoryAddress: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
      mastercopyAddress,
    }
  }

  describe("calculateERC721MechMastercopyAddress", () => {
    it("returns the address of the ERC721Mech mastercopy", async () => {
      const { mastercopyAddress } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      expect(calculateERC721MechMastercopyAddress()).to.equal(mastercopyAddress)
    })
  })

  describe("calculateERC721MechAddress()", () => {
    it("returns the address of the mech for a given NFT", async () => {
      const TestToken = await ethers.getContractFactory("ERC721Token")
      const testToken = await TestToken.deploy()

      const calculatedAddress = calculateERC721MechAddress(testToken.address, 1)

      expect(await ethers.provider.getCode(calculatedAddress)).to.equal("0x")

      await deployERC721Mech(
        testToken.address,
        1,
        hre.ethers.provider.getSigner()
      )

      expect(await ethers.provider.getCode(calculatedAddress)).to.not.equal(
        "0x"
      )
    })
  })
})

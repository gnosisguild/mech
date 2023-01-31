import hre, { ethers } from "hardhat"
import { deployModuleFactory } from "@gnosis.pm/zodiac"
import { expect } from "chai"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { ZERO_ADDRESS } from "../sdk/constants"
import {
  deployClubCardERC721,
  deployClubCardERC721Mastercopy,
} from "../sdk/deployClubCardERC721"
import {
  calculateClubCardERC721Address,
  calculateClubCardERC721MastercopyAddress,
} from "../sdk/calculateClubCardERC721Address"
import { JsonRpcSigner } from "@ethersproject/providers"

describe("deterministic deployment", () => {
  async function deployModuleFactoryAndMastercopy() {
    const moduleProxyFactoryAddress = await deployModuleFactory(hre)
    if (moduleProxyFactoryAddress === ZERO_ADDRESS) {
      throw new Error("Module proxy factory address is already deployed")
    }

    const mastercopyAddress = await deployClubCardERC721Mastercopy(hre)

    return { moduleProxyFactoryAddress, mastercopyAddress }
  }

  describe("calculateClubCardERC721MastercopyAddress", () => {
    it("returns the address of the ClubCardERC721 mastercopy", async () => {
      const { mastercopyAddress } = await loadFixture(
        deployModuleFactoryAndMastercopy
      )

      expect(calculateClubCardERC721MastercopyAddress()).to.equal(
        mastercopyAddress
      )
    })
  })

  describe.only("calculateClubCardERC721Address()", () => {
    it("returns the address of the club card for a given NFT", async () => {
      const { moduleProxyFactoryAddress, mastercopyAddress } =
        await loadFixture(deployModuleFactoryAndMastercopy)

      const TestToken = await ethers.getContractFactory("ERC721Token")
      const testToken = await TestToken.deploy()

      const address = await deployClubCardERC721(
        testToken.address,
        1,
        hre.ethers.provider.getSigner()
      )
      const calculatedAddress = calculateClubCardERC721Address(
        hre.ethers.provider.network.chainId,
        testToken.address,
        1
      )
      console.log({
        address,
        calculatedAddress,
        codeAtAddress: await hre.ethers.provider.getCode(address),
        codeAtCalcAddress: await hre.ethers.provider.getCode(calculatedAddress),
      })
      expect(calculatedAddress).to.equal(address)
    })
  })
})

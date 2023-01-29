import Safe, {
  SafeFactory,
  SafeAccountConfig,
} from "@safe-global/safe-core-sdk"

import { expect } from "chai"
import { ethers } from "hardhat"

{
  t: Tuploe
  c: matchesOd
  children: [
    {c: equals},
    {c: any}
    {c: equals}
  ]
}

{
  type: Tuple
  c: oneOf
  children: [
    {
      t: Tuploe
      c: matches
      children: [
        {c: equals},
        {c: any}
        {c: equals}
      ]
    },
    {
      t: Tuple
      c: matches
      children: [
        {c: any},
        {c: any}
        {c: equals}
      ]
    }
  ]
}

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

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

    const safeFactory = await SafeFactory.create({ ethAdapter })

    // Fixtures can return anything you consider useful for your tests
    return { ClubCardERC721, testToken, clubCard1, alice, bob }
  }

  describe("isCardHolder()", () => {})
})

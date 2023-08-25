import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { hashMessage } from "ethers"
import { ethers } from "hardhat"

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
import {
  calculateERC721TokenboundMechAddress,
  deployERC721TokenboundMech,
  deployERC721TokenboundMechMastercopy,
} from "../sdk/src"
import { signWithMech } from "../sdk/src/sign/signWithMech"
import { ERC721TokenboundMech__factory } from "../typechain-types"

import { deployFactories } from "./utils"

const EIP1271_MAGIC_VALUE = "0x1626ba7e"

describe.only("Mech base contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const { deployerClient, deployer, erc6551Registry, alice, bob } =
      await deployFactories()

    await deployERC721TokenboundMechMastercopy(deployerClient)

    const TestToken = await ethers.getContractFactory("ERC721Token")
    const testToken = await TestToken.deploy()
    const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

    const chainId = deployerClient.chain.id
    const registryAddress =
      (await erc6551Registry.getAddress()) as `0x${string}`

    // deploy mech1 bound to testToken#1
    await deployERC721TokenboundMech(deployerClient, {
      token: testTokenAddress,
      tokenId: 1n,
      from: registryAddress,
    })
    const mech1 = ERC721TokenboundMech__factory.connect(
      calculateERC721TokenboundMechAddress({
        chainId,
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      }),
      deployer
    )

    // deploy mech2 bound to testToken#2
    deployERC721TokenboundMech(deployerClient, {
      token: testTokenAddress,
      tokenId: 2n,
      from: registryAddress,
    })
    const mech2 = ERC721TokenboundMech__factory.connect(
      calculateERC721TokenboundMechAddress({
        chainId,
        token: testTokenAddress,
        tokenId: 2n,
        from: registryAddress,
      }),
      deployer
    )

    // Fixtures can return anything you consider useful for your tests
    return {
      deployerClient,
      erc6551Registry,
      testToken,
      mech1,
      mech2,
      alice,
      bob,
      chainId,
    }
  }

  describe("isValidSignature()", () => {
    it("returns magic value for a valid ECDSA signature of the mech operator EOA", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(await alice.getAddress(), 1n)

      const message = "Test message"
      const signature = await alice.signMessage(message)
      const messageHash = hashMessage(message)

      expect(await mech1.isValidSignature(messageHash, signature)).to.equal(
        EIP1271_MAGIC_VALUE
      )
    })

    it("returns zero for any other ECDSA signature", async () => {
      const { mech1, testToken, alice, bob } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(await alice.getAddress(), 1n)

      // let bob sign message
      const message = "Test message"
      const signature = await bob.signMessage(message)
      const messageHash = hashMessage(message)

      expect(await mech1.isValidSignature(messageHash, signature)).to.equal(
        "0xffffffff"
      )
    })

    it("returns magic value for a valid EIP-1271 signature of the mech operator contract", async () => {
      const { mech1, mech2, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1
      // mech2 is linked to testToken#2

      // mint testToken#1 to alice
      await testToken.mintToken(alice.getAddress(), 1n)

      // mint testToken#2 to mech1, making mech1 the operator of mech2
      await testToken.mintToken(mech1.getAddress(), 2n)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = hashMessage(message)

      const contractSignature = signWithMech(
        await mech1.getAddress(),
        ecdsaSignature
      )

      expect(
        await mech2.isValidSignature(messageHash, contractSignature)
      ).to.equal(EIP1271_MAGIC_VALUE)
    })

    it("returns magic value for a valid EIP-1271 signature of the mech itself", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1

      // mint testToken#1 to alice
      await testToken.mintToken(alice.getAddress(), 1n)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = hashMessage(message)

      const ownContractSignature = signWithMech(
        await mech1.getAddress(),
        ecdsaSignature
      )

      expect(
        await mech1.isValidSignature(messageHash, ownContractSignature)
      ).to.equal(EIP1271_MAGIC_VALUE)
    })

    it("returns zero for an invalid EIP-1271 signature of the mech operator contract", async () => {
      const { mech1, mech2, testToken, alice, bob } = await loadFixture(
        deployMech1
      )
      // mech1 is linked to testToken#1
      // mech2 is linked to testToken#2

      // mint testToken#1 to alice
      await testToken.mintToken(alice.getAddress(), 1n)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.getAddress(), 2n)

      const message = "Test message"
      const wrongEcdsaSignature = await bob.signMessage(message)
      const messageHash = hashMessage(message)

      const contractSignature = signWithMech(
        await mech1.getAddress(),
        wrongEcdsaSignature
      )

      expect(
        await mech2.isValidSignature(messageHash, contractSignature)
      ).to.equal("0xffffffff")
    })

    it("returns zero for an EIP-1271 signature from a contract that is not the mech operator", async () => {
      const { mech1, mech2, testToken, alice } = await loadFixture(deployMech1)
      // mech1 is linked to testToken#1
      // mech2 is linked to testToken#2

      // mint testToken#1 to alice
      await testToken.mintToken(alice.getAddress(), 1)

      // mint testToken#2 to mech1
      await testToken.mintToken(mech1.getAddress(), 2)

      const message = "Test message"
      const ecdsaSignature = await alice.signMessage(message)
      const messageHash = hashMessage(message)

      const contractSignature = signWithMech(
        await mech2.getAddress(),
        ecdsaSignature
      )

      expect(
        await mech1.isValidSignature(messageHash, contractSignature)
      ).to.equal("0xffffffff")
    })
  })

  describe("execute()", () => {
    it("reverts if called when the connected token ID is not valid", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // don't mint testToken#1

      // make testTx (token#2 transfer from mech1 to alice)
      await testToken.mintToken(mech1.getAddress(), 2n)
      const testTx = await testToken.transferFrom.populateTransaction(
        mech1.getAddress(),
        alice.getAddress(),
        2n
      )

      await expect(
        mech1["execute(address,uint256,bytes,uint8)"](
          testToken.getAddress(),
          0,
          testTx.data as string,
          0
        )
      ).to.be.revertedWith("ERC721: invalid token ID")
    })

    it("reverts if called from an account that is not the mech operator or entry point", async () => {
      const { mech1, testToken, alice, bob } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.getAddress(), 1n)

      // make testTx (token#2 transfer from mech1 to alice)
      await testToken.mintToken(mech1.getAddress(), 2n)
      const testTx = await testToken.transferFrom.populateTransaction(
        mech1.getAddress(),
        alice.getAddress(),
        2n
      )

      // call execute() from bob who is not an operator
      await expect(
        mech1
          .connect(bob)
          ["execute(address,uint256,bytes,uint8)"](
            testToken.getAddress(),
            0n,
            testTx.data as string,
            0n
          )
      ).to.be.revertedWith(
        "Only callable by the mech operator or the entry point contract"
      )
    })

    it("reverts with original data if the meta transaction reverts", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      const aliceAddress = await alice.getAddress()
      const mech1Address = await mech1.getAddress()

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(aliceAddress, 1n)

      // this tx will revert because mech1 does not own token#1
      const revertingTxData = testToken.interface.encodeFunctionData(
        "transferFrom",
        [mech1Address, aliceAddress, 1n]
      )

      await expect(
        mech1
          .connect(alice)
          ["execute(address,uint256,bytes,uint8)"](
            await testToken.getAddress(),
            0n,
            revertingTxData,
            0n
          )
      ).to.be.revertedWith("ERC721: caller is not token owner or approved")
    })

    it("returns the return data of the meta transaction", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.getAddress(), 1)

      // this tx will revert because mech1 does not own token#1
      const callData = testToken.interface.encodeFunctionData("ownerOf", [1])

      const [result] = await mech1
        .connect(alice)
        ["execute(address,uint256,bytes,uint8)"].staticCallResult(
          testToken.getAddress(),
          0n,
          callData,
          0n
        )

      const decoded = testToken.interface.decodeFunctionResult(
        "ownerOf",
        result
      )
      expect(decoded[0]).to.equal(await alice.getAddress())
    })

    it("allows to execute delegate calls", async () => {
      const { mech1, testToken, alice } = await loadFixture(deployMech1)

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(alice.getAddress(), 1)

      // deploy a contract with a test() function that reverts if not called via delegatecall
      const DelegateCall = await ethers.getContractFactory("DelegateCall")
      const delegateCall = await DelegateCall.deploy()

      const callData = delegateCall.interface.encodeFunctionData("test")

      // this should revert because the call is not a delegate call
      await expect(
        mech1
          .connect(alice)
          ["execute(address,uint256,bytes,uint8)"](
            delegateCall.getAddress(),
            0,
            callData,
            0
          )
      ).to.be.revertedWith("Can only be called via delegatecall")

      // this should succeed because the call is a delegate call
      await expect(
        mech1
          .connect(alice)
          ["execute(address,uint256,bytes,uint8)"](
            delegateCall.getAddress(),
            0,
            callData,
            1
          )
      ).to.not.be.reverted
    })

    it('respects the "txGas" argument', async () => {
      const { mech1, testToken, alice, bob } = await loadFixture(deployMech1)

      const aliceAddress = await alice.getAddress()
      const bobAddress = await bob.getAddress()
      const mech1Address = await mech1.getAddress()

      // mint testToken#1 to alice to make her the operator of mech1
      await testToken.mintToken(aliceAddress, 1)

      // mint testToken#2 to alice
      await testToken.mintToken(aliceAddress, 2)

      // mint testToken#3 to mech1
      await testToken.mintToken(mech1Address, 3)

      // mint a token to bob, since receiving the first token will cost more gas
      await testToken.mintToken(bobAddress, 4)

      // measure actual gas of a transfer and subtract the base tx gas to get a good estimate of the required gas for the meta tx
      const aliceTransferTx = await testToken
        .connect(alice)
        .transferFrom(aliceAddress, bob.getAddress(), 2)
      const aliceGasUsed = (await aliceTransferTx.wait())?.gasUsed || 0n
      const BASE_TX_GAS = 21000n
      const metaTxGasCost = aliceGasUsed - BASE_TX_GAS // the actual transfer gas

      // send just enough gas to meta tx -> gas estimation succeed
      const mechTxGas = await mech1
        .connect(alice)
        ["execute(address,uint256,bytes,uint8,uint256)"].estimateGas(
          await testToken.getAddress(),
          0,
          testToken.interface.encodeFunctionData("transferFrom", [
            mech1Address,
            bobAddress,
            3,
          ]),
          0,
          metaTxGasCost
        )

      // send too little gas to the meta tx -> tx fails
      await expect(
        mech1.connect(alice)["execute(address,uint256,bytes,uint8,uint256)"](
          await testToken.getAddress(),
          0,
          testToken.interface.encodeFunctionData("transferFrom", [
            mech1Address,
            bobAddress,
            3,
          ]),
          0,
          metaTxGasCost - 1000n, // send too little gas
          { gasLimit: mechTxGas } // send enough
        )
      ).to.be.revertedWithoutReason
    })
  })
})

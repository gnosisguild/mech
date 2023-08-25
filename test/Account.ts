import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { AbiCoder, getBytes, keccak256, parseEther } from "ethers"
import { ethers, network } from "hardhat"

import { ERC721TokenboundMech__factory } from "../sdk/build/cjs/typechain-types"
import {
  calculateERC721TokenboundMechAddress,
  deployERC721TokenboundMech,
} from "../sdk/src"
import { ZERO_ADDRESS } from "../sdk/src/constants"
import { Account__factory, Mech__factory } from "../typechain-types"
import {
  Account,
  UserOperationStruct,
} from "../typechain-types/contracts/base/Account"

import { deployFactories } from "./utils"

export const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

describe.only("Account base contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const { deployer, deployerClient, erc6551Registry, alice, bob } =
      await deployFactories()

    const TestToken = await ethers.getContractFactory("ERC721Token")
    const testToken = await TestToken.deploy()
    const testTokenAddress = (await testToken.getAddress()) as `0x${string}`

    const chainId = deployerClient.chain.id
    const registryAddress =
      (await erc6551Registry.getAddress()) as `0x${string}`

    await deployERC721TokenboundMech(deployerClient, {
      token: testTokenAddress,
      tokenId: 1n,
      from: registryAddress,
    })

    // make alice the operator of mech1
    await testToken.mintToken(alice.address, 1)

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [entryPoint],
    })
    const entryPointSigner = await ethers.getSigner(entryPoint)

    // fund the entry point
    await deployer.sendTransaction({ to: entryPoint, value: parseEther("1.0") })

    const mech1 = ERC721TokenboundMech__factory.connect(
      calculateERC721TokenboundMechAddress({
        chainId,
        token: testTokenAddress,
        tokenId: 1n,
        from: registryAddress,
      })
    )

    // Fixtures can return anything you consider useful for your tests
    return {
      testToken,
      mech1,
      alice,
      bob,
      entryPointSigner,
    }
  }

  const BURN_1_ETH = Mech__factory.createInterface().encodeFunctionData(
    "execute(address,uint256,bytes,uint8)",
    [ZERO_ADDRESS, parseEther("1.0"), "0x", 0]
  )

  describe("validateUserOp()", () => {
    it("reverts if called by another address than the entry point", async () => {
      const { mech1, alice, entryPointSigner } = await loadFixture(deployMech1)

      const userOp = await signUserOp(
        await fillUserOp(
          {
            callData: BURN_1_ETH,
          },
          mech1
        ),
        alice
      )

      await expect(
        mech1.connect(alice).validateUserOp(userOp, getUserOpHash(userOp), 0)
      ).to.be.revertedWith("account: not from EntryPoint")
    })

    it("returns 0 if the user op has a valid ECDSA signature and uses the right nonce", async () => {
      const { mech1, alice, entryPointSigner } = await loadFixture(deployMech1)

      const userOp = await signUserOp(
        await fillUserOp(
          {
            callData: BURN_1_ETH,
          },
          mech1
        ),
        alice
      )

      expect(
        await mech1
          .connect(entryPointSigner)
          .validateUserOp.staticCallResult(userOp, getUserOpHash(userOp), 0)
      ).to.equal(0)
    })

    it("returns 1 for any other ECDSA signature", async () => {
      const { mech1, bob, entryPointSigner } = await loadFixture(deployMech1)

      const userOp = await signUserOp(
        await fillUserOp(
          {
            callData: BURN_1_ETH,
          },
          mech1
        ),
        bob
      )

      expect(
        await mech1
          .connect(entryPointSigner)
          .validateUserOp.staticCallResult(userOp, getUserOpHash(userOp), 0)
      ).to.equal(1)
    })

    it("sends the pre-fund to sender if the user op has valid signature", async () => {
      const { mech1, alice, entryPointSigner } = await loadFixture(deployMech1)

      const userOp = await signUserOp(
        await fillUserOp(
          {
            callData: BURN_1_ETH,
          },
          mech1
        ),
        alice
      )

      // fund mech1 with 1 ETH
      await alice.sendTransaction({
        to: mech1.getAddress(),
        value: parseEther("1.0"),
      })

      // pre-fund the entry point with 0.123 ETH
      await expect(
        mech1
          .connect(entryPointSigner)
          .validateUserOp(userOp, getUserOpHash(userOp), parseEther("0.123"))
      ).to.changeEtherBalances(
        [await mech1.getAddress(), entryPointSigner.address],
        [parseEther("-0.123"), parseEther("0.123")]
      )
    })
  })
})

type UserOperation = Omit<UserOperationStruct, "signature">
export const fillUserOp = async (
  op: Partial<UserOperation>,
  account: Account
): Promise<UserOperation> => ({
  sender: await account.getAddress(),
  callData: "0x",
  initCode: "0x",
  callGasLimit: 0,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  preVerificationGas: 21000,
  verificationGasLimit: 100000,
  paymasterAndData: "0x",
  ...op,
  nonce: op.nonce || 0,
})

export const signUserOp = async (
  op: UserOperation,
  signer: HardhatEthersSigner
): Promise<UserOperationStruct> => {
  const message = getBytes(getUserOpHash(op))

  return {
    ...op,
    signature: await signer.signMessage(message),
  }
}

export function getUserOpHash(op: UserOperation): string {
  const { chainId } = network.config

  const userOpHash = keccak256(packUserOp(op))
  const enc = AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, chainId]
  )
  return keccak256(enc)
}

function packUserOp(op: UserOperation): string {
  const userOpAbiType =
    Account__factory.createInterface().getFunction("validateUserOp").inputs[0]
  const encoded = AbiCoder.defaultAbiCoder().encode(
    [userOpAbiType],
    [{ ...op, signature: "0x" }]
  )
  // remove leading word (total length) and trailing word (zero-length signature)
  return "0x" + encoded.slice(66, encoded.length - 64)
}

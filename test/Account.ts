import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import {
  arrayify,
  defaultAbiCoder,
  keccak256,
  parseEther,
} from "ethers/lib/utils"
import { ethers, network } from "hardhat"

import { ZERO_ADDRESS } from "../sdk/constants"
import { Account__factory, Mech__factory } from "../typechain-types"
import {
  Account,
  UserOperationStruct,
} from "../typechain-types/contracts/base/Account"

export const entryPoint = "0x0576a174D229E3cFA37253523E645A78A0C91B57"

describe("Account base contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployMech1() {
    const TestToken = await ethers.getContractFactory("ERC721Token")
    const ERC721Mech = await ethers.getContractFactory("ERC721Mech")
    const [deployer, alice, bob] = await ethers.getSigners()

    const testToken = await TestToken.deploy()
    const mech1 = await ERC721Mech.deploy(testToken.address, 1)

    // make alice the operator of mech1
    await testToken.mintToken(alice.address, 1)

    await mech1.deployed()

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [entryPoint],
    })
    const entryPointSigner = await ethers.getSigner(entryPoint)
    // fund the entry point
    await deployer.sendTransaction({ to: entryPoint, value: parseEther("1.0") })

    // Fixtures can return anything you consider useful for your tests
    return {
      ERC721Mech,
      testToken,
      mech1,
      alice,
      bob,
      entryPointSigner,
    }
  }

  const BURN_1_ETH = Mech__factory.createInterface().encodeFunctionData(
    "exec",
    [ZERO_ADDRESS, parseEther("1.0"), "0x", 0, 0]
  )

  describe("validateUserOp()", () => {
    it("reverts if called by another address than the entry point", async () => {
      const { mech1, alice } = await loadFixture(deployMech1)

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
        mech1.validateUserOp(userOp, getUserOpHash(userOp), 0)
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
          .callStatic.validateUserOp(userOp, getUserOpHash(userOp), 0)
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
          .callStatic.validateUserOp(userOp, getUserOpHash(userOp), 0)
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
        to: mech1.address,
        value: parseEther("1.0"),
      })

      // pre-fund the entry point with 0.123 ETH
      await expect(
        mech1
          .connect(entryPointSigner)
          .validateUserOp(userOp, getUserOpHash(userOp), parseEther("0.123"))
      ).to.changeEtherBalances(
        [mech1.address, entryPointSigner.address],
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
  sender: account.address,
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
  signer: SignerWithAddress
): Promise<UserOperationStruct> => {
  const message = arrayify(getUserOpHash(op))

  return {
    ...op,
    signature: await signer.signMessage(message),
  }
}

export function getUserOpHash(op: UserOperation): string {
  const { chainId } = network.config

  const userOpHash = keccak256(packUserOp(op))
  const enc = defaultAbiCoder.encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, chainId]
  )
  return keccak256(enc)
}

function packUserOp(op: UserOperation): string {
  const userOpAbiType =
    Account__factory.createInterface().functions[
      "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256)"
    ].inputs[0]
  const encoded = defaultAbiCoder.encode(
    [userOpAbiType],
    [{ ...op, signature: "0x" }]
  )
  // remove leading word (total length) and trailing word (zero-length signature)
  return "0x" + encoded.slice(66, encoded.length - 64)
}

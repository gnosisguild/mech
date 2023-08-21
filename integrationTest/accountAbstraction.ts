import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { AbiCoder, concat, getBytes, keccak256 } from "ethers"
import { ethers, network } from "hardhat"

import {
  calculateZodiacMechAddress,
  deployZodiacMech,
  deployZodiacMechMastercopy,
  makeZodiacMechDeployTransaction,
} from "../sdk"
import {
  IEntryPoint__factory,
  ZodiacMech,
  ZodiacMech__factory,
} from "../typechain-types"
import { UserOperationStruct } from "../typechain-types/@account-abstraction/contracts/core/BaseAccount"

const entryPointAddress = "0x0576a174D229E3cFA37253523E645A78A0C91B57"

describe("account abstraction", () => {
  it("implements ERC-4337 account abstraction", async () => {
    const [signer, enabledModule, anotherModule] = await ethers.getSigners()
    const deployer = await ethers.provider.getSigner(await signer.getAddress())

    // deploy a ZodiacMech
    await deployZodiacMechMastercopy(deployer)
    await deployZodiacMech(deployer, {
      modules: [(await enabledModule.getAddress()) as `0x${string}`],
    })
    const zodiacMech = ZodiacMech__factory.connect(
      calculateZodiacMechAddress([
        (await enabledModule.getAddress()) as `0x${string}`,
      ]),
      deployer
    )

    // make sure the entry point contract is there
    expect(await ethers.provider.getCode(entryPointAddress)).to.not.equal("0x")
    const entryPoint = IEntryPoint__factory.connect(entryPointAddress, deployer)

    // enable another module on the Mech via the entry point
    const userOp = await signUserOp(
      await fillUserOp(
        {
          callData: zodiacMech.interface.encodeFunctionData("enableModule", [
            anotherModule.getAddress(),
          ]),
        },
        zodiacMech
      ),
      enabledModule
    )
    await expect(entryPoint.handleOps([userOp], signer.getAddress()))
      .to.emit(entryPoint, "UserOperationEvent")
      .withArgs(
        getUserOpHash(userOp),
        userOp.sender,
        "0x0000000000000000000000000000000000000000", // paymaster
        userOp.nonce,
        true, // success
        anyValue,
        anyValue
      )

    // make sure the module is enabled
    expect(await zodiacMech.isModuleEnabled(anotherModule.getAddress())).to.be
      .true
  })

  it("deploys the mech at the expected address if it does not exist yet", async () => {
    // skip 2 signers, so this test
    const [signer, , , enabledModule, anotherModule] = await ethers.getSigners()
    const deployer = ethers.provider.getSigner(signer.getAddress())

    // deploy the ZodiacMech mastercopy
    await deployZodiacMechMastercopy(deployer)

    // make sure the mech does not exist yet
    const mechAddress = calculateZodiacMechAddress([enabledModule.getAddress()])
    expect(await ethers.provider.getCode(mechAddress)).to.equal("0x")

    // make sure the entry point contract is there
    expect(await ethers.provider.getCode(entryPointAddress)).to.not.equal("0x")
    const entryPoint = IEntryPoint__factory.connect(entryPointAddress, deployer)

    // calculate the ZodiacMech init code
    const deployTx = await makeZodiacMechDeployTransaction(
      [enabledModule.getAddress()],
      ethers.provider
    )
    const initCode = concat([deployTx.to, deployTx.data])

    const zodiacMech = ZodiacMech__factory.connect(mechAddress, deployer)

    // enable another module on the Mech via the entry point
    const userOp = await signUserOp(
      await fillUserOp(
        {
          // sender: mechAddress, // optional
          callData: zodiacMech.interface.encodeFunctionData("enableModule", [
            anotherModule.getAddress(),
          ]),
          initCode,
          nonce: 0,
        },
        zodiacMech
      ),
      enabledModule
    )

    await expect(entryPoint.handleOps([userOp], signer.getAddress()))
      .to.emit(entryPoint, "UserOperationEvent")
      .withArgs(
        getUserOpHash(userOp),
        userOp.sender,
        "0x0000000000000000000000000000000000000000", // paymaster
        userOp.nonce,
        true, // success
        anyValue,
        anyValue
      )

    // mech has been deployed
    expect(await ethers.provider.getCode(mechAddress)).to.not.equal("0x")

    // make sure the module is enabled
    expect(await zodiacMech.isModuleEnabled(anotherModule.getAddress())).to.be
      .true
  })
})

type UserOperation = Omit<UserOperationStruct, "signature">
export const fillUserOp = async (
  op: Partial<UserOperation>,
  account: ZodiacMech
): Promise<UserOperation> => ({
  sender: account.getAddress(),
  callData: "0x",
  initCode: "0x",
  callGasLimit: 100000,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  preVerificationGas: 900000,
  verificationGasLimit: 200000,
  paymasterAndData: "0x",
  ...op,
  nonce: op.nonce === undefined ? await account.nonce() : op.nonce,
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
    [userOpHash, entryPointAddress, chainId]
  )
  return keccak256(enc)
}

function packUserOp(op: UserOperation): string {
  const userOpAbiType =
    ZodiacMech__factory.createInterface().getFunction("validateUserOp")
      .inputs[0]
  const encoded = AbiCoder.defaultAbiCoder().encode(
    [userOpAbiType],
    [{ ...op, signature: "0x" }]
  )
  // remove leading word (total length) and trailing word (zero-length signature)
  return "0x" + encoded.slice(66, encoded.length - 64)
}

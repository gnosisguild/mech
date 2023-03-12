import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { arrayify, defaultAbiCoder, keccak256 } from "ethers/lib/utils"
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

describe.only("account abstraction", () => {
  it("implements ERC-4337 account abstraction", async () => {
    const [signer, enabledModule, anotherModule] = await ethers.getSigners()
    const deployer = ethers.provider.getSigner(signer.address)

    // deploy a ZodiacMech
    await deployZodiacMechMastercopy(deployer)
    await deployZodiacMech([enabledModule.address], deployer)
    const zodiacMech = ZodiacMech__factory.connect(
      calculateZodiacMechAddress([enabledModule.address]),
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
            anotherModule.address,
          ]),
          // initCode,
        },
        zodiacMech
      ),
      enabledModule
    )
    await expect(entryPoint.handleOps([userOp], signer.address))
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
    expect(await zodiacMech.isModuleEnabled(anotherModule.address)).to.be.true
  })

  it.skip("deploys the mech at the expected address if it does not exist yet", async () => {
    const [signer, enabledModule, anotherModule] = await ethers.getSigners()
    const deployer = ethers.provider.getSigner(signer.address)

    // deploy the ZodiacMech mastercopy
    await deployZodiacMechMastercopy(deployer)

    // make sure the mech does not exist yet
    const mechAddress = calculateZodiacMechAddress([enabledModule.address])
    expect(await ethers.provider.getCode(mechAddress)).to.equal("0x")

    // make sure the entry point contract is there
    expect(await ethers.provider.getCode(entryPointAddress)).to.not.equal("0x")
    const entryPoint = IEntryPoint__factory.connect(entryPointAddress, deployer)

    // calculate the ZodiacMech init code
    const { data: initCode } = await makeZodiacMechDeployTransaction(
      [enabledModule.address],
      ethers.provider
    )

    const zodiacMech = ZodiacMech__factory.connect(mechAddress, deployer)

    // enable another module on the Mech via the entry point
    await expect(
      entryPoint.handleOps(
        [
          await signUserOp(
            await fillUserOp(
              {
                callData: zodiacMech.interface.encodeFunctionData(
                  "enableModule",
                  [anotherModule.address]
                ),
                initCode,
                nonce: 0,
              },
              zodiacMech
            ),
            anotherModule
          ),
        ],
        signer.address
      )
    ).to.not.be.reverted

    // mech has been deployed
    expect(await ethers.provider.getCode(mechAddress)).to.not.equal("0x")

    // make sure the module is enabled
    expect(zodiacMech.isModuleEnabled(anotherModule.address)).to.be.true
  })
})

type UserOperation = Omit<UserOperationStruct, "signature">
export const fillUserOp = async (
  op: Partial<UserOperation>,
  account: ZodiacMech
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
  nonce: op.nonce || (await account.nonce()),
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
    [userOpHash, entryPointAddress, chainId]
  )
  return keccak256(enc)
}

function packUserOp(op: UserOperation): string {
  const userOpAbiType =
    ZodiacMech__factory.createInterface().functions[
      "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256)"
    ].inputs[0]
  const encoded = defaultAbiCoder.encode(
    [userOpAbiType],
    [{ ...op, signature: "0x" }]
  )
  // remove leading word (total length) and trailing word (zero-length signature)
  return "0x" + encoded.slice(66, encoded.length - 64)
}

import { BytesLike, Signer } from "ethers"
import { getAddress, getCreate2Address, keccak256 } from "ethers/lib/utils"

import { ZERO_ADDRESS } from "../constants"

import {
  prepareSingletonFactory,
  singletonFactory,
} from "./erc2470SingletonFactory"

export const makeDeterministicDeployTransaction = async (
  initCode: BytesLike,
  salt: string
) => {
  return {
    to: singletonFactory.address,
    data: singletonFactory.interface.encodeFunctionData("deploy", [
      initCode,
      salt,
    ]),
    value: 0,
  }
}

export const deterministicDeploy = async (
  signer: Signer,
  initCode: BytesLike,
  salt: string
): Promise<string> => {
  const singletonFactory = await prepareSingletonFactory(signer)

  if (!signer.provider) {
    throw new Error("Signer has no provider")
  }

  // throws if this for some reason is not a valid address
  const targetAddress = getAddress(
    (await singletonFactory.callStatic.deploy(initCode, salt)) as string
  )

  const initCodeHash = keccak256(initCode)

  const computedTargetAddress = getCreate2Address(
    singletonFactory.address,
    salt,
    initCodeHash
  )

  if (targetAddress === ZERO_ADDRESS) {
    console.log(`  ✔ Mastercopy already deployed to: ${computedTargetAddress}`)
    return ZERO_ADDRESS
  }

  // Sanity check
  if (targetAddress !== computedTargetAddress) {
    throw new Error("The computed address does not match the target address.")
  }

  const network = await signer.provider.getNetwork()
  let gasLimit
  switch (network.name) {
    case "optimism":
      gasLimit = 6000000
      break
    case "arbitrum":
      gasLimit = 200000000
      break
    case "avalanche":
      gasLimit = 8000000
      break
    case "mumbai":
      gasLimit = 8000000
      break
    default:
      gasLimit = 10000000
  }
  const deployTx = await singletonFactory.deploy(initCode, salt, {
    gasLimit,
  })
  await deployTx.wait()

  if ((await signer.provider.getCode(targetAddress)).length > 2) {
    console.log(
      `  \x1B[32m✔ Mastercopy deployed to:        ${targetAddress} 🎉\x1B[0m `
    )
  } else {
    console.log("  \x1B[31m✘ Deployment failed.\x1B[0m")
  }
  return targetAddress
}

// import { BytesLike, Signer } from "ethers"

// // using the Deterministic Deployment Proxy: https://github.com/Arachnid/deterministic-deployment-proxy
// export const CREATE2_FACTORY_ADDRESS =
//   "0x4e59b44847b379578588920ca78fbf26c0b4956c"
// const CREATE2_FACTORY_DEPLOYMENT_DATA =
//   "0x604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3"
// export const CREATE2_FACTORY_DEPLOYMENT_SIGNER_ADDRESS =
//   "0x3fab184622dc19b6109349b94811493bf2a45362"

// export const deployCreate2Factory = async (signer: Signer) => {
//   if (
//     (await signer.getAddress()).toLowerCase() !==
//     CREATE2_FACTORY_DEPLOYMENT_SIGNER_ADDRESS
//   ) {
//     throw new Error(
//       `The provided signer must be for account ${CREATE2_FACTORY_DEPLOYMENT_SIGNER_ADDRESS}`
//     )
//   }

//   const response = await signer.sendTransaction({
//     data: CREATE2_FACTORY_DEPLOYMENT_DATA,
//   })

//   if (
//     signer.provider &&
//     (await signer.provider.getCode(
//       "0x4e59b44847b379578588920ca78fbf26c0b4956c"
//     )) === "0x"
//   ) {
//     throw new Error("The factory was not deployed at the expected address")
//   }

//   return response
// }

// export const deployDeterministicMinimalProxy = async (
//   bytecode: BytesLike,
//   signer: Signer
// ) => {
//   const { chainId } = await signer.provider.getNetwork()
//   const { transactionHash } = await signer.sendTransaction({
//     to: CREATE2_FACTORY_ADDRESS,
//     data: CREATE2_FACTORY_DEPLOYMENT_DATA,
//     value: 0,
//   })
//   const receipt = await signer.provider.waitForTransaction(transactionHash)
//   const address = receipt.logs[0].address
//   return address
// }

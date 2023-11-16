import { DeployFunction } from "hardhat-deploy/types"
import {
  createWalletClient,
  custom as customTransport,
  publicActions,
} from "viem"
import * as chains from "viem/chains"

import { ERC6551_REGISTRY_ADDRESS } from "../sdk/src/constants"

const deployERC6551Registry: DeployFunction = async (hre) => {
  const [signer] = await hre.ethers.getSigners()
  const deployer = await hre.ethers.provider.getSigner(signer.address)
  const network = await hre.ethers.provider.getNetwork()
  const chain = Object.values(chains).find(
    (chain) => chain.id === Number(network.chainId)
  )
  console.log(`Using chain ${chain?.name} (${chain?.id})`)

  const deployerClient = createWalletClient({
    account: deployer.address as `0x${string}`,
    transport: customTransport({
      async request({ method, params }) {
        return deployer.provider.send(method, params)
      },
    }),
    chain,
  })

  const expectedAddress = ERC6551_REGISTRY_ADDRESS

  const NICKS_FACTORY_ADDRESS = "0x4e59b44847b379578588920ca78fbf26c0b4956c"

  if (
    await deployerClient
      .extend(publicActions)
      .getBytecode({ address: expectedAddress })
  ) {
    console.log(
      `  ✔ ERC6551 registry contract is already deployed at ${expectedAddress}`
    )
  } else {
    const hash = await deployerClient.sendTransaction({
      to: NICKS_FACTORY_ADDRESS,
      value: BigInt(0),
      data: "0x0000000000000000000000000000000000000000fd8eb4e1dca713016c518e31608060405234801561001057600080fd5b5061023b806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063246a00211461003b5780638a54c52f1461006a575b600080fd5b61004e6100493660046101b7565b61007d565b6040516001600160a01b03909116815260200160405180910390f35b61004e6100783660046101b7565b6100e1565b600060806024608c376e5af43d82803e903d91602b57fd5bf3606c5285605d52733d60ad80600a3d3981f3363d3d373d3d3d363d7360495260ff60005360b76055206035523060601b60015284601552605560002060601b60601c60005260206000f35b600060806024608c376e5af43d82803e903d91602b57fd5bf3606c5285605d52733d60ad80600a3d3981f3363d3d373d3d3d363d7360495260ff60005360b76055206035523060601b600152846015526055600020803b61018b578560b760556000f580610157576320188a596000526004601cfd5b80606c52508284887f79f19b3655ee38b1ce526556b7731a20c8f218fbda4a3990b6cc4172fdf887226060606ca46020606cf35b8060601b60601c60005260206000f35b80356001600160a01b03811681146101b257600080fd5b919050565b600080600080600060a086880312156101cf57600080fd5b6101d88661019b565b945060208601359350604086013592506101f46060870161019b565b94979396509194608001359291505056fea2646970667358221220ea2fe53af507453c64dd7c1db05549fa47a298dfb825d6d11e1689856135f16764736f6c63430008110033",
    })
    console.log(
      `  ✔ ERC6551 registry contract deployed at ${expectedAddress} (tx hash: ${hash})`
    )
  }

  try {
    await hre.run("verify:verify", {
      address: expectedAddress,
      constructorArguments: [],
    })
  } catch (e) {
    if (
      e instanceof Error &&
      e.stack &&
      (e.stack.indexOf("Reason: Already Verified") > -1 ||
        e.stack.indexOf("Contract source code already verified") > -1)
    ) {
      console.log("  ✔ Contract is already verified")
    } else {
      console.log(
        "  ✘ Verifying the contract failed. This is probably because Etherscan is still indexing the contract. Try running this same command again in a few seconds."
      )
      throw e
    }
  }
}

export default deployERC6551Registry

import { DeployFunction } from "hardhat-deploy/types"
import {
  createWalletClient,
  custom as customTransport,
  publicActions,
} from "viem"
import * as chains from "viem/chains"

import {
  calculateERC1155TokenboundMechMastercopyAddress,
  deployERC1155TokenboundMechMastercopy,
} from "../sdk/build/cjs/sdk/src"

const deployMastercopyERC1155Tokenbound: DeployFunction = async (hre) => {
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

  const address = calculateERC1155TokenboundMechMastercopyAddress()

  if (await deployerClient.extend(publicActions).getBytecode({ address })) {
    console.log(`  ✔ Contract is already deployed at ${address}`)
  } else {
    await await deployERC1155TokenboundMechMastercopy(deployerClient)
    console.log(`  ✔ Contract deployed at ${address}`)
  }
  if (hre.network.name === "hardhat") {
    return
  }
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    })
  } catch (e) {
    if (
      e instanceof Error &&
      e.stack &&
      (e.stack.indexOf("Reason: Already Verified") > -1 ||
        e.stack.indexOf("Contract source code already verified") > -1)
    ) {
      console.log("  ✔ Mastercopy is already verified")
    } else {
      console.log(
        "  ✘ Verifying the mastercopy failed. This is probably because Etherscan is still indexing the contract. Try running this same command again in a few seconds."
      )
      throw e
    }
  }
}

deployMastercopyERC1155Tokenbound.tags = ["ERC1155TokenboundMech"]

export default deployMastercopyERC1155Tokenbound

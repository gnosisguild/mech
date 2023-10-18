import { DeployFunction } from "hardhat-deploy/types"
import {
  createWalletClient,
  custom as customTransport,
  getCreate2Address,
  publicActions,
} from "viem"
import * as chains from "viem/chains"

import { deployMastercopy } from "../sdk"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
} from "../sdk/src/constants"

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
  const ERC6551Registry = await hre.ethers.getContractFactory("ERC6551Registry")
  const bytecode = ERC6551Registry.bytecode as `0x${string}`

  // TODO: use Nick's factory 0x4e59b44847b379578588920ca78fbf26c0b4956c and 6551 salt rather than ERC2470
  const expectedAddress = getCreate2Address({
    bytecode,
    from: ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt: DEFAULT_SALT,
  })

  if (
    await deployerClient
      .extend(publicActions)
      .getBytecode({ address: expectedAddress })
  ) {
    console.log(`  ✔ Contract is already deployed at ${expectedAddress}`)
  } else {
    await deployMastercopy(deployerClient, bytecode)
    console.log(`  ✔ Contract deployed at ${expectedAddress}`)
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

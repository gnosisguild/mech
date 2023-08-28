import hre, { ethers } from "hardhat"
import {
  createTestClient,
  custom as customTransport,
  walletActions,
} from "viem"
import { hardhat } from "viem/chains"

import { deployERC2470SingletonFactory, deployMechFactory } from "../sdk/src"

/** deploy ERC2470 singleton factory, MechFactory, and ERC6551 registry */
export async function deployFactories() {
  const [signer, alice, bob] = await hre.ethers.getSigners()
  const deployer = await hre.ethers.provider.getSigner(
    await signer.getAddress()
  )

  const ERC6551Registry = await ethers.getContractFactory("ERC6551Registry")
  const erc6551Registry = await ERC6551Registry.deploy()
  deployer.populateTransaction
  const deployerClient = createTestClient({
    account: deployer.address as `0x${string}`,
    chain: hardhat,
    mode: "hardhat",
    transport: customTransport({
      async request({ method, params }) {
        return deployer.provider.send(method, params)
      },
    }),
  }).extend(walletActions)

  await deployERC2470SingletonFactory(deployerClient)
  await deployMechFactory(deployerClient)

  return {
    erc6551Registry,
    deployer,
    deployerClient,
    alice,
    bob,
  }
}

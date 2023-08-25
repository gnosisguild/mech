import hre, { ethers } from "hardhat"
import { createWalletClient, custom as customTransport } from "viem"
import { hardhat } from "viem/chains"

import { deployERC2470SingletonFactory, deployMechFactory } from "../sdk"

/** deploy ERC2470 singleton factory, MechFactory, and ERC6551 registry */
export async function deployFactories() {
  const [signer, alice, bob] = await hre.ethers.getSigners()
  const deployer = await hre.ethers.provider.getSigner(
    await signer.getAddress()
  )

  const ERC6551Registry = await ethers.getContractFactory("ERC6551Registry")
  const erc6551Registry = await ERC6551Registry.deploy()

  const deployerClient = createWalletClient({
    chain: hardhat,
    account: (await signer.getAddress()) as `0x${string}`,
    transport: customTransport({
      request({ method, params }) {
        return hre.ethers.provider.send(method, params)
      },
    }),
  })

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

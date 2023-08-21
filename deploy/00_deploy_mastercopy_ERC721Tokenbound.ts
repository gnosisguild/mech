import { DeployFunction } from "hardhat-deploy/types"

import {
  calculateERC721TokenboundMechMastercopyAddress,
  deployERC721TokenboundMechMastercopy,
} from "../sdk/build/cjs/sdk/src"

const deployMastercopyERC721Tokenbound: DeployFunction = async (hre) => {
  const [signer] = await hre.ethers.getSigners()
  const deployer = hre.ethers.provider.getSigner(signer.address)

  await deployERC721TokenboundMechMastercopy(deployer)
  const address = calculateERC721TokenboundMechMastercopyAddress()

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

deployMastercopyERC721Tokenbound.tags = ["ERC721TokenboundMech"]

export default deployMastercopyERC721Tokenbound

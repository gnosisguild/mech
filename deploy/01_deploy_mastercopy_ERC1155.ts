import { DeployFunction } from "hardhat-deploy/types"

import {
  calculateERC1155MechMastercopyAddress,
  deployERC1155MechMastercopy,
  ERC1155_MASTERCOPY_INIT_DATA,
} from "../sdk"

const deployMastercopyERC1155: DeployFunction = async (hre) => {
  const [signer] = await hre.ethers.getSigners()
  const deployer = hre.ethers.provider.getSigner(signer.address)

  await deployERC1155MechMastercopy(deployer)
  const address = calculateERC1155MechMastercopyAddress()

  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: ERC1155_MASTERCOPY_INIT_DATA,
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

deployMastercopyERC1155.tags = ["ERC1155Mech"]

export default deployMastercopyERC1155

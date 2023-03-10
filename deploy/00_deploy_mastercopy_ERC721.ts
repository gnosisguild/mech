import { DeployFunction } from "hardhat-deploy/types"

import {
  calculateERC721MechMastercopyAddress,
  deployERC721MechMastercopy,
  ERC721_MASTERCOPY_INIT_DATA,
} from "../sdk"

const deployMastercopyERC721: DeployFunction = async (hre) => {
  const [signer] = await hre.ethers.getSigners()
  const deployer = hre.ethers.provider.getSigner(signer.address)

  await deployERC721MechMastercopy(deployer)
  const address = calculateERC721MechMastercopyAddress()

  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: ERC721_MASTERCOPY_INIT_DATA,
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
      throw e
    }
  }
}

deployMastercopyERC721.tags = ["ERC721Mech"]

export default deployMastercopyERC721

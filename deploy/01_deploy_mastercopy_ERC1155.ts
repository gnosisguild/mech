import { DeployFunction } from "hardhat-deploy/types"

import { deployERC1155MechMastercopy } from "../sdk"

const deployMastercopyERC1155: DeployFunction = async ({ ethers }) => {
  const [signer] = await ethers.getSigners()
  const deployer = ethers.provider.getSigner(signer.address)

  await deployERC1155MechMastercopy(deployer)
}

deployMastercopyERC1155.tags = ["ERC1155Mech"]

export default deployMastercopyERC1155

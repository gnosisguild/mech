import { DeployFunction } from "hardhat-deploy/types"

import { deployERC721MechMastercopy } from "../sdk"

const deployMastercopyERC721: DeployFunction = async ({ ethers }) => {
  const [signer] = await ethers.getSigners()
  const deployer = ethers.provider.getSigner(signer.address)

  await deployERC721MechMastercopy(deployer)
}

deployMastercopyERC721.tags = ["ERC721Mech"]

export default deployMastercopyERC721

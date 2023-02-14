import { DeployFunction } from "hardhat-deploy/types"

import { deployERC721MechMastercopy } from "../sdk"

const deployMastercopyERC721: DeployFunction = async ({
  ethers,
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments
  // const { deployer } = await getNamedAccounts()
  const [signer] = await ethers.getSigners()
  const deployer = ethers.provider.getSigner(signer.address)

  await deployERC721MechMastercopy(deployer)

  // await deploy("ERC721Mech", {
  //   from: deployer,
  //   args: [INIT_ADDRESS, 0], // init mastercopy with non-zero address and 0 tokenId
  //   log: true,
  // })
}

deployMastercopyERC721.tags = ["ERC721Mech"]

export default deployMastercopyERC721

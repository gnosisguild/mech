import { DeployFunction } from "hardhat-deploy/types"

import { deployClubCardERC721Mastercopy } from "../sdk"

const deployMastercopyERC721: DeployFunction = async ({
  ethers,
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments
  // const { deployer } = await getNamedAccounts()
  const [signer] = await ethers.getSigners()
  const deployer = ethers.provider.getSigner(signer.address)

  await deployClubCardERC721Mastercopy(deployer)

  // await deploy("ClubCardERC721", {
  //   from: deployer,
  //   args: [INIT_ADDRESS, 0], // init mastercopy with non-zero address and 0 tokenId
  //   log: true,
  // })
}

deployMastercopyERC721.tags = ["ClubCardERC721"]

export default deployMastercopyERC721

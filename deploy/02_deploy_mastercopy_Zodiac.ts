import { DeployFunction } from "hardhat-deploy/types"

import { deployZodiacMechMastercopy } from "../sdk"

const deployMastercopyZodiac: DeployFunction = async ({ ethers }) => {
  const [signer] = await ethers.getSigners()
  const deployer = ethers.provider.getSigner(signer.address)

  await deployZodiacMechMastercopy(deployer)
}

deployMastercopyZodiac.tags = ["ZodiacMech"]

export default deployMastercopyZodiac

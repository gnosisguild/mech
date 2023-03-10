import { DeployFunction } from "hardhat-deploy/types"

import {
  calculateZodiacMechMastercopyAddress,
  deployZodiacMechMastercopy,
  ZODIAC_MASTERCOPY_INIT_DATA,
} from "../sdk"

const deployMastercopyZodiac: DeployFunction = async (hre) => {
  const [signer] = await hre.ethers.getSigners()
  const deployer = hre.ethers.provider.getSigner(signer.address)

  await deployZodiacMechMastercopy(deployer)
  const address = calculateZodiacMechMastercopyAddress()

  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: ZODIAC_MASTERCOPY_INIT_DATA,
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

deployMastercopyZodiac.tags = ["ZodiacMech"]

export default deployMastercopyZodiac

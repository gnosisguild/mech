import { DeployFunction } from "hardhat-deploy/types"

const deployERC6551Registry: DeployFunction = async (hre) => {
  // const [signer] = await hre.ethers.getSigners()

  const ERC6551Registry = await hre.ethers.getContractFactory("ERC6551Registry")
  const erc6551Registry = await ERC6551Registry.deploy()

  try {
    await hre.run("verify:verify", {
      address: await erc6551Registry.getAddress(),
      constructorArguments: [],
    })
  } catch (e) {
    if (
      e instanceof Error &&
      e.stack &&
      (e.stack.indexOf("Reason: Already Verified") > -1 ||
        e.stack.indexOf("Contract source code already verified") > -1)
    ) {
      console.log("  ✔ Contract is already verified")
    } else {
      console.log(
        "  ✘ Verifying the contract failed. This is probably because Etherscan is still indexing the contract. Try running this same command again in a few seconds."
      )
      throw e
    }
  }
}

export default deployERC6551Registry

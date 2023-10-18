import { expect } from "chai"
import { AbiCoder, parseEther } from "ethers"
import { ethers, network } from "hardhat"

import {
  calculateZodiacMechMastercopyAddress,
  deployZodiacMechMastercopy,
} from "../sdk"
import { ZERO_ADDRESS } from "../sdk/src/constants"
import { ZodiacMech__factory } from "../typechain-types"
import { IAvatar__factory } from "../typechain-types/factories/@gnosis.pm/zodiac/contracts/interfaces/IAvatar__factory"

describe("Safe migration", () => {
  it("supports migrating an existing Safe to a ZodiacMech", async () => {
    const [signer] = await ethers.getSigners()
    const deployer = await ethers.provider.getSigner(signer.address)

    // migrate the Gnosis DAO Safe
    const safeAddress = "0x849D52316331967b6fF1198e5E32A0eB168D039d"
    const enabledModule = "0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe"

    // make the Safe execute stuff by impersonating the enabled module
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [enabledModule],
    })
    // make sure the enabled module has enough ETH to pay gas
    await signer.sendTransaction({
      to: enabledModule,
      value: parseEther("1.0"),
    })
    const enabledModuleSigner = await ethers.getSigner(enabledModule)
    const safe = IAvatar__factory.connect(safeAddress, enabledModuleSigner)

    // get a ZodiacMech contract instance for that same address
    const zodiacMech = ZodiacMech__factory.connect(
      safeAddress,
      enabledModuleSigner
    )

    // sanity check making sure the Gnosis DAO Safe is configured as expected
    expect(await safe.isModuleEnabled(enabledModule)).to.be.true
    await expect(
      zodiacMech["execute(address,uint256,bytes,uint8)"](
        ZERO_ADDRESS,
        parseEther("1.0"),
        "0x",
        0
      )
    ).to.be.reverted

    // deploy ZodiacMech mastercopy
    const zodiacMechMastercopyAddress = calculateZodiacMechMastercopyAddress()
    await deployZodiacMechMastercopy(deployer)
    expect(
      await ethers.provider.getCode(zodiacMechMastercopyAddress)
    ).to.not.equal("0x")

    // deploy migration contract
    const SafeMigration = await ethers.getContractFactory("SafeMigration")
    const migrationLib = await SafeMigration.deploy(zodiacMechMastercopyAddress)

    // migrate the Safe
    await expect(
      safe.execTransactionFromModule(
        migrationLib.getAddress(),
        0,
        migrationLib.interface.encodeFunctionData("migrate"),
        1 // important: delegatecall
      )
    ).to.not.be.reverted

    // singleton slot points to the ZodiacMech mastercopy
    expect(
      await network.provider.request({
        method: "eth_getStorageAt",
        params: [safeAddress, "0x0"],
      })
    ).to.equal(
      AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [zodiacMechMastercopyAddress]
      )
    )

    // make sure the Safe is now a ZodiacMech
    await expect(
      zodiacMech["execute(address,uint256,bytes,uint8)"](
        ZERO_ADDRESS,
        parseEther("1.0"),
        "0x",
        0
      )
    ).to.changeEtherBalance(safeAddress, parseEther("-1.0"))

    // the enabled modules did not change
    expect(await zodiacMech.isModuleEnabled(enabledModule)).to.be.true
  })
})

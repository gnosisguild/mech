import {
  concat,
  encodeAbiParameters,
  encodeFunctionData,
  getCreate2Address,
  keccak256,
  WalletClient,
} from "viem"

import {
  MechFactory__factory,
  ZodiacMech__factory,
} from "../../typechain-types"
import {
  DEFAULT_SALT,
  ERC2470_SINGLETON_FACTORY_ADDRESS,
  MECH_FACTORY_ADDRESS,
} from "../constants"

import { deployMastercopy, mechProxyBytecode } from "./factory"

export const calculateZodiacMechAddress = (
  /** Addresses of the Zodiac modules */
  modules: `0x${string}`[],
  salt: `0x${string}` = DEFAULT_SALT
) => {
  const initData = ZodiacMech__factory.createInterface().encodeFunctionData(
    "setUp",
    [encodeAbiParameters([{ type: "address[]" }], [modules])]
  ) as `0x${string}`

  return getCreate2Address({
    bytecode: mechProxyBytecode(
      calculateZodiacMechMastercopyAddress(),
      new Uint8Array(0)
    ),
    from: MECH_FACTORY_ADDRESS,
    salt: keccak256(concat([keccak256(initData), salt])),
  })
}

const MASTERCOPY_INIT_DATA = [] as const

export const calculateZodiacMechMastercopyAddress = () => {
  const initData = encodeAbiParameters(
    [{ type: "address[]" }],
    [MASTERCOPY_INIT_DATA]
  )
  return getCreate2Address({
    bytecode: (ZodiacMech__factory.bytecode +
      initData.slice(2)) as `0x${string}`,
    from: ERC2470_SINGLETON_FACTORY_ADDRESS,
    salt: DEFAULT_SALT,
  })
}

export const makeZodiacMechDeployTransaction = ({
  modules,
  salt = DEFAULT_SALT,
}: {
  /** Addresses of the Zodiac modules */
  modules: `0x${string}`[]
  salt: `0x${string}`
}) => {
  const initCall = encodeFunctionData({
    abi: ZodiacMech__factory.abi,
    functionName: "setUp",
    args: [encodeAbiParameters([{ type: "address[]" }], [modules])],
  })

  return {
    to: MECH_FACTORY_ADDRESS,
    data: encodeFunctionData({
      abi: MechFactory__factory.abi,
      functionName: "deployMech",
      args: [calculateZodiacMechMastercopyAddress(), "0x", initCall, salt],
    }),
  }
}

export const deployZodiacMech = async (
  walletClient: WalletClient,
  {
    modules,
    salt = DEFAULT_SALT,
  }: {
    /** Addresses of the Zodiac modules */
    modules: `0x${string}`[]
    salt?: `0x${string}`
  }
) => {
  const { chain, account } = walletClient
  if (!chain) throw new Error("No chain defined in walletClient")
  if (!account) throw new Error("No account defined in walletClient")

  const transaction = makeZodiacMechDeployTransaction({ modules, salt })

  return walletClient.sendTransaction({
    ...transaction,
    account,
    chain,
  })
}

export const deployZodiacMechMastercopy = async (
  walletClient: WalletClient
) => {
  const initData = encodeAbiParameters(
    [{ type: "address[]" }],
    [MASTERCOPY_INIT_DATA]
  )

  return await deployMastercopy(
    walletClient,
    concat([ZodiacMech__factory.bytecode, initData])
  )
}

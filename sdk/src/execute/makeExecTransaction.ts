import { BigNumber, BigNumberish } from "ethers"

import { IMech__factory } from "../../../typechain-types"

const BASE_TX_GAS = BigInt(21000)
const IMech = IMech__factory.createInterface()

interface TransactionRequest {
  to?: `0x${string}`
  from?: `0x${string}`
  gasPrice?: BigNumberish
  gasLimit?: BigNumberish
  data?: `0x${string}`
  value?: BigNumberish
  nonce?: number
}

export const makeExecuteTransaction = (
  mechAddress: `0x${string}`,
  transaction: TransactionRequest
) => {
  const { nonce, to, from, gasPrice, gasLimit, data, value } = transaction
  const txGas = gasLimit ? BigNumber.from(gasLimit).sub(BASE_TX_GAS) : BigInt(0)

  if (from && from.toLowerCase() !== mechAddress.toLowerCase()) {
    throw new Error(
      "transaction.from is set to a different address while it is expected to be the same as the mech address"
    )
  }

  return {
    to: mechAddress,
    from: undefined,

    gasPrice: BigNumber.from(gasPrice).toBigInt(),
    // gas for mech's onlyOperator modifier still needs to be calculated (can't be fixed, since it depends on external ERC721 ownerOf() function)
    gasLimit: undefined,

    data: IMech.encodeFunctionData("execute(address,uint256,bytes,uint8)", [
      to || "",
      value || 0,
      data || "0x",
      0,
    ]) as `0x${string}`,

    value: BigInt(0),
    nonce,
  }
}

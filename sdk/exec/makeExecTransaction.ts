import { TransactionRequest } from "@ethersproject/providers"
import { BigNumber } from "ethers"

import { IMech__factory } from "../../typechain-types"

const BASE_TX_GAS = 21000
const IMech = IMech__factory.createInterface()

export const makeExecTransaction = (
  mechAddress: string,
  transaction: TransactionRequest
): TransactionRequest => {
  const gasLimit = transaction.gasLimit && BigNumber.from(transaction.gasLimit)
  const txGas = gasLimit ? gasLimit.sub(BASE_TX_GAS) : BigNumber.from(0)

  const {
    nonce,
    to,
    from,
    gasPrice,
    data,
    value,
    chainId,
    type,
    accessList,
    maxPriorityFeePerGas,
    maxFeePerGas,
  } = transaction

  if (from && from.toLowerCase() !== mechAddress.toLowerCase()) {
    throw new Error(
      "transaction.from is set to a different address while it is expected to be the same as the mech address"
    )
  }

  return {
    nonce,
    to: mechAddress,
    from: undefined,

    gasPrice,
    // gas for mech's onlyOperator modifier still needs to be calculated (can't be fixed, since it depends on external ERC721 ownerOf() function)
    gasLimit: undefined,

    data: IMech.encodeFunctionData("exec", [
      to || "",
      value || 0,
      data || "0x",
      0,
      txGas,
    ]),
    value: 0,
    chainId,

    type,
    accessList,

    maxPriorityFeePerGas,
    maxFeePerGas,
  }
}

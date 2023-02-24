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
  return {
    ...transaction,
    to: mechAddress,
    data: IMech.encodeFunctionData("exec", [
      transaction.to || "",
      transaction.value || 0,
      transaction.data || "0x",
      0,
      txGas,
    ]),
    // gas for mech's onlyOperator modifier still needs to be calculated (can't be fixed, since it depends on external ERC721 ownerOf() function)
    gasLimit: undefined,
  }
}

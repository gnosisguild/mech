import {
  SequenceIndexerClient,
  TokenBalance,
  ContractType,
} from "@0xsequence/indexer"
import { useEffect, useState } from "react"
import { ChainId, SEQUENCER_ENDPOINTS } from "../chains"

interface Props {
  accountAddress?: string
  chainId: number
  tokenContract?: string
  tokenId?: string
}

const useTokenBalances = ({
  accountAddress,
  chainId,
  tokenContract,
  tokenId,
}: Props) => {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const indexer = new SequenceIndexerClient(
      SEQUENCER_ENDPOINTS[chainId as ChainId]
    )
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const tokenBalances = await indexer.getTokenBalances({
          includeMetadata: true,
          accountAddress,
          contractAddress: tokenContract,
          tokenID: tokenId,
        })

        let balances = tokenBalances.balances.filter(
          (balance) =>
            balance.contractType === ContractType.ERC20 ||
            balance.contractType === ContractType.ERC721 ||
            balance.contractType === ContractType.ERC1155
        )

        // Inconveniently, the Sequence API sets all tokenIDs to 0 if fetched without contractAddress
        if (!tokenContract) {
          // fetch the balances for each tokenContract individually, these responses will have the correct tokenID values
          const tokenContracts = new Set(
            balances
              .filter(
                (balance) =>
                  balance.contractType === ContractType.ERC721 ||
                  balance.contractType === ContractType.ERC1155
              )
              .map((balance) => balance.contractAddress)
          )

          const nftBalances = await Promise.all(
            [...tokenContracts].map(async (contractAddress) => {
              const result = await indexer.getTokenBalances({
                includeMetadata: true,
                accountAddress,
                contractAddress,
              })

              return result.balances
            })
          )

          const erc20Balances = balances.filter(
            (balance) => balance.contractType === ContractType.ERC20
          )

          balances = [...erc20Balances, ...nftBalances.flat()]
        }

        setBalances(balances)
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [accountAddress, tokenContract, tokenId, chainId])

  return { balances, isLoading, error }
}

export default useTokenBalances

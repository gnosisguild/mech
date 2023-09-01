import { SequenceIndexerClient, TokenBalance } from "@0xsequence/indexer"
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
        setBalances(tokenBalances.balances)
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

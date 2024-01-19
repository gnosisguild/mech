import { useQuery } from "@tanstack/react-query"
import { MoralisApiListResponse, MoralisNFT } from "../types/Token"

interface Props {
  tokenAddress: string
  chainId: number
}

if (!process.env.REACT_APP_PROXY_URL) {
  throw new Error("REACT_APP_PROXY_URL not set")
}

const useCollection = ({ tokenAddress, chainId }: Props) => {
  return useQuery({
    queryKey: ["collection", chainId, tokenAddress],
    queryFn: async () => {
      if (!chainId || !tokenAddress) throw new Error("No chainId or token")

      // get collection metadata
      const nftRes = await fetch(
        `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/nft/${tokenAddress}`
      )
      if (!nftRes.ok) {
        throw new Error("NFT request failed")
      }
      const collection = (await nftRes.json()) as MoralisApiListResponse
      return collection.result as MoralisNFT[]
    },
    enabled: !!chainId && !!tokenAddress,
  })
}

export default useCollection

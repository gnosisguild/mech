import { useQuery } from "@tanstack/react-query"
import { MoralisCollectionMetadata } from "../types/Token"

interface Props {
  tokenAddress: string
  chainId: number
}

if (!process.env.REACT_APP_PROXY_URL) {
  throw new Error("REACT_APP_PROXY_URL not set")
}

const useCollectionMetadata = ({ tokenAddress, chainId }: Props) => {
  return useQuery({
    queryKey: ["collectionMetadata", chainId, tokenAddress],
    queryFn: async () => {
      if (!chainId || !tokenAddress) throw new Error("No chainId or token")

      // get collection metadata
      const nftRes = await fetch(
        `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/nft/${tokenAddress}/metadata`
      )
      if (!nftRes.ok) {
        throw new Error("NFT request failed")
      }
      const collectionMetadata =
        (await nftRes.json()) as MoralisCollectionMetadata
      return collectionMetadata
    },
    enabled: !!chainId && !!tokenAddress,
  })
}

export default useCollectionMetadata

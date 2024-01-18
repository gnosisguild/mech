import { useQuery } from "@tanstack/react-query"
import { CHAINS } from "../chains"
import { MoralisNFT } from "../types/Token"

interface Props {
  tokenAddress: string
  tokenId: string
  chainId: number
}

if (!process.env.REACT_APP_PROXY_URL) {
  throw new Error("REACT_APP_PROXY_URL not set")
}

const useNFTMetadata = ({ tokenAddress, tokenId, chainId }: Props) => {
  return useQuery({
    queryKey: ["tokenBalances", chainId, tokenAddress, tokenId],
    queryFn: async () => {
      if (!chainId || !tokenAddress || !tokenId)
        throw new Error("No chainId or token")

      // get nfts
      const nftRes = await fetch(
        `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/nft/${tokenAddress}/${tokenId}}`
      )
      if (!nftRes.ok) {
        throw new Error("NFT request failed")
      }
      const nftJson = (await nftRes.json()) as MoralisNFT
      return nftJson
    },
    enabled: !!chainId && !!tokenAddress && !!tokenId,
  })
}

export default useNFTMetadata

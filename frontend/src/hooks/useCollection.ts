import { useInfiniteQuery } from "@tanstack/react-query"
import { MoralisApiListResponse } from "../types/Token"

interface Props {
  tokenAddress: string
  chainId: number
  page?: number
}

if (!process.env.REACT_APP_PROXY_URL) {
  throw new Error("REACT_APP_PROXY_URL not set")
}

const useCollection = ({ tokenAddress, chainId, page = 0 }: Props) => {
  return useInfiniteQuery({
    queryKey: ["collection", chainId, tokenAddress],
    queryFn: async ({ pageParam }) => {
      if (!chainId || !tokenAddress) throw new Error("No chainId or token")
      const params = new URLSearchParams([
        ["cursor", pageParam],
        ["media_items", "true"],
      ])
      // get collection metadata
      const nftRes = await fetch(
        `${
          process.env.REACT_APP_PROXY_URL
        }/${chainId}/moralis/nft/${tokenAddress}?${params.toString()}`
      )
      if (!nftRes.ok) {
        throw new Error("NFT request failed")
      }
      const collection = (await nftRes.json()) as MoralisApiListResponse
      return collection
    },
    initialPageParam: "",
    maxPages: 1,
    getNextPageParam: (lastPage) => lastPage.cursor || "",
    getPreviousPageParam: (firstPage) => firstPage.cursor || "",
    enabled: !!chainId && !!tokenAddress,
  })
}

export default useCollection

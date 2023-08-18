import { useEffect, useState } from "react"
import { usePublicClient } from "wagmi"
import { CHAINS } from "../chains"
import { nxyzNFT } from "../types/nxyzApiTypes"

interface NFTProps {
  walletAddress: string
  chainId?: number
  pageToken?: string
}

export interface MechNFT extends nxyzNFT {
  tokenStandard?: "ERC-721" | "ERC-1155"
}

interface MechGetNFTsByOwnerReply {
  assets: MechNFT[]
  nextPageToken?: string
}

interface NFTResult {
  data: MechGetNFTsByOwnerReply
  isLoading: boolean
  error: any
}

type useNFTsByOwnerType = (props: NFTProps) => NFTResult

const DEFAULT_CHAIN = CHAINS[5]

const useNFTsByOwner: useNFTsByOwnerType = ({
  walletAddress,
  chainId,
  pageToken,
}) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const client = usePublicClient()

  useEffect(() => {
    const apiUrl = `https://nxyz-api-wrapper.vercel.app/api/v1/address/${walletAddress}/balances/nfts?chainID=eip155:${
      chainId || DEFAULT_CHAIN.id
    }&limit=20&filterSpam=false${pageToken ? `&cursor=${pageToken}` : ""}`
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(apiUrl)
        const cursor = res.headers.get("X-Doc-Next-Cursor")
        const nfts: nxyzNFT[] = await res.json()
        setData({ assets: nfts, nextPageToken: cursor })
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [walletAddress, chainId, pageToken, client])

  return { data, isLoading, error }
}

export default useNFTsByOwner

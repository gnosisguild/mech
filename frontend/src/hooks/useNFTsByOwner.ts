import { calculateERC721MechAddress } from "mech-sdk"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"
import { nxyzNFT, nxyzSupportedChains } from "../types/nxyzApiTypes"

interface NFTProps {
  walletAddress: string
  blockchain?: nxyzSupportedChains
  pageToken?: string
}

export interface MechNFT extends nxyzNFT {
  hasMech?: boolean
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

const useNFTsByOwner: useNFTsByOwnerType = ({
  walletAddress,
  blockchain,
  pageToken,
}) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const provider = useProvider()

  useEffect(() => {
    const apiUrl = `https://nxyz-api-wrapper.vercel.app/api/v1/address/${walletAddress}/balances/nfts?chainID=gor&limit=20&filterSpam=false${
      pageToken ? `&cursor=${pageToken}` : ""
    }`
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(apiUrl)
        const cursor = res.headers.get("X-Doc-Next-Cursor")
        const nfts: nxyzNFT[] = await res.json()

        for (let index = 0; index < nfts.length; index++) {
          const nft = nfts[index] as MechNFT
          try {
            const hasMech =
              (await provider.getCode(
                calculateERC721MechAddress(nft.contractAddress, nft.nft.tokenID)
              )) !== "0x"
            nft.hasMech = hasMech
          } catch (error) {
            console.log(error)
            nft.hasMech = false
          }
        }

        setData({ assets: nfts, nextPageToken: cursor })
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [walletAddress, blockchain, pageToken, provider])

  return { data, isLoading, error }
}

export default useNFTsByOwner

import { AnkrProvider, Nft } from "@ankr.com/ankr.js"

import { Blockchain, GetNFTsByOwnerReply } from "@ankr.com/ankr.js"
import { calculateERC721MechAddress } from "mech"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"

interface NFTProps {
  walletAddress: string
  blockchain?: Blockchain | Blockchain[]
  pageToken?: string
}

export interface MechNFT extends Nft {
  hasMech?: boolean
}

interface MechGetNFTsByOwnerReply extends GetNFTsByOwnerReply {
  assets: MechNFT[]
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
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const ankr = new AnkrProvider()
        const data: MechGetNFTsByOwnerReply = await ankr.getNFTsByOwner({
          walletAddress,
          blockchain,
          pageToken,
        })
        for (let index = 0; index < data.assets.length; index++) {
          const nft = data.assets[index]
          try {
            const hasMech =
              (await provider.getCode(
                calculateERC721MechAddress(nft.contractAddress, nft.tokenId)
              )) !== "0x"
            nft.hasMech = hasMech
          } catch (error) {
            console.log(error)
            nft.hasMech = false
          }
        }
        setData(data)
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

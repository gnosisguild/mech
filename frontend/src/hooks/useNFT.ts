import { AnkrProvider } from "@ankr.com/ankr.js"

import { Blockchain, GetNFTMetadataReply } from "@ankr.com/ankr.js"
import { calculateERC721MechAddress } from "mech-sdk"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"

interface NFTProps {
  contractAddress: string
  blockchain: Blockchain
  tokenId: string
}

export interface MechGetNFTMetadataReply extends GetNFTMetadataReply {
  hasMech?: boolean
}

interface NFTResult {
  data: MechGetNFTMetadataReply
  isLoading: boolean
  error: any
}

type useNFTType = (props: NFTProps) => NFTResult

const useNFT: useNFTType = ({ contractAddress, blockchain, tokenId }) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const provider = useProvider()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const ankr = new AnkrProvider()
        const mechRes: MechGetNFTMetadataReply = await ankr.getNFTMetadata({
          contractAddress,
          blockchain,
          tokenId,
          forceFetch: true,
        })

        try {
          if (!mechRes.metadata) throw new Error("No metadata")

          const hasMech =
            (await provider.getCode(
              calculateERC721MechAddress(
                mechRes.metadata.contractAddress,
                mechRes.metadata.tokenId
              )
            )) !== "0x"
          mechRes.hasMech = hasMech
        } catch (error) {
          console.log(error)
          mechRes.hasMech = false
        }
        setData(mechRes)
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [contractAddress, blockchain, tokenId, provider])

  return { data, isLoading, error }
}

export default useNFT

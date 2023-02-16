import { AnkrProvider } from "@ankr.com/ankr.js"

import { Blockchain, GetNFTsByOwnerReply } from "@ankr.com/ankr.js"
import { useEffect, useState } from "react"

interface NFTProps {
  walletAddress: string
  blockchain: Blockchain
  pageToken?: string
}

interface NFTResult {
  data: GetNFTsByOwnerReply
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const ankr = new AnkrProvider()
        const data = await ankr.getNFTsByOwner({
          walletAddress,
          blockchain,
          pageToken,
        })
        setData(data)
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [walletAddress, blockchain, pageToken])

  return { data, isLoading, error }
}

export default useNFTsByOwner

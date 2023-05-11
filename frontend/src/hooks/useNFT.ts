import { useEffect, useState } from "react"
import { useProvider } from "wagmi"
import { CHAINS } from "../chains"

import { nxyzNFT } from "../types/nxyzApiTypes"
import { calculateMechAddress } from "../utils/calculateMechAddress"
import { MechNFT } from "./useNFTsByOwner"

interface NFTProps {
  contractAddress: string
  chainId: number
  tokenId: string
}

interface NFTResult {
  data: MechNFT | null
  isLoading: boolean
  error: any
}

type useNFTType = (props: NFTProps) => NFTResult

const DEFAULT_CHAIN = CHAINS[5]

const useNFT: useNFTType = ({ contractAddress, chainId, tokenId }) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const provider = useProvider()

  const chain = (CHAINS as any)[chainId] || DEFAULT_CHAIN
  const chainShortName = chain.shortName

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = `https://nxyz-api-wrapper.vercel.app/api/v1/nfts/${contractAddress}/${tokenId}?chainID=${chainShortName}&limit=20&filterSpam=false`
      try {
        setIsLoading(true)
        const res = await fetch(apiUrl)
        const data: nxyzNFT[] = await res.json()
        const mechData = data[0] as MechNFT

        try {
          if (!mechData) throw new Error("No metadata")

          const hasMech =
            (await provider.getCode(calculateMechAddress(mechData))) !== "0x"
          mechData.hasMech = hasMech
        } catch (error) {
          console.log(error)
          mechData.hasMech = false
        }
        setData(mechData)
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [contractAddress, chainShortName, tokenId, provider])

  return { data, isLoading, error }
}

export default useNFT

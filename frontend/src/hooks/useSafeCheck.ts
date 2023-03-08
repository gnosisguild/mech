import { useState, useEffect } from "react"

type safeApiUrlsType = {
  [key: number]: string
}

const safeApiUrls: safeApiUrlsType = {
  1: "https://safe-transaction-mainnet.safe.global",
  100: "https://safe-transaction-gnosis-chain.safe.global",
  137: "https://safe-transaction-polygon.safe.global",
  56: "https://safe-transaction-bsc.safe.global",
  42161: "https://safe-transaction-arbitrum.safe.global",
  43114: "https://safe-transaction-avalanche.safe.global",
  10: "https://safe-transaction-optimism.safe.global",
  5: "https://safe-transaction-goerli.safe.global/",
}

interface Props {
  address: string | undefined
  chainId: number | undefined
}

interface SafeResult {
  data: string[]
  isLoading: boolean
  error: any
}

interface SafeOwnerRes {
  safes: string[]
}

type useSafeCheckType = (props: Props) => SafeResult

const useSafeCheck: useSafeCheckType = ({ address, chainId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!address || !chainId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      if (address.slice(0, 4) === "http") {
        try {
          const response = await fetch(
            safeApiUrls[chainId] + `/api/v1/owners/${address}/safes/`
          )
          const data: SafeOwnerRes = await response.json()
          setData(data.safes)
          setIsLoading(false)
        } catch (e) {
          setError(e)
          setIsLoading(false)
        }
      } else if (address.slice(0, 29) === "data:application/json;base64,") {
        const json = Buffer.from(address.slice(29), "base64").toString()
        setData(JSON.parse(json))
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address, chainId])

  return { isLoading, data, error }
}

export default useSafeCheck

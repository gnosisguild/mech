import { AnkrProvider, GetAccountBalanceReply } from "@ankr.com/ankr.js"
import { useEffect, useState } from "react"

interface Props {
  address: string
  pageToken?: string
}

interface AccountResult {
  data: GetAccountBalanceReply
  isLoading: boolean
  error: any
}

type useAccountBalanceType = (props: Props) => AccountResult

const useAccountBalance: useAccountBalanceType = ({ address, pageToken }) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const ankr = new AnkrProvider()
        const res = await ankr.getAccountBalance({
          walletAddress: address,
        })

        setData(res)
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address, pageToken])

  return { data, isLoading, error }
}

export default useAccountBalance

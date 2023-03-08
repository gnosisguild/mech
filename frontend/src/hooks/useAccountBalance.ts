import { useEffect, useState } from "react"
import { nxyzFungibleBalance } from "../types/nxyzApiTypes"

interface Props {
  address: string
}

interface AccountResult {
  data: {
    totalBalanceUSD?: number
    assets: nxyzFungibleBalance[]
  }
  isLoading: boolean
  error: any
}

type useAccountBalanceType = (props: Props) => AccountResult

const sumNxyzFiatBalances = (balances: nxyzFungibleBalance[]) => {
  return balances.reduce((acc, balance) => {
    if (balance.fiat) {
      const usdBalance = balance.fiat.find((fiat) => fiat.symbol === "USD")
      return acc + (usdBalance ? usdBalance?.tokenValue : 0)
    }
    return acc
  }, 0)
}

const useAccountBalance: useAccountBalanceType = ({ address }) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const apiUrl = `https://nxyz-api-wrapper.vercel.app/api/v1/address/${address}/balances/fungibles?chainID=gor&filterDust=true&filterSpam=true`
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(apiUrl)
        const data = await res.json()

        setData({
          assets: data,
          totalBalanceUSD: sumNxyzFiatBalances(data),
        })
        setIsLoading(false)
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address])

  return { data, isLoading, error }
}

export default useAccountBalance

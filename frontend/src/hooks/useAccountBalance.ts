import { useEffect, useState } from "react"

interface Props {
  address: string
}

interface nxyzBlockchain {
  name: string
  shortName: string
  chainId: string
  shortChainId: string
}

interface nxyzTokenSymbol {
  uri?: string
  duration?: string
  format?: string
  height?: number
  width?: number
  kind?: string
}

interface nxyzFiat {
  decimals: number
  name?: string
  percentChange24hour?: number
  pretty: string
  symbol?: string
  symbolLogos?: nxyzTokenSymbol[]
  tokenValue: number
  updateTime?: string
  value: string
}

interface nxyzFungibleBalance {
  value: string
  tokenValue: number
  pretty: string
  decimals: number
  symbol: string
  contractAddress: string
  name: string
  blockchain: nxyzBlockchain
  fiat?: nxyzFiat[]
  historicalFiat?: nxyzFiat[]
  symbolLogos?: nxyzTokenSymbol[]
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
        console.log(sumNxyzFiatBalances(data))
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

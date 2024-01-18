import { useQuery } from "@tanstack/react-query"
import { CHAINS } from "../chains"
import { MoralisFungible, MoralisNFT } from "../types/Token"

interface Props {
  accountAddress?: string
  chainId: number
}

if (!process.env.REACT_APP_PROXY_URL) {
  throw new Error("REACT_APP_PROXY_URL not set")
}

const useTokenBalances = ({ accountAddress, chainId }: Props) => {
  return useQuery({
    queryKey: ["tokenBalances", chainId, accountAddress],
    queryFn: async () => {
      if (!chainId || !accountAddress) throw new Error("No chainId or account")

      try {
        // get nfts
        const nftRes = await fetch(
          `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/${accountAddress}/nft`
        )
        if (!nftRes.ok) {
          throw new Error("NFT request failed")
        }
        const nftJson = await nftRes.json()
        const nftData = nftJson.result as MoralisNFT[]

        // get erc20s
        const erc20Res = await fetch(
          `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/${accountAddress}/erc20`
        )
        if (!erc20Res.ok) {
          throw new Error("ERC20 request failed")
        }
        const erc20Json = await erc20Res.json()
        const erc20Data = erc20Json.result as MoralisFungible[]

        // get native balance
        const nativeRes = await fetch(
          `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/${accountAddress}/balance`
        )
        if (!nativeRes.ok) {
          throw new Error("Native request failed")
        }
        const nativeJson = await nativeRes.json()
        const nativeData = {
          balance: nativeJson.balance as string,
          decimals: CHAINS[chainId].nativeCurrency.decimals,
          name: CHAINS[chainId].nativeCurrency.name,
          symbol: CHAINS[chainId].nativeCurrency.symbol,
        } as MoralisFungible

        return {
          nfts: nftData,
          erc20s: erc20Data,
          native: nativeData,
        }
      } catch (error) {
        console.error(error)
        return {
          nfts: [],
          erc20s: [],
          native: {
            balance: "0",
            decimals: CHAINS[chainId].nativeCurrency.decimals,
            name: CHAINS[chainId].nativeCurrency.name,
            symbol: CHAINS[chainId].nativeCurrency.symbol,
          },
        }
      }
    },
    enabled: !!chainId && !!accountAddress,
  })
}

export default useTokenBalances

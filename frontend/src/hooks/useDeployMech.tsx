import { TokenBalance } from "@0xsequence/indexer"
import { useEffect, useState } from "react"
import {
  PublicClient,
  useChainId,
  usePublicClient,
  useQuery,
  useQueryClient,
  useWalletClient,
} from "wagmi"
import { calculateMechAddress } from "../utils/calculateMechAddress"
import { makeMechDeployTransaction } from "../utils/deployMech"

interface QueryKeyArgs {
  address: `0x${string}`
  chainId: number
}

function queryFn(client: PublicClient) {
  return async ({
    queryKey: [, { address }],
  }: {
    queryKey: [string, QueryKeyArgs]
  }) => {
    const bytecode = await client.getBytecode({
      address,
    })
    return !!bytecode && bytecode.length > 2
  }
}

export const useDeployMech = (token: TokenBalance | null) => {
  const mechAddress = token && calculateMechAddress(token)

  const publicClient = usePublicClient({ chainId: token?.chainId })
  const { data: deployed } = useQuery<boolean>(
    [
      "mechDeployed",
      { address: mechAddress, chainId: token?.chainId },
    ] as const,
    {
      queryFn: queryFn(publicClient) as any,
      enabled: !!mechAddress,
    }
  )

  const { data: walletClient } = useWalletClient({ chainId: token?.chainId })

  const queryClient = useQueryClient()

  const [deployPending, setDeployPending] = useState(false)
  const deploy = async () => {
    if (!walletClient || !token) return
    const tx = makeMechDeployTransaction(token)
    setDeployPending(true)
    try {
      const hash = await walletClient.sendTransaction(tx)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      queryClient.setQueryData(
        ["mechDeployed", { address: mechAddress, chainId: token.chainId }],
        true
      )
      return receipt
    } catch (e) {
      console.error(e)
    } finally {
      setDeployPending(false)
    }
  }

  return { deployed, deploy, deployPending }
}

export const useDeployedMechs = (nfts: TokenBalance[]) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    nfts.forEach((nft) => {
      queryClient
        .ensureQueryData([
          "mechDeployed",
          {
            address: calculateMechAddress(nft),
            chainId: nft.chainId,
          },
        ])
        .catch((e) => {
          /* when switching networks, this might throw an error (`Missing queryFn for queryKey`) */
        })
    })
  }, [queryClient, nfts])

  const deployedMechs = queryClient.getQueriesData([
    "mechDeployed",
  ]) as unknown as [
    [
      string,
      {
        address: `0x${string}`
        chainId: number
      }
    ],
    boolean | undefined
  ][]

  return deployedMechs
    .filter(([, deployed]) => deployed)
    .map(([args]) => args[1])
}

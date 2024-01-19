import { useEffect, useState } from "react"
import {
  usePublicClient,
  useWalletClient,
  useQuery,
  useQueryClient,
} from "wagmi"
import { PublicClient } from "viem"
import { calculateMechAddress } from "../utils/calculateMechAddress"
import { makeMechDeployTransaction } from "../utils/deployMech"
import { NFTContext } from "../types/Token"

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

export const useDeployMech = (token: NFTContext | null, chainId: number) => {
  const mechAddress = token && calculateMechAddress(token, chainId)

  const publicClient = usePublicClient({ chainId: chainId })
  const { data: deployed } = useQuery<boolean>(
    ["mechDeployed", { address: mechAddress, chainId: chainId }] as const,
    {
      queryFn: queryFn(publicClient) as any,
      enabled: !!mechAddress,
    }
  )

  const { data: walletClient } = useWalletClient({ chainId })

  const queryClient = useQueryClient()

  const [deployPending, setDeployPending] = useState(false)
  const deploy = async () => {
    if (!walletClient || !token) return
    const tx = makeMechDeployTransaction(token, chainId)
    setDeployPending(true)
    try {
      const hash = await walletClient.sendTransaction(tx)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      queryClient.setQueryData(
        ["mechDeployed", { address: mechAddress, chainId }],
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

export const useDeployedMechs = (nfts: NFTContext[], chainId: number) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    nfts.forEach((nft) => {
      queryClient
        .ensureQueryData([
          "mechDeployed",
          {
            address: calculateMechAddress(nft, chainId),
            chainId: chainId,
          },
        ])
        .catch((e) => {
          console.error(e)
          /* when switching networks, this might throw an error (`Missing queryFn for queryKey`) */
        })
    })
  }, [queryClient, nfts, chainId])

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

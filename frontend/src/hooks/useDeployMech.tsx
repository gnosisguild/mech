import { useState } from "react"
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
import { MechNFT } from "./useNFTsByOwner"

interface QueryKeyArgs {
  address: `0x${string}`
  chainId: number
}

function queryFn(client: PublicClient) {
  return async ({ queryKey: [{ address }] }: { queryKey: [QueryKeyArgs] }) => {
    const bytecode = await client.getBytecode({
      address,
    })
    return bytecode && bytecode.length > 2
  }
}

export const useDeployMech = (token: MechNFT | null) => {
  const mechAddress = token && calculateMechAddress(token)
  const chainId = useChainId()

  const publicClient = usePublicClient()
  const { data: deployed } = useQuery<boolean>(
    ["mechDeployed", { address: mechAddress, chainId }] as const,
    { queryFn: queryFn(publicClient) as any, enabled: !!mechAddress }
  )

  const { data: walletClient } = useWalletClient()

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

export const useDeployedMechs = () => {
  const queryClient = useQueryClient()

  const deployedMechs = queryClient.getQueriesData(["mechDeployed"])
  console.log({ deployedMechs })
  return deployedMechs as unknown as {
    address: `0x${string}`
    chainId: number
  }[] // TODO
}

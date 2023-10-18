import React from "react"
import { TokenBalance } from "@0xsequence/indexer"
import { useParams } from "react-router-dom"
import Layout from "../../components/Layout"
import NFTItem from "../../components/NFTItem"

import classes from "./Mech.module.css"
import Spinner from "../../components/Spinner"
import MechConnect from "../../components/Connect"
import { ProvideWalletConnect } from "../../hooks/useWalletConnect"
import { useHandleRequest } from "../../hooks/useHandleRequest"
import { useDeployMech } from "../../hooks/useDeployMech"
import MechDeploy from "../../components/Deploy"
import { calculateMechAddress } from "../../utils/calculateMechAddress"
import { CHAINS } from "../../chains"
import useTokenBalances from "../../hooks/useTokenBalances"

const Mech: React.FC = () => {
  const { token, tokenId } = useParams()

  if (!token || !tokenId) {
    throw new Error("token and tokenId are required")
  }

  const [chainPrefix, contractAddress] = token.split(":")
  if (!chainPrefix || !contractAddress) {
    throw new Error("token must be in the format <chain>:<contractAddress>")
  }
  const chain = Object.values(CHAINS).find((c) => c.prefix === chainPrefix)

  if (!chain) {
    throw new Error(`chain ${chainPrefix} not support`)
  }

  if (!contractAddress.startsWith("0x")) {
    throw new Error("token must be a valid address")
  }

  const { balances, error, isLoading } = useTokenBalances({
    tokenContract: contractAddress,
    chainId: chain.id,
    tokenId: tokenId,
  })
  const balance: TokenBalance | null = balances[0]

  const { deployed, deploy, deployPending } = useDeployMech(balance)

  const mechAddress = balance && calculateMechAddress(balance)

  const handleRequest = useHandleRequest(mechAddress)

  return (
    <Layout mechAddress={mechAddress || undefined}>
      <div className={classes.container}>
        {isLoading && <Spinner />}
        {!error && !isLoading && balance && mechAddress && (
          <>
            <NFTItem tokenBalance={balance} />

            <ProvideWalletConnect
              chainId={chain.id}
              mechAddress={mechAddress}
              onRequest={handleRequest}
            >
              {deployed && <MechConnect />}
              {!deployed && (
                <MechDeploy deploy={deploy} deployPending={deployPending} />
              )}
            </ProvideWalletConnect>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Mech

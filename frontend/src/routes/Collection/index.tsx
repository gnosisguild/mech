import React from "react"
import { useParams } from "react-router-dom"

import Layout from "../../components/Layout"
import { CollectionNftGrid } from "../../components/NFTGrid"
import classes from "./Collection.module.css"
import { getAddress } from "viem"
import Blockie from "../../components/Blockie"
import useCollectionMetadata from "../../hooks/useCollectionMetadata"
import { useChainId } from "wagmi"

const Collection: React.FC = () => {
  const { address } = useParams()
  const chainId = useChainId()
  let validAddress = ""
  try {
    validAddress = getAddress(address || "")
  } catch (error) {
    console.log(error)
  }
  const { data, isLoading, error } = useCollectionMetadata({
    tokenAddress: validAddress,
    chainId,
  })

  if (validAddress) {
    return (
      <Layout>
        <div className={classes.container}>
          <div className={classes.accountHeader}>
            <div className={classes.title}>
              {data && !isLoading ? data.name : "Collection"}
            </div>
            <div className={classes.account}>
              <div className={classes.blockie}>
                <Blockie address={validAddress} />
              </div>
              <h1>
                <code>{validAddress}</code>
              </h1>
            </div>
          </div>
          <CollectionNftGrid address={validAddress} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1>
        <code>{address}</code> is not a valid address
      </h1>
    </Layout>
  )
}
export default Collection

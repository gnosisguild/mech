import React from "react"
import { useParams } from "react-router-dom"

import Layout from "../../components/Layout"
import NFTGrid from "../../components/NFTGrid"
import classes from "./Account.module.css"
import { getAddress } from "viem"
import Blockie from "../../components/Blockie"

const Landing: React.FC = () => {
  const { address } = useParams()
  let validAddress = ""
  try {
    validAddress = getAddress(address || "")
  } catch (error) {
    console.log(error)
  }

  if (validAddress) {
    return (
      <Layout>
        <div className={classes.container}>
          <div className={classes.accountHeader}>
            <div className={classes.title}>Inventory</div>
            <div className={classes.account}>
              <div className={classes.blockie}>
                <Blockie address={validAddress} />
              </div>
              <h1>
                <code>{validAddress}</code>
              </h1>
            </div>
          </div>
          <NFTGrid address={validAddress} />
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
export default Landing

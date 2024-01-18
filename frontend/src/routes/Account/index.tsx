import React from "react"
import { useParams } from "react-router-dom"

import Layout from "../../components/Layout"
import NFTGrid from "../../components/NFTGrid"
import classes from "./Account.module.css"
import { getAddress } from "viem"

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
        <h1>Available mechs for {getAddress(address || "")}</h1>
        <NFTGrid address={validAddress} />
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

import React from "react"
import Connect from "./Connect"
import Layout from "./Layout"

const Landing: React.FC = () => {
  return (
    <Layout>
      Connect your wallet and select one of your mechs to get started
      <hr />
      <Connect />
    </Layout>
  )
}
export default Landing

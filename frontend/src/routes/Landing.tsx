import React from "react"
import Layout from "../components/Layout"
import LandingCard from "../components/LandingCard"
import { useAccount } from "wagmi"

const Landing: React.FC = () => {
  const { address } = useAccount()
  return (
    <Layout>
      <LandingCard accountAddress={address} />
    </Layout>
  )
}
export default Landing

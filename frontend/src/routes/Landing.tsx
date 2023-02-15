import React from "react"
import Layout from "../components/Layout"
import LandingCard from "../components/LandingCard"
import { useAccount } from "wagmi"
import NFTGrid from "../components/NFTGrid"

const Landing: React.FC = () => {
  const { address } = useAccount()

  return (
    <Layout>{address ? <NFTGrid address={address} /> : <LandingCard />}</Layout>
  )
}
export default Landing

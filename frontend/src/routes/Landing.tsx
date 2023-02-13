import React from "react"
import Layout from "../components/Layout"
import LandingCard from "../components/LandingCard"
import { useAccount } from "wagmi"

const Landing: React.FC = () => {
  const { address } = useAccount()
  return (
    <Layout>{address ? <p>Connected to {address}</p> : <LandingCard />}</Layout>
  )
}
export default Landing

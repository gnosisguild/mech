import React, { Suspense } from "react"
import Layout from "../components/Layout"
import { useAccount } from "wagmi"
import Spinner from "../components/Spinner"

const NFTGrid = React.lazy(() => import("../components/NFTGrid"))

const Account: React.FC = () => {
  const { address } = useAccount()
  return (
    <Layout>
      {address && (
        <Suspense fallback={<Spinner />}>
          <NFTGrid address={address} />
        </Suspense>
      )}
    </Layout>
  )
}
export default Account

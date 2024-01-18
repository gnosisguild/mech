import React from "react"
import { createBrowserRouter } from "react-router-dom"
import Mech from "./routes/Mech"
import Account from "./routes/Account"
import Landing from "./routes/Landing"

export default createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "mechs/:token/:tokenId",
    element: <Mech />,
  },
  {
    path: "account/:address/",
    element: <Account />,
  },
])

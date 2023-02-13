import React from "react"
import { createBrowserRouter } from "react-router-dom"
import Mech from "./routes/Mech"
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
])

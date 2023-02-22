import React from "react"
import { createBrowserRouter } from "react-router-dom"
import Landing from "./routes/Landing"
const Account = React.lazy(() => import("./routes/Account"))
const Mech = React.lazy(() => import("./routes/Mech"))

export default createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: ":address",
    element: <Account />,
  },
  {
    path: "mechs/:token/:tokenId",
    element: <Mech />,
  },
])

import React from "react"
import { createBrowserRouter } from "react-router-dom"
import Mech from "./Mech"
import Landing from "./Landing"

export default createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  // {
  //   path: "mechs",
  //   element: <Mechs />,
  // },
  {
    path: "mechs/:token/:tokenId",
    element: <Mech />,
  },
  // {
  //   path: "clubs",
  //   element: <Clubs />,
  // },
  // {
  //   path: "clubs/new",
  //   element: <NewClub />,
  // },
  // {
  //   path: "clubs/:address",
  //   element: <Club />,
  // },
])

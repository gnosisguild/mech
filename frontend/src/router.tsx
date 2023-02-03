import React from "react"
import { createBrowserRouter } from "react-router-dom"
import Card from "./Card"
import Landing from "./Landing"

export default createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  // {
  //   path: "cards",
  //   element: <Cards />,
  // },
  {
    path: "cards/:token/:tokenId",
    element: <Card />,
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

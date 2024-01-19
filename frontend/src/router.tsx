import { createBrowserRouter } from "react-router-dom"
import Mech from "./routes/Mech"
import Account from "./routes/Account"
import Landing from "./routes/Landing"
import Collection from "./routes/Collection"

export default createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "mech/:token/:tokenId",
    element: <Mech />,
  },
  {
    path: "account/:address/",
    element: <Account />,
  },
  {
    path: "collection/:address/",
    element: <Collection />,
  },
])

import React from "react"
import Layout from "../components/Layout"
import LandingCard from "../components/LandingCard"

import classes from "./Landing.module.css"

const Landing: React.FC = () => {
  return (
    <>
      <Layout>
        <LandingCard />
      </Layout>
      <footer className={classes.footer}>
        <a
          className={classes.gg}
          href="https://www.gnosisguild.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/gnosisguild.png"
            alt="Gnosis Guild"
            width={24}
            height={24}
            className={classes.logo}
          />
          <p>Built by Gnosis Guild</p>
        </a>
      </footer>
    </>
  )
}
export default Landing

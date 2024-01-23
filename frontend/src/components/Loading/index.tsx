import React from "react"

import classes from "./style.module.css"

const Loading: React.FC = () => (
  <div className={classes.container}>
    <img src="/loading-short.gif" alt="Loading" />
  </div>
)

export default Loading

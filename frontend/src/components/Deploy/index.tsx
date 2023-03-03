import React from "react"
import Spinner from "../Spinner"

import classes from "./Deploy.module.css"
import Button from "../Button"
import { TransactionReceipt } from "@ethersproject/providers"

interface Props {
  deployPending: boolean
  deploy: () => Promise<TransactionReceipt | undefined>
}

const MechDeploy: React.FC<Props> = ({ deployPending, deploy }) => {
  return (
    <div className={classes.container}>
      <h3>Deploy Mech</h3>
      <div className={classes.deployButton}>
        <label>Deploy this Mech to use it for connecting to apps</label>
        <Button onClick={deploy} disabled={deployPending}>
          {deployPending ? (
            <>
              <Spinner /> Deploying...
            </>
          ) : (
            "Deploy"
          )}
        </Button>
      </div>
    </div>
  )
}

export default MechDeploy

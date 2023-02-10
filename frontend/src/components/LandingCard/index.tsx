import { useWeb3Modal } from "@web3modal/react"
import usdcIcon from "cryptocurrency-icons/svg/color/usdc.svg"
import gnoIcon from "cryptocurrency-icons/svg/color/gno.svg"

import Button from "../Button"
import classes from "./LandingCard.module.css"

const LandingCard: React.FC = () => {
  const { open } = useWeb3Modal()
  return (
    <div className={classes.landingCard}>
      <p>
        Mech gives any NFT the abilities of a full smart contract account — hold
        tokens, become a multisig owner, etc. Whoever owns that NFT becomes the
        operator of its Mech.
      </p>
      <div className={classes.demoCard}>
        <ul className={classes.demoInfo}>
          <li>
            <label>Mech</label>
            <div className={classes.infoItem}>0x1F34...1543</div>
          </li>
          <li>
            <label>Inventory</label>
            <div className={classes.infoItem}>
              <img src={usdcIcon} alt="usdc token icon" /> <p>101.12 USDC</p>
            </div>
            <div className={classes.infoItem}>
              <img src={gnoIcon} alt="gno token icon" /> <p>14.121 GNO</p>
            </div>
          </li>
          <li>
            <label>Operator</label>
            <div className={classes.infoItem}>
              <img src="/milady142.jpg" alt="Milady #142" />
              <div>
                <p>Milady</p>
                <p>142</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <Button onClick={open} className={classes.connectButton}>
        Connect wallet to view available Mechs
      </Button>
    </div>
  )
}

export default LandingCard

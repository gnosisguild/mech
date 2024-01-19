import usdcIcon from "cryptocurrency-icons/svg/color/usdc.svg"
import gnoIcon from "cryptocurrency-icons/svg/color/gno.svg"

import classes from "./LandingCard.module.css"
import clsx from "clsx"

const LandingCard: React.FC = () => {
  return (
    <div className={classes.landingCard}>
      <p>
        Mech gives any NFT the abilities of a full smart contract account — hold
        tokens, become a multisig owner, etc. Whoever owns that NFT becomes the
        operator of its Mech.
      </p>
      <div className={classes.demoCard}>
        <img
          src="/mech-idle-less-min.gif"
          alt="Mech"
          className={classes.mech}
        />
        <ul className={classes.demoInfo}>
          <li>
            <label>Mech Operator</label>
            <div className={clsx(classes.infoItem, classes.operator)}>
              <img src="/milady142.jpg" alt="Milady #142" />
              <div>
                <p>Milady</p>
                <p>142</p>
              </div>
            </div>
          </li>
          <li>
            <label>Mech Address</label>
            <div className={clsx(classes.infoItem, classes.address)}>
              0x1F34...1543
            </div>
          </li>
          <li>
            <label>Mech Inventory</label>
            <div className={classes.infoItem}>
              <img src={usdcIcon} alt="usdc token icon" /> <p>101.12 USDC</p>
            </div>
            <div className={classes.infoItem}>
              <img src={gnoIcon} alt="gno token icon" /> <p>14.121 GNO</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default LandingCard

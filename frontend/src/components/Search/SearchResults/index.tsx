import Blockie from "../../Blockie"

import classes from "./SearchResults.module.css"

export type SearchResult = {
  address: string
  type: "mech" | "account" | "nft" | "unknown"
  name?: string
  img?: string
}

const SearchResults = ({ results }: { results: SearchResult[] }) => {
  return (
    <ul className={classes.results}>
      {results
        .filter((result) => result.type === "mech")
        .map((result, index) => (
          <li className={classes.category} key={`mech-${result.address}`}>
            <h2>Deployed Mech</h2>
            <ul className={classes.categoryResults}>
              <li>
                <a href={`/mech/${result.address}`} className={classes.result}>
                  {result.type === "mech" && <NFTResult result={result} />}
                </a>
              </li>
            </ul>
          </li>
        ))}
      {results
        .filter((result) => result.type === "nft")
        .map((result, index) => (
          <li className={classes.category} key={`nft-${result.address}`}>
            <h2>NFT Collection</h2>
            <ul className={classes.categoryResults}>
              <li>
                <a
                  href={`/collection/${result.address}`}
                  className={classes.result}
                >
                  {result.type === "nft" && <NFTResult result={result} />}
                </a>
              </li>
            </ul>
          </li>
        ))}
      {results
        .filter((result) => result.type === "account")
        .map((result, index) => (
          <li className={classes.category} key={`account-${result.address}`}>
            <h2>Account</h2>
            <ul className={classes.categoryResults}>
              <li>
                <a
                  href={`/account/${result.address}`}
                  className={classes.result}
                >
                  {result.type === "account" && (
                    <AccountResult result={result} />
                  )}
                </a>
              </li>
            </ul>
          </li>
        ))}
    </ul>
  )
}

const NFTResult = ({ result }: { result: SearchResult }) => {
  return (
    <>
      <div className={classes.blockie}>
        <Blockie address={result.address} />
      </div>
      <p className={classes.address}>{result.address}</p>
    </>
  )
}

const AccountResult = ({ result }: { result: SearchResult }) => {
  return (
    <>
      <div className={classes.blockie}>
        <Blockie address={result.address} />
      </div>
      <p className={classes.address}>{result.address}</p>
    </>
  )
}

export default SearchResults

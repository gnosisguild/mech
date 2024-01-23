import { useState } from "react"
import { isAddress } from "viem"

import classes from "./Search.module.css"
import SearchResults, { SearchResult } from "./SearchResults"
import { useChainId, usePublicClient } from "wagmi"
import parseMechBytecode from "../../utils/parseMechBytecode"
import Loading from "../Loading"

const Search = () => {
  const chainId = useChainId()
  const client = usePublicClient()
  const [search, setSearch] = useState("")
  const [validSearch, setValidSearch] = useState(true)
  const [results, setResults] = useState<SearchResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setResultsLoading(true)
    setResults([])
    const newSearch = e.target.value || ""
    setSearch(newSearch)

    if (!newSearch) {
      setResultsLoading(false)
      return setValidSearch(true)
    }

    const valid = isAddress(newSearch)
    setValidSearch(valid)

    if (!valid) {
      return setResultsLoading(false)
    }

    if (valid) {
      // check if address is deployed contract
      // check if bytecode is mech
      // if not mech, check if address is nft collection
      const bytecode = await client.getBytecode({ address: newSearch })
      if (bytecode && bytecode.length > 2) {
        const mechInfo = parseMechBytecode(bytecode)
        if (mechInfo) {
          setResults([
            {
              address: newSearch,
              type: "mech",
            },
          ])
          return
        }

        const nftRes = await fetch(
          `${process.env.REACT_APP_PROXY_URL}/${chainId}/moralis/nft/${newSearch}/metadata`
        )
        if (!nftRes.ok || nftRes.status === 404) {
          // unknown contract, show as account
          setResults([
            {
              address: newSearch,
              type: "account",
            },
          ])
          setResultsLoading(false)
          return
        }

        const nftCollection = await nftRes.json()
        setResults([
          {
            address: newSearch,
            type: "nft",
            name: nftCollection.name,
          },
        ])
        setResultsLoading(false)
      } else {
        // only an EOA
        setResults([
          {
            address: newSearch,
            type: "account",
          },
        ])
        setResultsLoading(false)
      }
    }
  }

  return (
    <div className={classes.searchBar}>
      <svg
        viewBox="0 0 61 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={classes.magnifyingGlass}
      >
        <path
          d="M58 58L37.2886 37.2886M37.2886 37.2886C40.8174 33.7598 43 28.8848 43 23.5C43 12.7304 34.2696 4 23.5 4C12.7304 4 4 12.7304 4 23.5C4 34.2696 12.7304 43 23.5 43C28.8848 43 33.7598 40.8174 37.2886 37.2886Z"
          strokeWidth="8"
        />
      </svg>
      <input
        type="text"
        placeholder="Search by address for accounts, mechs or NFTs"
        className={classes.input}
        value={search}
        onChange={handleSearch}
        spellCheck={false}
        onFocus={(e) => e.target.select()}
      />
      {!validSearch && (
        <div className={classes.invalidSearch}>
          <div className={classes.warning}>!!</div>
          <p>Please use a valid address</p>
        </div>
      )}
      {(resultsLoading || results.length > 0) && (
        <div className={classes.results}>
          {results.length > 0 && <SearchResults results={results} />}
          {resultsLoading && <Loading />}
        </div>
      )}
    </div>
  )
}

export default Search

import { Nft } from "@ankr.com/ankr.js"

import classes from "./NFTItem.module.css"
import Button from "../Button"
import { useEffect, useState } from "react"

interface Props {
  nft: Nft
}

const useTokenUrl = (tokenUrl: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!tokenUrl) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      if (tokenUrl.slice(0, 4) === "http") {
        try {
          const response = await fetch(tokenUrl)
          const data = await response.json()
          setData(data)
          setIsLoading(false)
        } catch (e) {
          setError(e)
          setIsLoading(false)
        }
      } else if (tokenUrl.slice(0, 29) === "data:application/json;base64,") {
        const json = Buffer.from(tokenUrl.slice(29), "base64").toString()
        setData(JSON.parse(json))
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tokenUrl])

  return { isLoading, data, error }
}

const NFTItem: React.FC<Props> = ({ nft }) => {
  const needTokenUrl = !nft.imageUrl
  const { isLoading, data, error } = useTokenUrl(
    needTokenUrl ? nft.tokenUrl : undefined
  )
  return (
    <div className={classes.itemContainer}>
      <div className={classes.header}>
        <p className={classes.tokenName}>
          {nft.name || nft.collectionName || "..."}
        </p>
        {nft.tokenId.length < 5 && (
          <p className={classes.tokenId}>{nft.tokenId || "..."}</p>
        )}
      </div>
      <div className={classes.main}>
        {error && <div className={classes.noImage}></div>}
        {!isLoading && !error && (
          <img
            src={data ? data.image : nft.imageUrl}
            alt={nft.name}
            className={classes.image}
          />
        )}
        <div className={classes.info}></div>
      </div>
      <Button onClick={() => {}} secondary>
        Deploy Mech
      </Button>
    </div>
  )
}

export default NFTItem

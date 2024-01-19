import { useState } from "react"
import { MoralisNFT } from "../../types/Token"

import classes from "./NFTMedia.module.css"

const getIPFSHashFromURL = (url: string) => {
  const match = url.match(
    /^ipfs:\/\/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(\d|\w|\.)+)*$/
  )
  return match ? match[1] : null
}

const NFTMedia = ({ nft }: { nft: MoralisNFT }) => {
  const [imageError, setImageError] = useState(false)
  const metadata = JSON.parse(nft.metadata || "{}")
  const alt = metadata.name || "NFT image"

  let src = ""
  let type = "image/*"

  if (!nft.media) {
    return <div className={classes.noImage}></div>
  }

  switch (nft.media.status) {
    case "success":
      // use media url
      src = nft.media.media_collection.high.url
      type = nft.media.mimetype
      break

    case "host_unavailable":
      // could be an ipfs url or an unreachable url
      const ipfsHash = getIPFSHashFromURL(nft.media.original_media_url)
      if (ipfsHash) {
        src = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
      } else {
        src = nft.media.original_media_url
      }
      break

    default:
      src = nft.media.original_media_url
      break
  }
  return (
    <>
      {(imageError || !src) && <div className={classes.noImage}></div>}
      {!imageError && src && (
        <div className={classes.imageContainer}>
          {type.includes("image") && (
            <img
              src={src}
              alt={alt}
              className={classes.image}
              onError={() => setImageError(true)}
            />
          )}
          {type.includes("video") && (
            <video
              src={src}
              className={classes.image}
              onError={() => setImageError(true)}
              autoPlay
              muted
            />
          )}
        </div>
      )}
    </>
  )
}

export default NFTMedia

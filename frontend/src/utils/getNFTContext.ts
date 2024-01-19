import { MoralisNFT, NFTContext } from "../types/Token"

export const getNFTContext = (nft: MoralisNFT): NFTContext => {
  return {
    tokenAddress: nft.token_address,
    tokenId: nft.token_id,
    contractType: nft.contract_type,
  }
}
export const getNFTContexts = (nfts: MoralisNFT[]): NFTContext[] => {
  return nfts.map(getNFTContext)
}

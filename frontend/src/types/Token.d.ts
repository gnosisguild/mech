export interface NFTContext {
  tokenAddress: string
  tokenId: string
  contractType: NFTType
}

export type NFTType = "ERC721" | "ERC1155"

interface MoralisMediaItem {
  width: number
  height: number
  url: string
}

export interface MoralisMediaCollection {
  status: string
  updateAt: string
  mimetype: string
  parent_hash: string
  media_collection: {
    low: MoralisMediaItem
    medium: MoralisMediaItem
    high: MoralisMediaItem
  }
  original_media_url: string
}

export interface MoralisNFT {
  amount: string
  token_id: string
  token_address: string
  contract_type: NFTType
  owner_of: string
  metadata?: any
  block_number: string
  block_number_minted: string
  name: string
  symbol: string
  token_hash: string
  token_uri: string
  minter_address: string
  verified_collection: boolean
  possible_spam: boolean
  media?: MoralisMediaCollection
}

export interface MoralisFungible {
  token_address: string
  symbol: string
  name: string
  logo?: string
  thumbnail?: string
  decimals: number
  balance: string
  possible_spam?: boolean
}

export interface MoralisCollectionMetadata {
  token_address: string
  name: string
  symbol: string
  contract_type: NFTType
  possible_spam: boolean
  verified_collection: boolean
  synced_at: string
}

export interface MoralisApiListResponse {
  cursor: string
  page: number
  page_size: number
  result: MoralisNFT[] | MoralisFungible[]
}

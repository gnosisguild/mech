export interface NFTContext {
  tokenAddress: string
  tokenId: string
  contractType: NFTType
}

export type NFTType = "ERC721" | "ERC1155"

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

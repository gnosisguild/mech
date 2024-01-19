import { getAddress, hexToNumber } from "viem"
import {
  calculateERC1155ThresholdMechMastercopyAddress,
  calculateERC721TokenboundMechMastercopyAddress,
} from "mech-sdk"

const parseMechBytecode = (rawBytecode: `0x${string}`) => {
  try {
    const mech721Mastercopy = calculateERC721TokenboundMechMastercopyAddress()
    const mech1155Mastercopy = calculateERC1155ThresholdMechMastercopyAddress()
    const bytecode = rawBytecode.slice(2)

    if (!bytecode || !rawBytecode || !(rawBytecode.length > 2)) return null

    const [
      erc1167Header,
      rawImplementationAddress,
      erc1167Footer,
      rawSalt,
      rawChainId,
      rawTokenContract,
      rawTokenId,
    ] = segmentBytecode(bytecode, 10, 20, 15, 32, 32, 32, 32)

    const chainId = hexToNumber(`0x${rawChainId}`, { size: 32 })
    const implementationAddress: `0x${string}` = getAddress(
      `0x${rawImplementationAddress}`
    )
    if (
      mech1155Mastercopy !== implementationAddress ||
      mech721Mastercopy !== implementationAddress
    ) {
      return null
    }

    const salt = hexToNumber(`0x${rawSalt}`, { size: 32 })
    const tokenContract: `0x${string}` = getAddress(
      `0x${rawTokenContract.slice(
        rawTokenContract.length - 40,
        rawTokenContract.length
      )}`
    )
    const tokenId = hexToNumber(`0x${rawTokenId}`, { size: 32 }).toString()

    return {
      erc1167Header,
      implementationAddress,
      erc1167Footer,
      salt,
      tokenId,
      tokenContract,
      chainId,
    }
  } catch (error) {
    throw error
  }
}

export default parseMechBytecode

/**
 * Splits a string into segments of specified lengths.
 *
 * @param input - The input string to split into segments.
 * @param lengths - The lengths of the segments to extract, in bytes.
 * @returns An array containing the extracted segments in the order they were specified.
 *
 * @example
 * const bytecode = "0x1234567890abcdef1234567890abcdef1234567890abcdef";
 * const segments = segmentBytecode(bytecode, 2, 4, 8);
 * console.log(segments); // ["0x", "1234", "567890ab"]
 */
export function segmentBytecode(input: string, ...lengths: number[]): string[] {
  let position = 0
  const segments: string[] = []
  const cleanInput = input.startsWith("0x") ? input.substring(2) : input // Remove "0x" prefix if present

  for (const length of lengths) {
    segments.push(cleanInput.substr(position, length * 2))
    position += length * 2
  }

  return segments
}

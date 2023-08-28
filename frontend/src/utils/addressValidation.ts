import { getAddress } from "viem"

export const validateAddress = (address: string) => {
  try {
    return getAddress(address)
  } catch (e) {
    return ""
  }
}

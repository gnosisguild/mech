import { getAddress } from "ethers/lib/utils"

export const validateAddress = (address: string) => {
  try {
    return getAddress(address)
  } catch (e) {
    return ""
  }
}

import { validateAddress } from "./addressValidation"

export const shortenAddress = (
  address: string,
  visibleDigits: number = 4
): string => {
  const checksumAddress = validateAddress(address)
  const start = checksumAddress.substring(0, visibleDigits + 2)
  const end = checksumAddress.substring(42 - visibleDigits, 42)
  return `${start}...${end}`
}

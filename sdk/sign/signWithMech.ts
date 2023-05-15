import { defaultAbiCoder } from "@ethersproject/abi"
import { Bytes } from "ethers"
import { arrayify, hexlify } from "ethers/lib/utils"

export const signWithMech = (
  mechAddress: string,
  signatureData: string | Bytes
): `0x${string}` => {
  // Produce a signature as bytes of the form:
  // {bytes32 r = mech address}{bytes32 s = 65 (offset to signature data)}{unpadded uint8 v = 0}{bytes32 signature data length}{bytes signature data}

  const offset = 65 // 32 bytes for r + 32 bytes for s data + 1 byte for v
  const r = defaultAbiCoder.encode(["address"], [mechAddress]).slice(2)
  const s = defaultAbiCoder.encode(["uint8"], [offset]).slice(2)
  const v = "00" // v = 0 for contract signature

  const data = hexlify(signatureData).slice(2)
  const dataLength = defaultAbiCoder
    .encode(["uint256"], [arrayify(signatureData).length])
    .slice(2)

  return `0x${r}${s}${v}${dataLength}${data}`
}

import { defineConfig } from "@wagmi/cli"
import { react } from "@wagmi/cli/plugins"
import { erc721ABI } from "wagmi"
import erc721MechArtifact from "../artifacts/contracts/ERC721Mech.sol/ERC721Mech.json"

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "erc721",
      abi: erc721ABI,
    },
    { name: "erc721Mech", abi: erc721MechArtifact.abi as any },
  ],
  plugins: [react()],
})

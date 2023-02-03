import { defineConfig } from "@wagmi/cli"
import { react } from "@wagmi/cli/plugins"
import { erc721ABI } from "wagmi"

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "erc721",
      abi: erc721ABI,
    },
  ],
  plugins: [react()],
})

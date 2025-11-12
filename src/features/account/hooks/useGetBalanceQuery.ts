import { PublicKey } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"
import { useSolana } from "@/hooks/useSolana"

export function useGetBalanceQuery(address?: string) {
  const { connection, cluster } = useSolana()

  return useQuery({
    queryKey: ["solana", "balance", { cluster, address }],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) return 0
      const publicKey = new PublicKey(address)
      const balance = await connection.getBalance(publicKey)
      return balance
    },
  })
}

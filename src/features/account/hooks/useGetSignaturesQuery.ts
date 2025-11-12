import { PublicKey } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"
import { useSolana } from "@/hooks/useSolana"

export function useGetSignaturesQuery(address?: string) {
  const { connection, cluster } = useSolana()

  return useQuery({
    queryKey: ["solana", "signatures", { cluster, address }],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) return []
      const publicKey = new PublicKey(address)
      return connection.getSignaturesForAddress(publicKey)
    },
    refetchInterval: 30_000,
  })
}

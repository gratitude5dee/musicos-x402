import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { useSolana } from "@/hooks/useSolana"

interface EnhancedAuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  walletAddress: string | null
  isWalletAuthenticated: boolean
  isAuthenticated: boolean
  authMethod: "wallet" | "email" | null
  signInWithWallet: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined)

const resolveAuthMethod = (session: Session | null): "wallet" | "email" | null => {
  if (!session?.user) return null

  const metadata = session.user.user_metadata as Record<string, any> | undefined
  const provider = session.user.app_metadata?.provider
  const identities = session.user.identities || []

  if (
    metadata?.wallet_address ||
    metadata?.walletAddress ||
    provider === "wallet" ||
    identities.some((identity) => identity.provider === "wallet")
  ) {
    return "wallet"
  }

  return "email"
}

export const EnhancedAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMethod, setAuthMethod] = useState<"wallet" | "email" | null>(null)
  const { publicKey, connected, connect, disconnect } = useSolana()

  useEffect(() => {
    const initialise = async () => {
      const { data } = await supabase.auth.getSession()
      const initialSession = data.session
      if (initialSession) {
        setSession(initialSession)
        setUser(initialSession.user)
        setAuthMethod(resolveAuthMethod(initialSession))
      }
      setLoading(false)
    }

    initialise()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setAuthMethod(resolveAuthMethod(newSession))
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithWallet = useCallback(async () => {
    if (!connected) {
      await connect().catch((error) => {
        throw error
      })
    }

    if (!window?.solana) {
      throw new Error("No Solana wallet detected in this browser")
    }

    const { error } = await supabase.auth.signInWithWeb3({
      chain: "solana",
      statement: "Sign in to MusicOS",
      nonce: crypto.randomUUID(),
      wallet: window.solana,
    })

    if (error) {
      throw error
    }

    setAuthMethod("wallet")
  }, [connect, connected])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAuthMethod("email")
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    if (connected) {
      await disconnect()
    }
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key)
        }
      })
    }
    setUser(null)
    setSession(null)
    setAuthMethod(null)
  }, [connected, disconnect])

  const isWalletAuthenticated = useMemo(() => {
    if (!session) return false
    if (authMethod === "wallet") return true
    const walletMetadata = (session.user.user_metadata as Record<string, any> | undefined)?.wallet_address ??
      (session.user.user_metadata as Record<string, any> | undefined)?.walletAddress
    if (walletMetadata && publicKey && walletMetadata === publicKey) {
      return true
    }
    return false
  }, [authMethod, publicKey, session])

  const value = useMemo<EnhancedAuthContextType>(() => ({
    user,
    session,
    loading,
    walletAddress: publicKey ?? null,
    isWalletAuthenticated,
    isAuthenticated: !!session,
    authMethod,
    signInWithWallet,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }), [authMethod, isWalletAuthenticated, loading, publicKey, session, signOut, signInWithEmail, signInWithWallet, signUpWithEmail, user])

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>
}

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext)
  if (!context) {
    throw new Error("useEnhancedAuth must be used within an EnhancedAuthProvider")
  }
  return context
}

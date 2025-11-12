import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletAuthCard } from "@/components/auth/WalletAuthCard"
import { useEnhancedAuth } from "@/context/EnhancedAuthContext"
import { motion } from "framer-motion"
import {
  BarChart3,
  Bot,
  Coins,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Sparkles,
  Users,
  Wallet as WalletIcon,
  Zap,
} from "lucide-react"
import CosmicShader from "@/components/ui/shaders/CosmicShader"
import { toast } from "sonner"

const MIN_PASSWORD_LENGTH = 6

export default function AuthPage() {
  const navigate = useNavigate()
  const { loading: authLoading, isAuthenticated, signInWithEmail, signUpWithEmail } = useEnhancedAuth()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/home")
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsProcessing(true)

    try {
      if (isLogin) {
        await signInWithEmail(email, password)
        toast.success("Successfully signed in!")
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords don't match!")
          return
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
          return
        }
        await signUpWithEmail(email, password)
        toast.success("Check your email for the confirmation link!")
        setIsLogin(true)
      }
    } catch (error: any) {
      const message = error?.message ?? "An error occurred during authentication"
      if (message.includes("User already registered")) {
        toast.error("User already exists. Please sign in instead.")
        setIsLogin(true)
      } else if (message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.")
      } else {
        toast.error(message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGuestAccess = () => {
    navigate("/wzrd/studio")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent p-4 text-white">
      <CosmicShader />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="rounded-2xl border border-border/30 bg-background/10 p-10 backdrop-blur-xl shadow-2xl">
          <div className="mb-10 text-center">
            <motion.div
              className="mb-6 flex items-center justify-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">UniversalAI</h1>
            </motion.div>
            <motion.p
              className="text-lg font-medium text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {isLogin ? "Sign in with your wallet or email" : "Create your UniversalAI account"}
            </motion.p>
          </div>

          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wallet">
                <WalletIcon className="mr-2 h-4 w-4" /> Wallet
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="mr-2 h-4 w-4" /> Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="pt-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <WalletAuthCard />
              </motion.div>
            </TabsContent>

            <TabsContent value="email" className="pt-6">
              <motion.form
                onSubmit={handleAuth}
                className="space-y-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Label htmlFor="email" className="mb-3 block text-sm font-medium text-white/90">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10"
                    placeholder="Enter your email address"
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Label htmlFor="password" className="mb-3 block text-sm font-medium text-white/90">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      className="h-12 rounded-xl border-white/10 bg-white/5 pr-12 text-white placeholder:text-white/40 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10"
                      placeholder="Enter your password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors duration-200 hover:text-white"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </motion.button>
                  </div>
                </motion.div>

                {!isLogin && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Label htmlFor="confirmPassword" className="mb-3 block text-sm font-medium text-white/90">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10"
                      placeholder="Confirm your password"
                    />
                  </motion.div>
                )}

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {isLogin ? "Enter UniversalAI" : "Create Account"}
                      </div>
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <button
                    type="button"
                    onClick={() => setIsLogin((previous) => !previous)}
                    className="text-sm font-medium text-primary transition-colors hover:text-accent hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </motion.div>
              </motion.form>
            </TabsContent>
          </Tabs>

          <motion.div
            className="my-8 flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
            <span className="text-sm font-medium text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button
              onClick={handleGuestAccess}
              variant="outline"
              className="h-12 w-full rounded-xl border-white/20 bg-white/5 text-base font-medium text-white transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enter as Guest
              </div>
            </Button>
          </motion.div>

          <motion.div
            className="mt-10 grid grid-cols-4 gap-4 border-t border-border/30 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <FeatureIcon
              icon={<Bot className="h-7 w-7 text-primary transition-colors duration-300 group-hover:text-white" />}
              label="AI Agents"
              gradient="bg-gradient-to-br from-primary/20 to-primary/40"
              borderClass="border border-primary/20 group-hover:border-primary/40"
            />
            <FeatureIcon
              icon={<BarChart3 className="h-7 w-7 text-accent transition-colors duration-300 group-hover:text-white" />}
              label="Analytics"
              gradient="bg-gradient-to-br from-accent/20 to-accent/40"
              borderClass="border border-accent/20 group-hover:border-accent/40"
            />
            <FeatureIcon
              icon={<Coins className="h-7 w-7 text-primary transition-colors duration-300 group-hover:text-white" />}
              label="Treasury"
              gradient="bg-gradient-to-br from-primary/20 to-primary/40"
              borderClass="border border-primary/20 group-hover:border-primary/40"
            />
            <FeatureIcon
              icon={<Users className="h-7 w-7 text-accent transition-colors duration-300 group-hover:text-white" />}
              label="Studio"
              gradient="bg-gradient-to-br from-accent/20 to-accent/40"
              borderClass="border border-accent/20 group-hover:border-accent/40"
            />
          </motion.div>

          <motion.div
            className="mt-8 pt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <p className="text-xs leading-relaxed text-muted-foreground/80">
              By signing in, you agree to our{" "}
              <span className="cursor-pointer text-primary transition-colors duration-200 hover:text-accent hover:underline">
                Terms of Service
              </span>
              {" "}and{" "}
              <span className="cursor-pointer text-primary transition-colors duration-200 hover:text-accent hover:underline">
                Privacy Policy
              </span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function FeatureIcon({
  icon,
  label,
  gradient,
  borderClass,
}: {
  icon: React.ReactNode
  label: string
  gradient: string
  borderClass: string
}) {
  return (
    <motion.div
      className="group flex cursor-pointer flex-col items-center gap-3 text-center"
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${gradient} ${borderClass} backdrop-blur-sm transition-all duration-300`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:text-white">
        {label}
      </span>
    </motion.div>
  )
}

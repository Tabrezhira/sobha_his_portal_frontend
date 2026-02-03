"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Spinner } from "@/components/ui/Spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { useAuthStore } from "@/store/auth"
import { cx } from "@/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { login, isLoading, error, } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"signup" | "forgot" | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login(email, password)
    
    // Get the updated user from the store
    const currentUser = useAuthStore.getState().user
    
    // Redirect based on role
    if (currentUser?.role === "staff") {
      router.replace("/employee")
    } else {
      router.replace("/overview")
    }
  }

  return (
    <div className={cx("flex flex-col gap-6", className)} {...props}>
      <Card className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Login to your account
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email below to login to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="mt-2"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-medium">
                Password
              </Label>
              <button
                type="button"
                onClick={() => {
                  setDialogType("forgot")
                  setDialogOpen(true)
                }}
                className="text-sm text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
              >
                Forgot your password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              required
              className="mt-2"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
  
          </div>
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setDialogType("signup")
                setDialogOpen(true)
              }}
              className="text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              Sign up
            </button>
          </p>
        </form>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "signup" ? "Sign up" : "Forgot your password?"}
            </DialogTitle>
            <DialogDescription>
              Please contact the admin department for assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

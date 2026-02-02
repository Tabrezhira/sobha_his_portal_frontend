"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Sidebar } from "@/components/ui/navigation/Sidebar"
import { useAuthStore } from "@/store/auth"

type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const [hydrated, setHydrated] = useState(false)

  const isLoginRoute = useMemo(() => pathname.startsWith("/login"), [pathname])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isLoginRoute && !token) {
      router.replace("/login")
    }
  }, [hydrated, isLoginRoute, router, token])

  if (!hydrated && !isLoginRoute) {
    return null
  }

  return (
    <>
      {!isLoginRoute && <Sidebar />}
      <main className={!isLoginRoute ? "lg:pl-72" : undefined}>
        {children}
      </main>
    </>
  )
}

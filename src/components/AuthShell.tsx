"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Sidebar } from "@/components/ui/navigation/Sidebar"
import { useAuthStore } from "@/store/auth"

type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const refresh = useAuthStore((state) => state.refresh)
  const [hydrated, setHydrated] = useState(false)
  const [checkedSession, setCheckedSession] = useState(false)
  const offlineToastId = useRef<string | number | null>(null)

  const isLoginRoute = useMemo(() => pathname.startsWith("/login"), [pathname])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    const handleOffline = () => {
      if (offlineToastId.current) return
      offlineToastId.current = toast.error("You are offline")
    }

    const handleOnline = () => {
      if (!offlineToastId.current) return
      toast.dismiss(offlineToastId.current)
      offlineToastId.current = null
      toast.success("You are back online")
    }

    if (typeof window !== "undefined") {
      if (!navigator.onLine) handleOffline()
      window.addEventListener("offline", handleOffline)
      window.addEventListener("online", handleOnline)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("offline", handleOffline)
        window.removeEventListener("online", handleOnline)
      }
    }
  }, [])

  useEffect(() => {
    if (!hydrated || isLoginRoute) return
    if (!token) {
      setCheckedSession(true)
      return
    }
    let cancelled = false
    refresh().then((ok) => {
      if (cancelled) return
      if (!ok) {
        router.replace("/login")
      }
      setCheckedSession(true)
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, isLoginRoute, refresh, router, token])

  useEffect(() => {
    if (!hydrated) return
    if (!checkedSession && !isLoginRoute) return
    if (!isLoginRoute && !token) {
      router.replace("/login")
    }
  }, [checkedSession, hydrated, isLoginRoute, router, token])

  if ((!hydrated || !checkedSession) && !isLoginRoute) {
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

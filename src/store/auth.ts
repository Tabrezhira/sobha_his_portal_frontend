import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"

import { User } from "@/data/schema"

type AuthState = {
  user: User | null
  profile: { name?: string; email?: string } | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  refresh: () => Promise<boolean>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

type LoginResponse = {
  token?: string
  user?: User
  data?:
    | User
    | {
        token?: string
        user?: User
        data?: User
      }
}

const isUser = (value: unknown): value is User => {
  return Boolean(
    value &&
      typeof value === "object" &&
      "locationId" in value &&
      typeof (value as { locationId?: string }).locationId === "string",
  )
}

const getAuthFromResponse = (response: LoginResponse) => {
  const token =
    response.token ??
    (typeof response.data === "object" && response.data
      ? (response.data as { token?: string }).token
      : undefined) ??
    null

  const nestedData =
    typeof response.data === "object" && response.data
      ? (response.data as { user?: User; data?: User })
      : undefined

  const candidate =
    response.user ??
    nestedData?.user ??
    nestedData?.data ??
    (isUser(response.data) ? response.data : undefined)

  const user = candidate ?? null

  return { token, user }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const baseUrl = process.env.NEXT_PUBLIC_CURD_API_URL
          const loginUrl = baseUrl
            ? `${baseUrl.replace(/\/$/, "")}/auth/login`
            : "/auth/login"
          const response = await axios.post(loginUrl, { email, password })
          const { token, user } = getAuthFromResponse(response.data)

          if (!token) {
            throw new Error("Token not found in response")
          }

          set({
            token,
            user,
            profile: user
              ? { name: user.name, email: user.email }
              : { email },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: "Invalid credentials or server error.",
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
            profile: null,
          })
          throw error
        }
      },
      refresh: async () => {
        const { token } = get()
        if (!token) return false

        set({ isLoading: true, error: null })
        try {
          const baseUrl = process.env.NEXT_PUBLIC_CURD_API_URL
          const refreshUrl = baseUrl
            ? `${baseUrl.replace(/\/$/, "")}/auth/refresh`
            : "/auth/refresh"

          const response = await axios.post(
            refreshUrl,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          )

          const { token: newToken, user } = getAuthFromResponse(response.data)
          if (!newToken || !user) {
            throw new Error("Refresh response missing auth data")
          }

          set({
            token: newToken,
            user,
            profile: { name: user.name, email: user.email },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          set({
            token: null,
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error: "Session expired. Please login again.",
          })
          return false
        }
      },
      logout: () => {
        set({
          token: null,
          user: null,
          profile: null,
          isAuthenticated: false,
          error: null,
        })
      },
      setUser: (user) =>
        set({
          user,
          profile: user ? { name: user.name, email: user.email } : null,
          isAuthenticated: Boolean(user) || false,
        }),
      setToken: (token) =>
        set({ token, isAuthenticated: Boolean(token) || false }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        profile: state.profile,
      }),
    },
  ),
)

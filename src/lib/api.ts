import axios from "axios"

type ApiClientOptions = {
  baseURL: string
}

const createApiClient = ({ baseURL }: ApiClientOptions) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  })

  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("auth-store")
      if (token) {
        try {
          const parsed = JSON.parse(token)
          const authToken = parsed?.state?.token
          if (authToken) {
            config.headers = config.headers ?? {}
            config.headers.Authorization = `Bearer ${authToken}`
          }
        } catch {
          // ignore malformed storage
        }
      }
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  )

  return client
}

const curdBaseUrl = process.env.NEXT_PUBLIC_CURD_API_URL
const dropdownBaseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL

if (!curdBaseUrl) {
  throw new Error("NEXT_PUBLIC_CURD_API_URL is not set")
}

if (!dropdownBaseUrl) {
  throw new Error("NEXT_PUBLIC_DROPDOWN_API_URL is not set")
}

export const api = createApiClient({ baseURL: curdBaseUrl })
export const dropdownApi = createApiClient({ baseURL: dropdownBaseUrl })

export { createApiClient }

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { DropdownResponse } from "@/data/schema"

type DropdownDataCache = {
  [key: string]: {
    data: string[]
    fetchedAt: number
  }
}

type DropdownState = {
  categories: string[]
  dropdownData: DropdownDataCache
  isLoading: boolean
  loadingCategory: string | null
  error: string | null
  lastFetchedAt: number | null
  fetchCategories: (baseUrl?: string) => Promise<void>
  fetchDropdownData: (categoryName: string, baseUrl?: string) => Promise<string[]>
  setCategories: (categories: string[]) => void
}

const normalizeBaseUrl = (baseUrl?: string) =>
  baseUrl ? baseUrl.replace(/\/$/, "") : ""

export const useDropdownStore = create<DropdownState>()(
  persist(
    (set, get) => ({
      categories: [],
      dropdownData: {},
      isLoading: false,
      loadingCategory: null,
      error: null,
      lastFetchedAt: null,
      fetchCategories: async (baseUrl) => {
        const { categories, isLoading } = get()
        if (categories.length > 0 || isLoading) return

        const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
        if (!normalizedBaseUrl) {
          set({ error: "Dropdown API URL is not configured." })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const response = await fetch(
            `${normalizedBaseUrl}/professions/categories`,
          )
          if (!response.ok) {
            throw new Error("Failed to load dropdown categories")
          }

          const payload = (await response.json()) as DropdownResponse
          const data = Array.isArray(payload?.data)
            ? payload.data.filter(Boolean)
            : []

          set({ categories: data, lastFetchedAt: Date.now() })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unexpected error",
          })
        } finally {
          set({ isLoading: false })
        }
      },
      fetchDropdownData: async (categoryName, baseUrl) => {
        const { dropdownData } = get()

        // Check cache
        if (
          dropdownData[categoryName] &&
          Date.now() - dropdownData[categoryName].fetchedAt < 3600000
        ) {
          return dropdownData[categoryName].data
        }

        const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
        if (!normalizedBaseUrl) {
          set({ error: "Dropdown API URL is not configured." })
          return []
        }

        set({ loadingCategory: categoryName })
        try {
          const response = await fetch(
            `${normalizedBaseUrl}/professions/category/${encodeURIComponent(categoryName)}`,
          )
          if (!response.ok) {
            throw new Error(`Failed to load data for ${categoryName}`)
          }

          const payload = await response.json()
          const data = Array.isArray(payload?.data) ? payload.data : []

          set((state) => ({
            dropdownData: {
              ...state.dropdownData,
              [categoryName]: {
                data,
                fetchedAt: Date.now(),
              },
            },
          }))

          return data
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unexpected error",
          })
          return []
        } finally {
          set({ loadingCategory: null })
        }
      },
      setCategories: (categories) => set({ categories }),
    }),
    {
      name: "dropdown-store",
      partialize: (state) => ({
        categories: state.categories,
        dropdownData: state.dropdownData,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
)

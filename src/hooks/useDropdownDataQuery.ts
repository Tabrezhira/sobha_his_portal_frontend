import { useQuery } from "@tanstack/react-query"

const DROPDOWN_API_URL =
  process.env.NEXT_PUBLIC_DROPDOWN_API_URL || "http://localhost:2000/api"

interface DropdownResponse {
  success: boolean
  data: string[]
}

/**
 * React Query hook to fetch dropdown data from backend
 * @param dropdownName - The name of the dropdown category to fetch
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query object with data, isLoading, and error
 */
export const useDropdownDataQuery = (
  dropdownName: string,
  enabled: boolean = true,
) => {
  return useQuery<string[], Error>({
    queryKey: ["dropdown", dropdownName],
    queryFn: async () => {
      if (!dropdownName) {
        return []
      }
      
      try {
        const response = await fetch(
          `${DROPDOWN_API_URL}/professions/category/${encodeURIComponent(dropdownName)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          console.error(`Failed to fetch dropdown ${dropdownName}: ${response.status}`)
          throw new Error(`Failed to load data for ${dropdownName}`)
        }

        const payload: DropdownResponse = await response.json()
        return Array.isArray(payload?.data) ? payload.data : []
      } catch (error) {
        console.error(`Error fetching dropdown ${dropdownName}:`, error)
        throw error
      }
    },
    staleTime: 3600000, // 1 hour
    gcTime: 3600000, // 1 hour (formerly cacheTime)
    enabled: enabled && Boolean(dropdownName),
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook to fetch multiple dropdown categories at once
 * @param dropdownNames - Array of dropdown category names to fetch
 * @param enabled - Whether to enable the queries (default: true)
 * @returns Object with query results keyed by dropdown name
 */
export const useMultipleDropdowns = (
  dropdownNames: string[],
  enabled: boolean = true,
) => {
  const queries = dropdownNames.map((name) =>
    useDropdownDataQuery(name, enabled),
  )

  const data: Record<string, string[]> = {}
  let isLoading = false
  let error: Error | null = null

  queries.forEach((query, index) => {
    data[dropdownNames[index]] = query.data || []
    if (query.isLoading) isLoading = true
    if (query.error) error = query.error
  })

  return { data, isLoading, error, queries }
}

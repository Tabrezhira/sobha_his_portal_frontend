import { useEffect, useState } from "react"
import { useDropdownStore } from "@/store/dropdown"

const DROPDOWN_API_URL =
  process.env.NEXT_PUBLIC_DROPDOWN_API_URL || "http://localhost:2000/api"

export const useDropdownData = (dropdownName: string) => {
  const { dropdownData, loadingCategory, error, fetchDropdownData } =
    useDropdownStore()

  const [data, setData] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchDropdownData(dropdownName, DROPDOWN_API_URL)
      setData(result)
    }

    loadData()
  }, [dropdownName, fetchDropdownData])

  return {
    data: dropdownData[dropdownName]?.data || data,
    isLoading: loadingCategory === dropdownName,
    error,
  }
}

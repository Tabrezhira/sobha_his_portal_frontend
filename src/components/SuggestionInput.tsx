"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"

type DropdownApiItem = {
    _id: string
    name: string
    category: string
}

type DropdownApiResponse = {
    success: boolean
    count?: number
    data: DropdownApiItem[]
}

const DEFAULT_DROPDOWN_LIMIT = 5

export const useDropdownSearch = (
    baseUrl: string | undefined,
    category: string,
    query: string,
) => {
    const [items, setItems] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const trimmedQuery = query.trim()

        if (!trimmedQuery || !baseUrl) {
            setItems([])
            return
        }

        const controller = new AbortController()
        const handle = setTimeout(async () => {
            setLoading(true)
            try {
                const url = new URL(`${baseUrl}/professions`)
                url.searchParams.set("category", category)
                url.searchParams.set("search", trimmedQuery)
                url.searchParams.set("limit", String(DEFAULT_DROPDOWN_LIMIT))

                const response = await fetch(url.toString(), {
                    signal: controller.signal,
                })

                if (!response.ok) {
                    setItems([])
                    return
                }

                const payload = (await response.json()) as DropdownApiResponse
                const names = Array.isArray(payload?.data)
                    ? payload.data
                        .map((item) => item?.name)
                        .filter((name): name is string => Boolean(name))
                    : []
                setItems(names)
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    setItems([])
                }
            } finally {
                setLoading(false)
            }
        }, 250)

        return () => {
            clearTimeout(handle)
            controller.abort()
        }
    }, [baseUrl, category, query])

    return { items, loading }
}

export type SuggestionInputProps = {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    category: string
    required?: boolean
    type?: string
    placeholder?: string
}

export const SuggestionInput = ({
    id,
    label,
    value,
    onChange,
    category,
    required,
    type = "text",
    placeholder,
}: SuggestionInputProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
    const { items, loading } = useDropdownSearch(baseUrl, category, value)
    const [open, setOpen] = useState(false)
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (blurTimeout.current) {
                clearTimeout(blurTimeout.current)
            }
        }
    }, [])

    const closeWithDelay = () => {
        if (blurTimeout.current) {
            clearTimeout(blurTimeout.current)
        }
        blurTimeout.current = setTimeout(() => setOpen(false), 150)
    }

    const handleSelect = (item: string) => {
        onChange(item)
        setOpen(false)
    }

    const showMenu = open && (loading || items.length > 0)

    return (
        <div className="relative">
            <Label htmlFor={id} className="font-medium">
                {label}
                {required ? " *" : ""}
            </Label>
            <Input
                id={id}
                type={type}
                className=""
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={closeWithDelay}
                required={required}
                autoComplete="off"
                placeholder={placeholder}
            />
            {showMenu && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    {loading && (
                        <div className="px-3 py-2 text-xs text-gray-500">
                            Loading suggestions...
                        </div>
                    )}
                    {items.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                            onMouseDown={(event) => {
                                event.preventDefault()
                                handleSelect(item)
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

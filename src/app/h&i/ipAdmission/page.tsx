"use client"

import { Card } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { RiAddLine, RiArrowRightSLine, RiArrowLeftSLine, RiCheckLine, RiEdit2Line } from "@remixicon/react"
import { useState } from "react"
import { IIpAdmission } from "@/data/h&Ischema"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { DataTable } from "./_components/table/DataTable"
import { columns } from "./_components/table/columns"

const options = [
	{
		title: "New Visit",
		description: "Create new IP admission",
		icon: RiAddLine,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-amber-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:group-hover:bg-amber-500/30",
		action: "new-visit",
	},
	{
		title: "Repeat Visit",
		description: "Follow-up / revisit",
		icon: RiEdit2Line,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-blue-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500/30",
		action: "repeat-visit",
	},
	{
		title: "Mark Discharged",
		description: "Close admission",
		icon: RiCheckLine,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-emerald-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500/30",
		action: "mark-discharged",
	},
	{
		title: "Change Case Type",
		description: "Normal / Critical",
		icon: RiArrowRightSLine,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-violet-400 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-violet-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 group-hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:group-hover:bg-violet-500/30",
		action: "change-case-type",
	},
]

export default function Page() {
    const [activeAction, setActiveAction] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const { token } = useAuthStore()

    const { data: admissions = [], isLoading } = useQuery<IIpAdmission[]>({
        queryKey: ["ipAdmissions", search, token],
        queryFn: async () => {
            const response = await api.get("/hospital/manager/discharge-status", {
                params: { q: search || undefined },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return Array.isArray(response?.data?.data) ? response.data.data : []
        },
        enabled: !!activeAction && !!token,
        staleTime: 5 * 60 * 1000,
    })

    const handleActionClick = (action: string) => {
        setActiveAction(action)
        setSearch("")
    }

    const formatDate = (date?: Date | string) => {
        if (!date) return "-"
        return new Date(date).toLocaleDateString()
    }

    const getActionTitle = () => {
        return options.find((opt) => opt.action === activeAction)?.title || ""
    }

    // Show table view
    if (activeAction) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setActiveAction(null)
                            setSearch("")
                        }}
                        className="gap-2"
                    >
                        <RiArrowLeftSLine className="size-4" />
                        Back
                    </Button>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                        {getActionTitle()}
                    </h2>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                        <div className="p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-50"></div>
                                    <span className="ml-2 text-gray-500">Loading...</span>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={admissions}
                                    onSearch={setSearch}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show options grid
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    IP Admission
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {options.map((option) => (
                        <button
                            key={option.title}
                            type="button"
                            className="group"
                            onClick={() => handleActionClick(option.action)}
                        >
                            <Card className={option.cardClass}>
                                <span className={option.iconClass}>
                                    <option.icon className="size-7" />
                                </span>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
                                    {option.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {option.description}
                                </p>
                            </Card>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
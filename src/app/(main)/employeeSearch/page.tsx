"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/Table"
import { dropdownApi } from "@/lib/api"
import { Patient } from "@/data/schema"

export default function EmployeeSearchPage() {
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["employeeSearch", searchTerm],
        queryFn: async () => {
            if (!searchTerm) return []
            const response = await dropdownApi.get("/patients/all", { params: { q: searchTerm } })

            // Handle various API response structures
            let payload = []
            if (Array.isArray(response.data)) {
                payload = response.data
            } else if (response.data?.items && Array.isArray(response.data.items)) {
                payload = response.data.items
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                payload = response.data.data
            }

            return payload as Patient[]
        },
        enabled: !!searchTerm,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchTerm(searchInput.trim())
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
                    Employee Search
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by Employee ID, Name, Emirates ID, or Insurance ID..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full max-w-md"
                        />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isFetching || isLoading}>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </form>

                <div className="mt-8">
                    {error ? (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                            Failed to fetch employee data. Please try again.
                        </div>
                    ) : isLoading && isFetching ? (
                        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            Searching...
                        </div>
                    ) : !searchTerm ? (
                        <div className="text-center py-10 text-gray-500">
                            Enter an employee ID, name, or Emirates ID to search.
                        </div>
                    ) : data?.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No employees found matching &quot;{searchTerm}&quot;.
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Employee ID</TableHeaderCell>
                                    <TableHeaderCell>Patient Name</TableHeaderCell>
                                    <TableHeaderCell>Emirates ID</TableHeaderCell>
                                    <TableHeaderCell>Insurance ID</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map((patient) => (
                                    <TableRow key={patient._id || patient.empId}>
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                                            {patient.empId}
                                        </TableCell>
                                        <TableCell>{patient.PatientName}</TableCell>
                                        <TableCell>{patient.emiratesId || "-"}</TableCell>
                                        <TableCell>{patient.insuranceId || "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    )
}
